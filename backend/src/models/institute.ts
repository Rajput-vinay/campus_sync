import mongoose, { Schema, Document } from "mongoose";

export interface IInstitute extends Document {
  name: string;
  code: string;
  location: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const instituteSchema = new Schema<IInstitute>(
  {
    name: {
      type: String,
      required: [true, "Institute name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Institute code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInstitute>("Institute", instituteSchema);
