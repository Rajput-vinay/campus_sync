export type UserRole = "super_admin" | "admin" | "teacher" | "student" | "parent";

export interface pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Institute {
  _id: string;
  name: string;
  code: string;
  location: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface user {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentTrade?: Trade;
  teacherSubject?: subject[];
  isActive: boolean;
  institute?: Institute | string;
}

export interface academicYear {
  _id: string;
  name: string; // "2024-2025"
  fromYear: Date; // "2024-09-01"
  toYear: Date; // "2025-06-30"
  isCurrent: boolean; // true/false
}

export interface Trade {
  _id: string;
  name: string; // e.g., "Computer Software"
  academicYear: academicYear; // Link to "2024-2025"
  tradeTeacher: user; // The main teacher in charge
  subjects: subject[]; // List of subjects taught in this trade
  students: user[]; // List of students enrolled
  capacity: number; // Max students allowed (optional)
}

export interface subject {
  _id: string;
  name: string; // "Mathematics"
  code: string; // "MATH101"
  type: string;
  trade?: Trade | string;
  academicYear?: academicYear | string;
  teacher?: user | string; // Single teacher
  isActive: boolean; // Indicates if the subject is currently active
}

export interface question {
  _id: string;
  questionText: string;
  type: string;
  options: string[]; // Array of strings e.g. ["A", "B", "C", "D"]
  correctAnswer: string; // Hidden from students in default queries
  points: number;
}

export interface exam {
  _id: string;
  title: string;
  subject: subject;
  trade: Trade;
  teacher: user;
  duration: number; // in minutes
  questions: question[];
  dueDate: Date;
  isActive: boolean;
}

export interface Submission {
  _id: string;
  score: number;
  exam: exam; // The populated exam with answers
  answers: { questionId: string; answer: string }[];
}

export interface period {
  _id: string;
  subject: { _id: string; name: string; code: string };
  teacher: { _id: string; name: string };
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "08:45"
}

export interface schedule {
  day: string; // "Monday", "Tuesday", etc.
  periods: period[];
}
