import { createBrowserRouter } from "react-router"; // Keeping your requested import
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import PrivateRoutes from "@/pages/routes/PrivateRoutes";
import Dashboard from "@/pages/Dashboard";
import AcademicYear from "@/pages/settings/academic-year";
import ChangePassword from "@/pages/settings/ChangePassword";
import UserManagementPage from "@/pages/users";
import Trades from "@/pages/academics/Trades";
import { Subjects } from "@/pages/academics/Subjects";
import Timetable from "@/pages/academics/Timetable";
import Exams from "@/pages/lms/Exams";
import Exam from "@/pages/lms/Exam";
import ExamResultsPage from "@/pages/lms/ExamResultsPage";
import Attendance from "../academics/Attendance";
import Activities from "../Activities";
import HostelApply from "../hostel/HostelApply";
import HostelAdmin from "../hostel/HostelAdmin";
import InstitutesPage from "@/pages/settings/Institutes";

export const router = createBrowserRouter([
  {
    children: [
      // public routes
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      // protected routes would go here
      {
        element: <PrivateRoutes />, // Assuming PrivateRoutes is imported
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "activies-log", element: <Activities /> },
          { path: "settings/academic-years", element: <AcademicYear /> },
          { path: "settings/change-password", element: <ChangePassword /> },
          { path: "settings/institutes", element: <InstitutesPage /> },
          {
            path: "users/students",
            element: (
              <UserManagementPage
                role="student"
                title="Students"
                description="Manage student directory and trade assignments."
              />
            ),
          },
          {
            path: "users/teachers",
            element: (
              <UserManagementPage
                role="teacher"
                title="Teachers"
                description="Manage teaching staff."
              />
            ),
          },
          {
            path: "users/parents",
            element: (
              <UserManagementPage
                role="parent"
                title="Parents"
                description="Manage Parents."
              />
            ),
          },
          {
            path: "users/admins",
            element: (
              <UserManagementPage
                role="admin"
                title="Admins"
                description="Manage Admins."
              />
            ),
          },
          {
            path: "trades",
            element: <Trades />,
          },
          {
            path: "subjects",
            element: <Subjects />,
          },
          {
            path: "timetable",
            element: <Timetable />,
          },
          {
            path: "attendance",
            element: <Attendance />,
          },
          {
            path: "lms/exams",
            element: <Exams />,
          },
          {
            path: "lms/exams/:id",
            element: <Exam />,
          },
          {
            path: "lms/results",
            element: <ExamResultsPage />,
          },
          {
            path: "hostel/apply",
            element: <HostelApply />,
          },
          {
            path: "hostel/list",
            element: <HostelAdmin />,
          },
        ],
      },
    ],
  },
]);
