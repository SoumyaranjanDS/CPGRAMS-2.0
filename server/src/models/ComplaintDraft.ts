import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaintDraft extends Document {
  draftId: string;
  userId?: string;
  sessionId: string;
  currentStep: number;
  rawNarrative: string;
  detectedIntent?: string;
  suggestedCategory?: string;
  suggestedDepartmentId?: string;
  aiConfidence?: number;
  formData: {
    pinCode?: string;
    state?: string;
    district?: string;
    locality?: string;
    landmark?: string;
    incidentDate?: string;
    isUrgent?: boolean;
    customFields?: Record<string, any>;
  };
  attachments: Array<{
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl?: string;
  }>;
  version: number;
  lastSavedAt: Date;
}

const ComplaintDraftSchema = new Schema<IComplaintDraft>(
  {
    draftId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    sessionId: { type: String, required: true, index: true },
    currentStep: { type: Number, default: 1 },
    rawNarrative: { type: String, default: '' },
    detectedIntent: { type: String, default: null },
    suggestedCategory: { type: String, default: null },
    suggestedDepartmentId: { type: String, default: null },
    aiConfidence: { type: Number, default: null },
    formData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileSize: { type: Number, required: true },
        fileType: { type: String, required: true },
        fileUrl: { type: String, default: null },
      },
    ],
    version: { type: Number, default: 1 },
    lastSavedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL index to automatically clean up orphaned drafts older than 30 days
ComplaintDraftSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ComplaintDraft = mongoose.model<IComplaintDraft>('ComplaintDraft', ComplaintDraftSchema);
