import mongoose, { Schema, Document } from "mongoose";

export interface IPeriod {
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "08:45"
}

export interface IDaySchedule {
  day: string; // "Monday", "Tuesday", etc.
  periods: IPeriod[];
}

export interface ITimetable extends Document {
  trade: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  schedule: IDaySchedule[];
  isPublished: boolean;
  institute: mongoose.Types.ObjectId;
  createdAt: Date;
}

const timetableSchema = new Schema(
  {
    trade: { type: Schema.Types.ObjectId, ref: "Trade", required: true },
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
    schedule: [
      {
        day: { type: String, required: true },
        periods: [
          {
            subject: { type: Schema.Types.ObjectId, ref: "Subject" },
            teacher: { type: Schema.Types.ObjectId, ref: "User" },
            startTime: String,
            endTime: String,
          },
        ],
      },
    ],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure only one timetable per trade per academic year per institute
timetableSchema.index({ trade: 1, academicYear: 1, institute: 1 }, { unique: true });

export default mongoose.model<ITimetable>("Timetable", timetableSchema);
