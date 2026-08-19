import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'ACTION_IN_PROGRESS'
  | 'RESOLVED'
  | 'RESOLUTION_DISPUTED'
  | 'APPEAL_SUBMITTED'
  | 'APPEAL_RESOLVED'
  | 'CLOSED';

export interface IComplaint extends Document {
  grievanceId: string;
  citizenId: string;
  idempotencyKey: string;
  category: {
    categoryId: string;
    mainCategory: string;
    subCategory: string;
    confidenceScore?: number;
  };
  assignedDepartment: {
    departmentId: string;
    departmentName: string;
    nodalOfficerId?: string;
    assignedAt?: Date;
  };
  narrative: string;
  rawInput?: string;
  isVoiceInput: boolean;
  location: {
    pinCode: string;
    state: string;
    district: string;
    locality: string;
    landmark?: string;
  };
  attachments: Array<{
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    fileHash?: string;
    uploadedAt: Date;
  }>;
  status: ComplaintStatus;
  slaDueDate: Date;
  isOverdue: boolean;
  actionTakenReportId?: string;
  additionalInfoRequest?: {
    requestedBy: string;
    message: string;
    requestedAt: Date;
    responseReceived?: string;
    responseDocumentUrl?: string;
    respondedAt?: Date;
  };
  disputeNotes?: string;
  appealDetails?: {
    groundsOfAppeal: string;
    appealOfficerId?: string;
    appealStatus: string;
    filedAt: Date;
    resolvedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    grievanceId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    category: {
      categoryId: { type: String, required: true },
      mainCategory: { type: String, required: true },
      subCategory: { type: String, required: true },
      confidenceScore: { type: Number, default: 1.0 },
    },
    assignedDepartment: {
      departmentId: { type: String, required: true, index: true },
      departmentName: { type: String, required: true },
      nodalOfficerId: { type: String, default: null },
      assignedAt: { type: Date, default: Date.now },
    },
    narrative: { type: String, required: true },
    rawInput: { type: String },
    isVoiceInput: { type: Boolean, default: false },
    location: {
      pinCode: { type: String, required: true, index: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      locality: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    attachments: [
      {
        fileId: { type: String, required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: true },
        fileType: { type: String, required: true },
        fileHash: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'RECEIVED',
        'ASSIGNED',
        'UNDER_REVIEW',
        'ADDITIONAL_INFO_REQUIRED',
        'ACTION_IN_PROGRESS',
        'RESOLVED',
        'RESOLUTION_DISPUTED',
        'APPEAL_SUBMITTED',
        'APPEAL_RESOLVED',
        'CLOSED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    slaDueDate: { type: Date, required: true, index: true },
    isOverdue: { type: Boolean, default: false, index: true },
    actionTakenReportId: { type: String, default: null },
    additionalInfoRequest: {
      requestedBy: { type: String },
      message: { type: String },
      requestedAt: { type: Date },
      responseReceived: { type: String },
      responseDocumentUrl: { type: String },
      respondedAt: { type: Date },
    },
    disputeNotes: { type: String },
    appealDetails: {
      groundsOfAppeal: { type: String },
      appealOfficerId: { type: String },
      appealStatus: { type: String },
      filedAt: { type: Date },
      resolvedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Compound indexes for fast querying by citizen, department, status, and SLA
ComplaintSchema.index({ citizenId: 1, status: 1 });
ComplaintSchema.index({ 'assignedDepartment.departmentId': 1, status: 1 });
ComplaintSchema.index({ status: 1, slaDueDate: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
