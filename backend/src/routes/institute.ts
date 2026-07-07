import express from "express";
import { protect, authorize } from "../middleware/auth.ts";
import {
  createInstitute,
  getInstitutes,
  updateInstitute,
} from "../controllers/institute.ts";

const instituteRouter = express.Router();

// Allow public to see active institutes (e.g. for registration/login selectors)
// If protected, we can also check role inside controller
instituteRouter.get("/", protect, getInstitutes);

// Restricted actions (Super Admin only)
instituteRouter.post(
  "/",
  protect,
  authorize(["super_admin"]),
  createInstitute
);

instituteRouter.put(
  "/:id",
  protect,
  authorize(["super_admin"]),
  updateInstitute
);

export default instituteRouter;
