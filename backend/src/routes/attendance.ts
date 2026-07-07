import express from "express";
import {
  submitAttendance,
  getAttendanceRecords,
  getMyAttendance,
  sendAttendanceNotice,
  // getStudentAverageAttendance
} from "../controllers/attendance.ts";
import { protect, authorize } from "../middleware/auth.ts";

const attendanceRouter = express.Router();

attendanceRouter.post(
  "/submit",
  protect,
  authorize(["student"]),
  submitAttendance
);

attendanceRouter.post(
  "/notify/:id",
  protect,
  authorize(["super_admin", "admin", "teacher"]),
  sendAttendanceNotice
);

attendanceRouter.get(
  "/",
  protect,
  authorize(["super_admin", "admin", "teacher"]),
  getAttendanceRecords
);

attendanceRouter.get(
  "/me",
  protect,
  authorize(["student"]),
  getMyAttendance
);

// attendanceRouter.get("/average_attendance", protect,authorize(["super_admin", "admin", "teacher"]),getStudentAverageAttendance)

export default attendanceRouter;
