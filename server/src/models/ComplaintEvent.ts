import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintEventType =
  | 'DRAFT_CREATED'
  | 'COMPLAINT_SUBMITTED'
  | 'AI_INTENT_CLASSIFIED'
  | 'ASSIGNED_TO_DEPARTMENT'
  | 'OFFICER_PORTAL_ACCESSED'
  | 'OFFICER_VIEWED_ATTACHMENTS'
  | 'ADDITIONAL_DOC_REQUESTED'
  | 'CITIZEN_DOC_UPLOADED'
  | 'ACTION_IN_PROGRESS'
  | 'ATR_SUBMITTED'
  | 'RESOLVED'
  | 'RESOLUTION_DISPUTED'
  | 'APPEAL_FILED'
  | 'APPEAL_DECISION_ISSUED'
  | 'CLOSED'
  | 'REMINDER_DISPATCHED';

export interface IComplaintEvent extends Document {
  eventId: string;
  grievanceId: string;
  eventType: ComplaintEventType;
  actor: {
    actorId: string;
    actorType: 'CITIZEN' | 'OFFICER' | 'SYSTEM' | 'APPELLATE_AUTHORITY';
    actorName?: string;
    actorIp?: string;
  };
  previousStatus?: string;
  newStatus?: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const ComplaintEventSchema = new Schema<IComplaintEvent>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    grievanceId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      actorId: { type: String, required: true },
      actorType: {
        type: String,
        enum: ['CITIZEN', 'OFFICER', 'SYSTEM', 'APPELLATE_AUTHORITY'],
        required: true,
      },
      actorName: { type: String },
      actorIp: { type: String },
    },
    previousStatus: { type: String },
    newStatus: { type: String },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Compound index for rendering chronological timeline of a grievance
ComplaintEventSchema.index({ grievanceId: 1, timestamp: 1 });

export const ComplaintEvent = mongoose.model<IComplaintEvent>('ComplaintEvent', ComplaintEventSchema);
