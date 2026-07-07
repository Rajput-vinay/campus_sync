import { type Request, type Response } from "express";
import { logActivity } from "../utils/activitieslog.ts";
import { inngest } from "../inngest/index.ts";
import Timetable from "../models/timetable.ts";
import Trade from "../models/trade.ts";

// @desc    Generate a Timetable using AI
// @route   POST /api/timetables/generate
// @access  Private/Admin
export const generateTimetable = async (req: Request, res: Response) => {
  try {
    const { tradeId, academicYearId, settings } = req.body;
    const instituteId = (req as any).instituteId;

    // Validate that the trade belongs to the user's institute ID
    const query: any = { _id: tradeId };
    if (instituteId) {
      query.institute = instituteId;
    }
    const tradeExists = await Trade.findOne(query);
    if (!tradeExists) {
      return res.status(404).json({ message: "Trade not found in this institute" });
    }

    await inngest.send({
      name: "generate/timetable",
      data: {
        tradeId,
        academicYearId,
        settings,
      },
    });
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Requested timetable generation for trade ID: ${tradeId}`,
    });
    res.status(200).json({ message: "Timetable generation initiated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get Timetable by Trade
// @route   GET /api/timetables/:tradeId
export const getTimetable = async (req: Request, res: Response) => {
  try {
    const query: any = { trade: req.params.classId };
    const instituteId = (req as any).instituteId;
    if (instituteId) {
      query.institute = instituteId;
    }

    const timetable = await Timetable.findOne(query)
      .populate("schedule.periods.subject", "name code")
      .populate("schedule.periods.teacher", "name email");

    if (!timetable)
      return res.status(404).json({ message: "Timetable not found" });

    // Students can only see published timetables
    const user = (req as any).user;
    if (user.role === "student" && !timetable.isPublished) {
      return res.status(403).json({ message: "Timetable is not yet published" });
    }

    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Timetable Publish Status
// @route   PATCH /api/timetables/:tradeId/publish
export const publishTimetable = async (req: Request, res: Response) => {
  try {
    const query: any = { trade: req.params.classId };
    const instituteId = (req as any).instituteId;
    if (instituteId) {
      query.institute = instituteId;
    }

    const timetable = await Timetable.findOne(query);

    if (!timetable)
      return res.status(404).json({ message: "Timetable not found" });

    timetable.isPublished = !timetable.isPublished;
    await timetable.save();

    await logActivity({
      userId: (req as any).user._id,
      action: `${timetable.isPublished ? "Published" : "Unpublished"} timetable for trade ID: ${req.params.classId}`,
    });

    res.json({
      message: `Timetable ${timetable.isPublished ? "published" : "unpublished"} successfully`,
      isPublished: timetable.isPublished,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Teacher's Personal Weekly Schedule
// @route   GET /api/timetables/teacher/me
export const getTeacherSchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const instituteId = (req as any).instituteId;

    // Find all published timetables in the current institute scope
    const query: any = { isPublished: true };
    if (instituteId) {
      query.institute = instituteId;
    }

    const allTimetables = await Timetable.find(query)
      .populate("trade", "name")
      .populate("schedule.periods.subject", "name code");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weeklySchedule = days.map((day) => {
      const dayPeriods: any[] = [];

      allTimetables.forEach((tt) => {
        const dayData = tt.schedule.find(
          (s) => s.day.toLowerCase() === day.toLowerCase()
        );
        if (dayData) {
          dayData.periods.forEach((p: any) => {
            if (p.teacher.toString() === userId.toString()) {
              dayPeriods.push({
                ...p.toObject(),
                tradeName: (tt.trade as any).name,
              });
            }
          });
        }
      });

      // Sort periods by start time
      dayPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));

      return {
        day,
        periods: dayPeriods,
      };
    });

    res.json({ schedule: weeklySchedule });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
