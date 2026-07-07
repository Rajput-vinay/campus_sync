import express from "express";

import { protect, authorize } from "../middleware/auth.ts";
import { getAllActivities } from "../controllers/activitieslog.ts";

const LogsRouter = express.Router();

LogsRouter.get("/", protect, authorize(["super_admin", "admin", "teacher"]), getAllActivities);

export default LogsRouter;
