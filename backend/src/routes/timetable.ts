import { generateTimetable, getTimetable, publishTimetable, getTeacherSchedule } from "../controllers/timetable.ts";
import { protect, authorize } from "../middleware/auth.ts";
import express from "express";

const timeRouter = express.Router();

// Get personal schedule for teachers
timeRouter.get("/teacher/me", protect, authorize(["teacher", "super_admin", "admin"]), getTeacherSchedule);

// Generate: Admin only (costs money/resources)
timeRouter.post("/generate", protect, authorize(["super_admin", "admin"]), generateTimetable);

// View: Everyone (Students need to see their schedule)
timeRouter.get("/:classId", protect, getTimetable);

// Publish: Admin only
timeRouter.patch("/:classId/publish", protect, authorize(["super_admin", "admin"]), publishTimetable);

export default timeRouter;
