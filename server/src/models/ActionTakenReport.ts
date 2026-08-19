import mongoose, { Document, Schema } from 'mongoose';

export interface IActionTakenReport extends Document {
  atrId: string;
  grievanceId: string;
  officerId: string;
  officerName: string;
  departmentId: string;
  actionSummary: string;
  supportingDocumentUrl: string;
  supportingDocumentName: string;
  supportingDocumentHash?: string;
  declarationsConfirmed: {
    examinedGrievance: boolean;
    actionPhysicallyTaken: boolean;
    evidenceVerifiable: boolean;
  };
  disposalType: 'RESOLVED' | 'PARTIALLY_RESOLVED' | 'REJECTED_WITH_REASON';
  rejectionReason?: string;
  submittedAt: Date;
}

const ActionTakenReportSchema = new Schema<IActionTakenReport>(
  {
    atrId: { type: String, required: true, unique: true, index: true },
    grievanceId: { type: String, required: true, unique: true, index: true },
    officerId: { type: String, required: true, index: true },
    officerName: { type: String, required: true },
    departmentId: { type: String, required: true, index: true },
    actionSummary: { type: String, required: true },
    supportingDocumentUrl: { type: String, required: true },
    supportingDocumentName: { type: String, required: true },
    supportingDocumentHash: { type: String },
    declarationsConfirmed: {
      examinedGrievance: { type: Boolean, required: true, default: false },
      actionPhysicallyTaken: { type: Boolean, required: true, default: false },
      evidenceVerifiable: { type: Boolean, required: true, default: false },
    },
    disposalType: {
      type: String,
      enum: ['RESOLVED', 'PARTIALLY_RESOLVED', 'REJECTED_WITH_REASON'],
      required: true,
      default: 'RESOLVED',
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ActionTakenReport = mongoose.model<IActionTakenReport>(
  'ActionTakenReport',
  ActionTakenReportSchema
);
