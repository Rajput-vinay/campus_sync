import {
  Users,
  BookOpen,
  Clock,
  GraduationCap,
  CalendarDays,
  AlertCircle,
  Home,
  School,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";

interface StatsProps {
  role: string;
  data: any; // In real app, define a strict interface
}

export function DashboardStats({ role, data }: StatsProps) {
  const navigate = useNavigate();

  // --- SUPER ADMIN VIEW ---
  if (role === "super_admin") {
    return (
      <>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/settings/institutes")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Institutes
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInstitutes || 0}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/settings/institutes")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Institutes
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeInstitutes || 0}</div>
            <p className="text-xs text-muted-foreground">Active scopes</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/users/students")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Platform wide</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/users/teachers")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTeachers || 0}</div>
            <p className="text-xs text-muted-foreground">Platform wide</p>
          </CardContent>
        </Card>
      </>
    );
  }

  // --- ADMIN VIEW ---
  if (role === "admin") {
    return (
      <>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/users/students")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/users/teachers")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTeachers || 0}</div>
            <p className="text-xs text-muted-foreground">Active Staff</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/attendance")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Attendance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgAttendance || "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Today's metrics</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/lms/exams")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeExams || 0}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>
      </>
    );
  }

  // --- TEACHER VIEW ---
  if (role === "teacher") {
    return (
      <>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/trades")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Trades</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.myTradesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Assigned trades</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/users/students")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.myStudentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">In my trade</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/lms/exams")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingGrading || 0}</div>
            <p className="text-xs text-muted-foreground">
              Submissions to review
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/timetable")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Period</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {data.nextTrade || "No classes"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.nextTradeTime || "Enjoy your day!"}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  // --- STUDENT VIEW ---
  return (
    <>
      <Card 
        className="hover:border-primary/50 transition-colors cursor-pointer" 
        onClick={() => navigate("/attendance")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.myAttendance || "0%"}</div>
          <p className="text-xs text-muted-foreground">This semester</p>
        </CardContent>
      </Card>
      <Card 
        className="hover:border-primary/50 transition-colors cursor-pointer" 
        onClick={() => navigate("/lms/exams")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.pendingAssignments || 0}
          </div>
          <p className="text-xs text-muted-foreground">Due this week</p>
        </CardContent>
      </Card>
      <Card 
        className="hover:border-primary/50 transition-colors cursor-pointer" 
        onClick={() => navigate("/lms/exams")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold truncate">
            {data.nextExam || "None"}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.nextExamDate || "Keep studying!"}
          </p>
        </CardContent>
      </Card>
      <Card 
        className="hover:border-primary/50 transition-colors cursor-pointer" 
        onClick={() => navigate("/hostel/apply")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hostel Status</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold capitalize">
            {data.hostelStatus || "Not Applied"}
          </div>
          <p className="text-xs text-muted-foreground">Application status</p>
        </CardContent>
      </Card>
    </>
  );
}

// also an example
