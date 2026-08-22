export type UserRole = 'CITIZEN' | 'GRO_OFFICER' | 'APPELLATE_OFFICER' | 'ADMIN';
export type UserGender = 'Male' | 'Female' | 'Other';

export interface User {
  userId: string;
  name: string;
  gender?: UserGender;
  phone: string;
  phoneStd?: string;
  email?: string;
  role: UserRole;
  departmentId?: string;
  designation?: string;
  lastLoginAt?: string | Date;
  address?: {
    premise?: string;
    subLocality?: string;
    locality?: string;
    country?: string;
    state?: string;
    district?: string;
    pinCode?: string;
  };
}

export interface Department {
  departmentId: string;
  code: string;
  name: string;
  ministry: string;
  jurisdiction: 'CENTRAL' | 'STATE' | 'MUNICIPAL';
  state?: string;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
  supportEmail: string;
  slaDays: number;
}

export interface Category {
  categoryId: string;
  code: string;
  departmentId: string;
  mainCategory: string;
  subCategory: string;
  description: string;
  defaultSlaDays: number;
  keywords: string[];
  requiresDocument: boolean;
}

export type ComplaintStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'ACTION_IN_PROGRESS'
  | 'RESOLVED'
  | 'DISPOSED_RESOLVED'
  | 'RESOLUTION_DISPUTED'
  | 'APPEAL_SUBMITTED'
  | 'APPEAL_ASSIGNED'
  | 'APPEAL_UNDER_REVIEW'
  | 'APPEAL_DISPOSED'
  | 'APPEAL_RESOLVED'
  | 'REJECTED'
  | 'CLOSED';

export interface Complaint {
  _id?: string;
  id?: string;
  grievanceId: string;
  citizenId: string;
  category?: {
    categoryId?: string;
    mainCategory?: string;
    subCategory?: string;
    confidenceScore?: number;
  };
  assignedDepartment: {
    departmentId: string;
    departmentName: string;
    nodalOfficerId?: string;
    assignedAt?: string;
  };
  narrative: string;
  location?: {
    pinCode: string;
    state: string;
    district: string;
    locality?: string;
    addressLine?: string;
    landmark?: string;
  };
  attachments?: Array<{
    fileId?: string;
    name?: string;
    fileName?: string;
    fileUrl?: string;
    fileSize?: number;
    size?: number;
    fileType?: string;
    type?: string;
    uploadedAt?: string;
  }>;
  status: ComplaintStatus;
  slaDueDate?: string;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LocalDraft {
  draftId: string;
  currentStep: number;
  rawNarrative: string;
  detectedIntent?: string;
  suggestedCategoryId?: string;
  suggestedDepartmentId?: string;
  aiConfidence?: number;
  formData: {
    pinCode?: string;
    state?: string;
    district?: string;
    locality?: string;
    landmark?: string;
    incidentDate?: string;
  };
  attachments: Array<{
    fileName: string;
    fileSize: number;
    fileType: string;
    localDataUrl?: string;
  }>;
  lastSavedAt: string;
}
