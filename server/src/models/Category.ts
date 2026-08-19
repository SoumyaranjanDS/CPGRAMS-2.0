import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  categoryId: string;
  code: string;
  departmentId: string;
  mainCategory: string;
  subCategory: string;
  description: string;
  defaultSlaDays: number;
  keywords: string[];
  requiresDocument: boolean;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    categoryId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, index: true },
    departmentId: { type: String, required: true, ref: 'Department', index: true },
    mainCategory: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    defaultSlaDays: { type: Number, default: 21 },
    keywords: [{ type: String }],
    requiresDocument: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ mainCategory: 1, subCategory: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
