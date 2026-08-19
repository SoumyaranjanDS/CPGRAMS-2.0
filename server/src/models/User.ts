import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'CITIZEN' | 'GRO_OFFICER' | 'APPELLATE_OFFICER' | 'ADMIN';

export interface IUser extends Document {
  userId: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  email?: string;
  emailVerified: boolean;
  role: UserRole;
  departmentId?: string; // For officers
  designation?: string;
  address?: {
    pinCode: string;
    locality: string;
    district: string;
    state: string;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    email: { type: String, sparse: true, trim: true, lowercase: true },
    emailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['CITIZEN', 'GRO_OFFICER', 'APPELLATE_OFFICER', 'ADMIN'],
      default: 'CITIZEN',
      index: true,
    },
    departmentId: { type: String, default: null },
    designation: { type: String, default: null },
    address: {
      pinCode: { type: String, default: '' },
      locality: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
