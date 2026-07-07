import express from "express";
import {
  createAcademicYear,
  getCurrentAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getAllAcademicYears,
} from "../controllers/academicYear.ts";

import { authorize, protect } from "../middleware/auth.ts";

const academicYearRouter = express.Router();

academicYearRouter
  .route("/")
  .get(protect, authorize(["super_admin", "admin", "teacher"]), getAllAcademicYears);

academicYearRouter
  .route("/create")
  .post(protect, authorize(["super_admin", "admin"]), createAcademicYear);

academicYearRouter.route("/current").get(protect, getCurrentAcademicYear);

academicYearRouter
  .route("/update/:id")
  .patch(protect, authorize(["super_admin", "admin"]), updateAcademicYear);

academicYearRouter
  .route("/delete/:id")
  .delete(protect, authorize(["super_admin", "admin"]), deleteAcademicYear);

export default academicYearRouter;
