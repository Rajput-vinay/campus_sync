import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  studentTrade: mongoose.Types.ObjectId;
  tradeTeacher?: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  institute: mongoose.Types.ObjectId;

  month: string;        // "May 2026"
  monthNumber: number;  // 1–12
  year: number;         // 2026

  totalWorkingDays: number;
  daysPresent: number;

  percentage: number;
  status: "regular" | "low";
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentTrade: {
      type: Schema.Types.ObjectId,
      ref: "Trade",
      required: true,
      index: true,
    },
    tradeTeacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    // ✅ Hybrid month system
    month: {
      type: String,
      required: true,
      trim: true,
    },
    monthNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },

    totalWorkingDays: {
      type: Number,
      required: true,
      min: 0,
    },
    daysPresent: {
      type: Number,
      required: true,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      index: true,
    },

    status: {
      type: String,
      enum: ["regular", "low"],
      default: "regular",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


// 🔒 Validation + Auto Calculation
attendanceSchema.pre("save", function () {
  if (this.daysPresent > this.totalWorkingDays) {
    throw new Error("daysPresent cannot exceed totalWorkingDays");
  }

  if (this.totalWorkingDays > 0) {
    this.percentage = Math.round(
      (this.daysPresent / this.totalWorkingDays) * 100
    );
    this.status = this.percentage < 80 ? "low" : "regular";
  }
});


// ⚡ Unique constraint (one record per student per month/year)
attendanceSchema.index(
  { student: 1, monthNumber: 1, year: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);