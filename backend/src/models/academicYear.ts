import mongoose, { Schema, Document } from "mongoose";

export interface IAcademicYear extends Document {
  name: string; // "2024-2025"
  fromYear: Date; // "2024-09-01"
  toYear: Date; // "2025-06-30"
  isCurrent: boolean; // true/false
  institute: mongoose.Types.ObjectId;
}

const academicYearSchema = new Schema(
  {
    name: { type: String, required: true },
    fromYear: { type: Date, required: true },
    toYear: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    institute: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
  },
  { timestamps: true }
);

// Compound index to ensure name is unique within the same institute
academicYearSchema.index({ name: 1, institute: 1 }, { unique: true });

export default mongoose.model<IAcademicYear>(
  "AcademicYear",
  academicYearSchema
);
