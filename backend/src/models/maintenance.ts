import mongoose, { Schema, Document } from "mongoose";

export interface IMaintenance extends Document {
  student: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  issueType: "plumbing" | "electrical" | "furniture" | "cleaning" | "other";
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  resolvedAt?: Date;
  adminComments?: string;
  institute: mongoose.Types.ObjectId;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    issueType: {
      type: String,
      enum: ["plumbing", "electrical", "furniture", "cleaning", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    adminComments: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMaintenance>("Maintenance", maintenanceSchema);
