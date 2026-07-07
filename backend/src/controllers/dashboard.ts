import { type Request, type Response } from "express";
import User from "../models/user.ts";
import Trade from "../models/trade.ts";
import Exam from "../models/exam.ts";
import Submission from "../models/submission.ts";
import ActivityLog from "../models/activitieslog.ts";
import Attendance from "../models/attendance.ts";
import HostelApplication from "../models/hostel.ts";
import Institute from "../models/institute.ts";

import Timetable from "../models/timetable.ts";

// Helper to get day name (e.g., "Monday")
const getTodayName = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long" });

// @desc    Get Dashboard Statistics (Role Based)
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let stats = {};
    // Get last 5 activities system-wide (Super Admin), institute-wide (Admin), or personal (Others)
    let activityQuery: any = {};
    if (user.role === "super_admin") {
      activityQuery = {};
    } else if (user.role === "admin") {
      if ((req as any).instituteId) {
        activityQuery.institute = (req as any).instituteId;
      }
    } else {
      activityQuery.user = user._id;
    }

    const recentActivities = await ActivityLog.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const formattedActivity = recentActivities.map(
      (log) =>
        `${log.user ? (log.user as any).name : "System"}: ${log.action} (${new Date(
          log.createdAt as any
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
    );

    if (user.role === "super_admin") {
      const totalInstitutes = await Institute.countDocuments({});
      const activeInstitutes = await Institute.countDocuments({ isActive: true });
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalTeachers = await User.countDocuments({ role: "teacher" });
      const activeExams = await Exam.countDocuments({ isActive: true });

      stats = {
        totalInstitutes,
        activeInstitutes,
        totalStudents,
        totalTeachers,
        activeExams,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "admin") {
      const filter: any = {};
      if ((req as any).instituteId) {
        filter.institute = (req as any).instituteId;
      }

      const totalStudents = await User.countDocuments({ role: "student", ...filter });
      const totalTeachers = await User.countDocuments({ role: "teacher", ...filter });
      const activeExams = await Exam.countDocuments({ isActive: true, ...filter });

      // Mocking Attendance
      const avgAttendance = "94.5%";

      stats = {
        totalStudents,
        totalTeachers,
        activeExams,
        avgAttendance,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "teacher") {
      // 1. Count trades assigned to teacher
      const managedTrade = await Trade.findOne({ tradeTeacher: user._id });
      const myTradesCount = managedTrade ? 1 : 0;

      // 1.1 Count students in that trade
      let myStudentsCount = 0;
      if (managedTrade) {
        myStudentsCount = await User.countDocuments({
          role: "student",
          studentTrade: managedTrade._id,
        });
      }

      // 2. Pending Grading: Submissions for my exams that have no score yet
      // First find exams created by this teacher
      const myExams = await Exam.find({ teacher: user._id }).select("_id");
      const myExamIds = myExams.map((exam) => exam._id);
      const pendingGrading = await Submission.countDocuments({
        exam: { $in: myExamIds },
        score: 0, // Assuming 0 or null means ungraded
      });

      // 3. Teacher's Today Schedule (Across all trades, Published Only)
      const today = getTodayName();
      const allTimetables = await Timetable.find({ isPublished: true })
        .populate("trade", "name")
        .populate("schedule.periods.subject", "name");

      const teacherSchedule: any[] = [];
      allTimetables.forEach((tt) => {
        const daySched = tt.schedule.find((s: any) => s.day === today);
        if (daySched) {
          daySched.periods.forEach((period: any) => {
            if (period.teacher.toString() === user._id.toString()) {
              teacherSchedule.push({
                ...period.toObject(),
                tradeName: (tt.trade as any).name,
              });
            }
          });
        }
      });

      // Sort by start time
      teacherSchedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

      stats = {
        myTradesCount,
        myStudentsCount,
        pendingGrading,
        todaySchedule: teacherSchedule,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "student") {
      // 1. Assignments/Exams Due
      const nextExam = await Exam.findOne({
        trade: user.studentTrade,
        dueDate: { $gte: new Date() },
      }).sort({ dueDate: 1 });

      const pendingAssignments = await Exam.countDocuments({
        trade: user.studentTrade,
        isActive: true,
        dueDate: { $gte: new Date() },
      });

      // 2. Real Attendance Calculation
      const attendanceRecords = await Attendance.find({ student: user._id });
      let myAttendance = "N/A";
      if (attendanceRecords.length > 0) {
        const totalPresent = attendanceRecords.reduce(
          (acc, rec) => acc + rec.daysPresent,
          0
        );
        const totalWorking = attendanceRecords.reduce(
          (acc, rec) => acc + rec.totalWorkingDays,
          0
        );
        myAttendance =
          totalWorking > 0
            ? `${Math.round((totalPresent / totalWorking) * 100)}%`
            : "0%";
      }

      // 3. Hostel Status
      const hostelApp = await HostelApplication.findOne({ student: user._id });
      const hostelStatus = hostelApp ? hostelApp.status : "Not Applied";

      // 4. Today's Schedule (Published Only)
      const today = getTodayName();
      const timetable = await Timetable.findOne({
        trade: user.studentTrade,
        isPublished: true,
      }).populate("schedule.periods.subject", "name");

      const todaySchedule = timetable?.schedule.find((s) => s.day === today);

      stats = {
        myAttendance,
        pendingAssignments,
        nextExam: nextExam?.title || "No upcoming exams",
        nextExamDate: nextExam
          ? new Date(nextExam.dueDate).toLocaleDateString()
          : "",
        hostelStatus,
        todaySchedule: todaySchedule?.periods || [],
        recentActivity: formattedActivity,
      };
    }
    res.json(stats);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
