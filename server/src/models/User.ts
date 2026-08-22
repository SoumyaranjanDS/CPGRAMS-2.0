import mongoose, { Document, Schema } from "mongoose";

export type UserRole =
  | "CITIZEN"
  | "GRO_OFFICER"
  | "APPELLATE_OFFICER"
  | "ADMIN";
export type UserGender = "Male" | "Female" | "Transgender";

export interface IUserAddress {
  premise?: string;
  subLocality?: string;
  locality?: string;
  country?: string;
  state?: string;
  district?: string;
  pinCode?: string;
}

export interface IUser extends Document {
  userId: string;
  name: string;
  gender?: UserGender;
  phone: string;
  phoneStd?: string;
  phoneVerified: boolean;
  email?: string;
  emailVerified: boolean;
  role: UserRole;
  departmentId?: string; // For officers
  designation?: string;
  address?: IUserAddress;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Transgender"],
      default: "Male",
    },
    phone: { type: String, required: true, unique: true, index: true },
    phoneStd: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },
    email: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["CITIZEN", "GRO_OFFICER", "APPELLATE_OFFICER", "ADMIN"],
      default: "CITIZEN",
      index: true,
    },
    departmentId: { type: String, default: null },
    designation: { type: String, default: null },
    address: {
      premise: { type: String, default: "" },
      subLocality: { type: String, default: "" },
      locality: { type: String, default: "" },
      country: { type: String, default: "India" },
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);
