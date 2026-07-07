import mongoose, { Schema, Document } from "mongoose";

export interface IHostelApplication extends Document {
  student: mongoose.Types.ObjectId;
  fatherName: string;
  address: string;
  pincode: string;
  trade: string;
  citsNumber: string;
  distance: number; // in km
  location?: {
    lat: number;
    lng: number;
  };
  isPwD: boolean;
  status: "pending" | "approved" | "rejected";
  room?: mongoose.Types.ObjectId;
  hostelChoice?: mongoose.Types.ObjectId;
  appliedAt: Date;
  processedAt?: Date;
  institute: mongoose.Types.ObjectId;
}

const hostelApplicationSchema = new Schema<IHostelApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    trade: {
      type: String,
      required: true,
    },
    citsNumber: {
      type: String,
      required: true,
      unique: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    isPwD: {
      type: Boolean,
      default: false,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    hostelChoice: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for distance priority (descending)
hostelApplicationSchema.index({ distance: -1 });

export default mongoose.model<IHostelApplication>("HostelApplication", hostelApplicationSchema);
