import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string; // e.g., "Trade Theory"
  code: string; // e.g., "TT"
  type: string; // "theory", "practical", "methodology"
  trade: mongoose.Types.ObjectId; // Reference to Trade
  academicYear: mongoose.Types.ObjectId; // Reference to AcademicYear
  teacher?: mongoose.Types.ObjectId; // Assigned teacher
  isActive: boolean; // Indicates if the subject is currently active
  institute: mongoose.Types.ObjectId;
}

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true, default: "theory" },
    trade: { type: Schema.Types.ObjectId, ref: "Trade", required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    institute: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate subjects in the same trade/year per institute
subjectSchema.index({ code: 1, trade: 1, academicYear: 1, institute: 1 }, { unique: true });

export default mongoose.model<ISubject>("Subject", subjectSchema);
