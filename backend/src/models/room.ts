import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  block: string;
  capacity: number;
  occupants: mongoose.Types.ObjectId[];
  status: "available" | "full" | "maintenance";
  institute: mongoose.Types.ObjectId;
  hostel?: mongoose.Types.ObjectId;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    block: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    occupants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["available", "full", "maintenance"],
      default: "available",
    },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    hostel: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of roomNumber + block within the same institute
roomSchema.index({ roomNumber: 1, block: 1, institute: 1 }, { unique: true });

export default mongoose.model<IRoom>("Room", roomSchema);
