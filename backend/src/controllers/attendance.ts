import { type Request, type Response } from "express";
import Attendance from "../models/attendance.ts";
import User from "../models/user.ts";
import Trade from "../models/trade.ts";
import { inngest } from "../inngest/index.ts";
import { logActivity } from "../utils/activitieslog.ts";

// @desc    Submit Attendance (Student)
// @route   POST /api/attendance/submit
export const submitAttendance = async (req: Request, res: Response) => {
  try {
    const {
      totalWorkingDays,
      daysPresent,
      monthNumber,
      year,
      academicYear,
    } = req.body;

    const studentId = (req as any).user._id;

    // 🔒 Validation
    if (
      totalWorkingDays == null ||
      daysPresent == null ||
      !monthNumber ||
      !year
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (daysPresent > totalWorkingDays) {
      return res
        .status(400)
        .json({ message: "daysPresent cannot exceed totalWorkingDays" });
    }

    // 🔁 Month Mapping (ADDED)
    const monthMap: Record<number, string> = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    if (!monthMap[monthNumber]) {
      return res.status(400).json({ message: "Invalid monthNumber" });
    }

    const month = `${monthMap[monthNumber]} ${year}`;

    // 👤 Fetch student
    const student = await User.findById(studentId);
    if (!student || !student.studentTrade) {
      return res.status(400).json({ message: "Student trade not found" });
    }

    // 🔍 Check existing
    let attendance = await Attendance.findOne({
      student: studentId,
      monthNumber,
      year,
      academicYear,
    });

    if (attendance) {
      attendance.totalWorkingDays = totalWorkingDays;
      attendance.daysPresent = daysPresent;
      attendance.month = month; // keep consistent
      attendance = await attendance.save();
    } else {
      attendance = await Attendance.create({
        student: studentId,
        studentTrade: student.studentTrade,
        academicYear,
        totalWorkingDays,
        daysPresent,
        month,
        monthNumber,
        year,
        institute: student.institute || (req as any).instituteId,
      });
    }

    // 📝 Activity log
    await logActivity({
      userId: studentId,
      action: "Submitted Attendance",
      details: `Month: ${month}, Percentage: ${attendance.percentage}%`,
    });

    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const {
      studentTrade,
      monthNumber,
      year,
      minPercentage,
      maxPercentage,
    } = req.query;

    const user = (req as any).user;
    const instituteId = (req as any).instituteId;
    const query: any = {};

    if (instituteId) {
      query.institute = instituteId;
    }

    // 👨‍🏫 Teacher restriction
    if (user.role === "teacher") {
      const managedTrade = await Trade.findOne({ tradeTeacher: user._id });
      if (!managedTrade) return res.json([]);

      query.studentTrade = managedTrade._id;
    } else if (studentTrade) {
      query.studentTrade = studentTrade;
    }

    // 📅 Filters
    if (monthNumber) query.monthNumber = Number(monthNumber);
    if (year) query.year = Number(year);

    // 📊 Percentage filter
    if (minPercentage || maxPercentage) {
      query.percentage = {};
      if (minPercentage) query.percentage.$gte = Number(minPercentage);
      if (maxPercentage) query.percentage.$lte = Number(maxPercentage);
    }

    const records = await Attendance.find(query)
      .populate("student", "name email")
      .populate("studentTrade", "name")
      .sort({ year: -1, monthNumber: -1 });

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAttendance = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user._id;

    const records = await Attendance.find({ student: studentId })
      .populate("studentTrade", "name")
      .sort({ year: -1, monthNumber: -1 });

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Manual Attendance Notice
// @route   POST /api/attendance/notify/:id
export const sendAttendanceNotice = async (req: Request, res: Response) => {
  try {
    const instituteId = (req as any).instituteId;
    let attendance = await Attendance.findById(req.params.id).populate("student", "name email");
    
    let student: any;
    let percentage: number;
    let details: string;

    if (attendance) {
      if (instituteId && attendance.institute && attendance.institute.toString() !== instituteId.toString()) {
        return res.status(403).json({ message: "Not authorized to send notices for other institutes" });
      }
      student = attendance.student as any;
      percentage = attendance.percentage;
      details = `To: ${student.name}, Month: ${attendance.month}`;
    } else {
      // Try to treat req.params.id as student ID
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Student or Attendance record not found" });
      }
      if (instituteId && user.institute && user.institute.toString() !== instituteId.toString()) {
        return res.status(403).json({ message: "Not authorized to send notices for other institutes" });
      }
      student = user;
      
      // Calculate average attendance percentage across all months
      const studentRecords = await Attendance.find({ student: user._id });
      if (studentRecords.length === 0) {
        return res.status(400).json({ message: "No attendance records found for this student" });
      }
      const totalWorking = studentRecords.reduce((acc, r) => acc + r.totalWorkingDays, 0);
      const totalPresent = studentRecords.reduce((acc, r) => acc + r.daysPresent, 0);
      percentage = totalWorking > 0 ? Math.round((totalPresent / totalWorking) * 100) : 0;
      details = `To: ${student.name}, Average (All Months)`;
    }

    await inngest.send({
      name: "attendance/low-notice",
      data: {
        attendanceId: attendance ? attendance._id : undefined,
        studentEmail: student.email,
        studentName: student.name,
        percentage: percentage,
      },
    });

    await logActivity({
      userId: (req as any).user._id,
      action: "Sent Attendance Notice",
      details: details,
    });

    res.json({ message: "Notification sent successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get Student Average Attendance
// @route   GET /api/attendance/average

// export const getStudentAverageAttendance = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const {  } = req.query;

//     const user = (req as any).user;
//     const matchQuery: any = {};

//     // 👨‍🏫 Teacher restriction
//     if (user.role === "teacher") {
//       const managedTrade = await Trade.findOne({
//         tradeTeacher: user._id,
//       });

//       if (!managedTrade) {
//         return res.json([]);
//       }

//       matchQuery.studentTrade = managedTrade._id;
//     } else if (studentTrade) {
//       matchQuery.studentTrade = studentTrade;
//     }

//     // 🎓 Filter by student
//     if (studentId) {
//       matchQuery.student = studentId;
//     }

//     // 📅 Filter by year
//     if (year) {
//       matchQuery.year = Number(year);
//     }

//     // 📊 Aggregate average attendance
//     const averageAttendance = await Attendance.aggregate([
//       {
//         $match: matchQuery,
//       },
//       {
//         $group: {
//           _id: "$student",
//           averagePercentage: {
//             $avg: "$percentage",
//           },
//           totalMonths: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "student",
//         },
//       },
//       {
//         $unwind: "$student",
//       },
//       {
//         $project: {
//           _id: 0,
//           studentId: "$student._id",
//           studentName: "$student.name",
//           studentEmail: "$student.email",
//           averagePercentage: {
//             $round: ["$averagePercentage", 2],
//           },
//           totalMonths: 1,
//         },
//       },
//       {
//         $sort: {
//           averagePercentage: -1,
//         },
//       },
//     ]);

//     res.json(averageAttendance);
//   } catch (error: any) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };