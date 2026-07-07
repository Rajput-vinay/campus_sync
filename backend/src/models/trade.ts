import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript to know the structure
export interface ITrade extends Document {
  name: string; // e.g., "Computer Software"
  institute: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId; 
  tradeTeacher: mongoose.Types.ObjectId; 
  subjects: mongoose.Types.ObjectId[]; 
  students: mongoose.Types.ObjectId[]; 
  capacity: number; 
}

const tradeSchema = new Schema<ITrade>(
  {
    name: {
      type: String,
      required: [true, "Trade name is required"],
      trim: true,
    },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    // Reference to the Academic Year model
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    // Reference to the User model (Teacher role)
    tradeTeacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Array of References to Subject model
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    // students field will be handled via virtual populate to ensure it's always in sync
    // see below the schema definition for the virtual field
    capacity: {
      type: Number,
      default: 40,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate: Automatically fetch students belonging to this trade
tradeSchema.virtual("students", {
  ref: "User",
  localField: "_id",
  foreignField: "studentTrade",
});

// Compound Index: Prevents creating duplicate trades per institute
tradeSchema.index({ name: 1, institute: 1 }, { unique: true });

export default mongoose.model<ITrade>("Trade", tradeSchema);
