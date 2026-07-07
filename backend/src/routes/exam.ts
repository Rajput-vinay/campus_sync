import express from "express";
import {
  triggerExamGeneration,
  getExams,
  submitExam,
  getExamById,
  toggleExamStatus,
  getExamResult,
  getMyResults,
  getExamSubmissions,
} from "../controllers/exam.ts";
import { protect, authorize } from "../middleware/auth.ts";

const examRouter = express.Router();

examRouter.post(
  "/generate",
  protect,
  authorize(["super_admin", "teacher", "admin"]),
  triggerExamGeneration
);

examRouter.get(
  "/",
  protect,
  authorize(["super_admin", "teacher", "student", "admin"]),
  getExams
);

// Student Routes
examRouter.get(
  "/results/my",
  protect,
  authorize(["student", "admin"]),
  getMyResults
);

examRouter.post(
  "/:id/submit",
  protect,
  authorize(["student", "admin"]),
  submitExam
);

// teacher and admin routes
examRouter.patch(
  "/:id/status",
  protect,
  authorize(["super_admin", "teacher", "admin"]),
  toggleExamStatus
);

examRouter.get(
  "/:id/result",
  protect,
  authorize(["super_admin", "student", "admin", "teacher"]),
  getExamResult
);

examRouter.get(
  "/:id/submissions",
  protect,
  authorize(["super_admin", "teacher", "admin"]),
  getExamSubmissions
);

examRouter.get(
  "/:id",
  protect,
  authorize(["super_admin", "teacher", "student", "admin"]),
  getExamById
);

export default examRouter;
