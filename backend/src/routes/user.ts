import express from "express";

const userRoutes = express.Router();

import {
  register,
  login,
  updateUser,
  deleteUser,
  logoutUser,
  getUserProfile,
  getUsers,
  changePassword,
  getAllTeacherAndStudent
} from "../controllers/user.ts";
import { protect, authorize } from "../middleware/auth.ts";

// make sure to protect to get access to the user token
userRoutes.post(
  "/register",
  protect,
  // authorize(["super_admin", "admin", "teacher"]),
  register
);
userRoutes.post("/login", login);
userRoutes.post("/logout", logoutUser);
userRoutes.put("/change-password", protect, changePassword);
userRoutes.get("/profile", protect, getUserProfile); // Get User Profile
// teacher should be able to fetch all students
userRoutes.get("/", protect, authorize(["super_admin", "admin", "teacher"]), getUsers);
// here you can use either put or patch
userRoutes.put(
  "/update/:id",
  protect,
  authorize(["super_admin", "admin", "teacher"]),
  updateUser
);
userRoutes.delete(
  "/delete/:id",
  protect,
  authorize(["super_admin", "admin", "teacher"]),
  deleteUser
);

userRoutes.get("/all", protect, authorize(["super_admin", "admin", "teacher"]),
  getAllTeacherAndStudent)

export default userRoutes;

// next we protect routes, also add rolebased access
