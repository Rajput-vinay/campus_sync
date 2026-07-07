import express from "express";
import {
  applyForHostel,
  getApplications,
  updateStatus,
  getMyApplication,
  getRooms,
  createRoom,
  submitMaintenance,
  getMaintenanceRequests,
  updateMaintenanceStatus,
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
} from "../controllers/hostel.ts";
import { protect, authorize } from "../middleware/auth.ts";

const hostelRouter = express.Router();

hostelRouter.post("/apply", protect, authorize(["student"]), applyForHostel);
hostelRouter.get("/my-application", protect, authorize(["student"]), getMyApplication);
hostelRouter.post("/maintenance", protect, authorize(["student"]), submitMaintenance);
hostelRouter.get("/maintenance", protect, getMaintenanceRequests);

hostelRouter.get("/applications", protect, authorize(["super_admin", "admin"]), getApplications);
hostelRouter.put("/status", protect, authorize(["super_admin", "admin"]), updateStatus);
hostelRouter.get("/rooms", protect, authorize(["super_admin", "admin"]), getRooms);
hostelRouter.post("/rooms", protect, authorize(["super_admin", "admin"]), createRoom);
hostelRouter.put("/maintenance/:id", protect, authorize(["super_admin", "admin"]), updateMaintenanceStatus);

// Hostel Buildings Infrastructure Routes
hostelRouter.get("/hostels", protect, getHostels);
hostelRouter.post("/hostels", protect, authorize(["admin"]), createHostel);
hostelRouter.put("/hostels/:id", protect, authorize(["super_admin", "admin"]), updateHostel);
hostelRouter.delete("/hostels/:id", protect, authorize(["super_admin", "admin"]), deleteHostel);

export default hostelRouter;
