# 🎓 NSTI Kanpur Portal 

A comprehensive, state-of-the-art Learning Management and Institute Portal for **NSTI Kanpur** (National Skill Training Institute). Built with the MERN stack and styled with a premium **Supabase-inspired dark theme**.

---

## 🚀 Overview

NSTI Kanpur Portal is designed to modernize technical education management. From automated hostel allotments to AI-powered academic scheduling, this portal serves as a unified digital hub for students, teachers, and administrators of NSTI Kanpur (under DGT, MSDE).

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Automation & AI:** Inngest (Background Tasks), Google Gemini AI.
- **Communications:** Nodemailer (SMTP/Gmail).
- **Geocoding:** PositionStack API (for distance calculations).

---

## 🚩 Problem Statement

Managing a National Skill Training Institute (NSTI) involves complex administrative tasks such as tracking student/teacher data across various technical trades, managing high-volume attendance, and allocating hostel rooms fairly for outstation students. 

Traditional manual processes often lead to:
- **Inefficient Scheduling:** Conflict-prone academic timetables.
- **Unfair Hostel Allotment:** Difficulty in prioritizing students based on distance.
- **Delayed Feedback:** Manual grading and slow attendance tracking.
- **Fragmented Communication:** Lack of automated notifications for critical updates.

**NSTI Kanpur Portal** solves these by providing a unified, AI-powered digital ecosystem that automates administration, optimizes scheduling, and ensures transparent resource allocation.

---

## 🛠️ API Endpoints

### 🔐 Authentication & Users
- `POST /api/users/login` - Authenticate user & get token.
- `POST /api/users/register` - Create new user (Admin/Teacher only).
- `POST /api/users/logout` - Clear auth cookies.
- `GET /api/users/profile` - Get current user data.
- `GET /api/users` - List users with filtering (Role, Trade, Search).
- `PUT /api/users/update/:id` - Update user details.
- `DELETE /api/users/delete/:id` - Remove user from system.

### 🏗️ Trade & Academics
- `GET /api/trades` - Fetch all trades (CITS, ADIT, etc.).
- `POST /api/trades/create` - Create a new trade.
- `PUT /api/trades/update/:id` - Edit trade details.
- `GET /api/subjects` - List all technical subjects.
- `GET /api/academic-years` - Manage session years.

### 📅 Attendance
- `POST /api/attendance/submit` - Students submit monthly attendance.
- `GET /api/attendance` - Admin/Teacher view attendance records.
- `GET /api/attendance/me` - Students view their own attendance history.
- `POST /api/attendance/notify/:id` - Send manual low-attendance warning.

### 📝 Exams & LMS
- `POST /api/exams/generate` - Trigger AI question paper generation.
- `GET /api/exams` - List available exams for current trade.
- `GET /api/exams/:id` - Fetch exam details (Questions/Duration).
- `POST /api/exams/:id/submit` - Submit student responses.
- `GET /api/exams/:id/result` - View score and feedback.
- `PATCH /api/exams/:id/status` - Activate/Deactivate exam (Teacher).

### 🏨 Hostel & Maintenance
- `POST /api/hostel/apply` - Submit hostel application with address.
- `GET /api/hostel/list` - Admin view of prioritized applications.
- `POST /api/hostel/approve/:id` - Approve allotment (triggers email).
- `POST /api/hostel/maintenance/report` - Report plumbing/electrical issues.
- `GET /api/hostel/maintenance/list` - View all maintenance requests.

### 📊 Dashboard & System
- `GET /api/dashboard/stats` - Role-based statistics (Attendance, Exams, Counts).
- `POST /api/timetable/generate` - AI-powered weekly schedule optimization.

---

## ✨ Core Features

### 1. 🔐 Role-Based Access Control (RBAC)
- **Admin:** Manage users (Student/Teacher/Admin), configure academic years, oversee hostel operations, and track system-wide activity.
- **Teacher:** Mark attendance, manage subjects, and utilize AI for timetable and exam generation.
- **Student:** Track attendance, apply for hostel, submit maintenance requests, and view profiles.

### 2. 🏨 Hostel Management System (Advanced)
- **Smart Prioritization:** Automatically calculates distance from student's home to NSTI Kanpur using **Geocoding** (PositionStack) to prioritize outstation candidates.
- **Automated Allotment:** Admin can approve applications in bulk; the system automatically assigns available rooms based on capacity and block logic.
- **Maintenance Module:** Students can report issues (Plumbing, Electrical, etc.), and Admins can update status with feedback/comments.
- **Status Notifications:** Automated emails for every step—Approval (with room details), Rejection (waiting list), and Maintenance updates.

### 3. 📚 Academic & Attendance
- **Attendance Tracking:** Teachers can mark attendance per class; students get a real-time percentage view.
- **AI Integration:** 
  - **Timetable Generator:** Automatically creates optimized weekly schedules using AI.
  - **Exam Generator:** Generates high-quality question papers based on subject parameters.
- **Low Attendance Alerts:** Automated background checks send email warnings to students below the 80% threshold.

### 4. 📧 Automated Email System
- **Welcome Emails:** Triggered immediately upon student/teacher registration with login credentials.
- **Hostel Status:** Professional HTML templates for Allotment notifications (Approved/Rejected).
- **Branding:** All communications feature **NSTI Kanpur** branding with a sleek emerald-dark design.

---

## 🎨 Design & Branding

- **Supabase Aesthetic:** High-contrast dark mode (`#121212`), Emerald Green accents (`#3ecf8e`), and Glassmorphism effects.
- **NSTI Identity:** Custom Hero section featuring the Kanpur campus building, mission statement, and MSDE recognition.
- **Mobile First:** Fully responsive layouts for dashboards and landing pages.

---

## 📂 Page Breakdown

- **Landing Page (`/`):** Hero section with 3D image effects, Trade highlights (CITS, Advanced Diploma), and Institute stats.
- **Login Page (`/login`):** Clean, minimal dual-pane layout with NSTI branding.
- **Admin Dashboard (`/admin`):** Sidebar-driven management of users, classes, and hostel applications.
- **Student Dashboard (`/dashboard`):** Personalized view of attendance charts, application status, and maintenance history.
- **Hostel Portal:** Specialized views for application forms, room details, and maintenance tracking.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js & npm installed.
- MongoDB Atlas account.
- Gmail App Password for SMTP.
- PositionStack API Key.

### Steps
1. **Clone the Repo:**
   ```bash
   git clone <repo-url>
   ```
2. **Backend Setup:**
   - Go to `backend/`
   - Install dependencies: `npm install`
   - Create `.env` file (see `.env.example`).
   - Start server: `npm run dev`
3. **Frontend Setup:**
   - Go to `frontend/`
   - Install dependencies: `npm install`
   - Start app: `npm run dev`

---

## 📜 License

Designed and Developed for **NSTI Kanpur**. Under the Ministry of Skill Development & Entrepreneurship by rajput-vinay.
