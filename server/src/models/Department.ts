import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  departmentId: string;
  code: string;
  name: string;
  ministry: string;
  jurisdiction: 'CENTRAL' | 'STATE' | 'MUNICIPAL';
  state?: string;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
  supportEmail: string;
  slaDays: number; // Official target days (Default: 21)
  isActive: boolean;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    departmentId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    ministry: { type: String, required: true, trim: true },
    jurisdiction: {
      type: String,
      enum: ['CENTRAL', 'STATE', 'MUNICIPAL'],
      default: 'STATE',
    },
    state: { type: String, default: 'Odisha' },
    nodalOfficerName: { type: String, required: true },
    nodalOfficerEmail: { type: String, required: true },
    supportEmail: { type: String, required: true },
    slaDays: { type: Number, default: 21 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
