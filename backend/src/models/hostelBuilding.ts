import mongoose, { Schema, Document } from "mongoose";

export interface IHostel extends Document {
  name: string;
  category: "Boys Hostel" | "Girls Hostel";
  institute: mongoose.Types.ObjectId;
}

const hostelSchema = new Schema<IHostel>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Boys Hostel", "Girls Hostel"],
      required: true,
    },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique name per institute
hostelSchema.index({ name: 1, institute: 1 }, { unique: true });

export default mongoose.model<IHostel>("Hostel", hostelSchema);
