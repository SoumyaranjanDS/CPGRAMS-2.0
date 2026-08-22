import { Request, Response } from 'express';
import { Complaint, IComplaint } from '../models/Complaint.js';
import { ComplaintDraft } from '../models/ComplaintDraft.js';
import { ComplaintEvent } from '../models/ComplaintEvent.js';
import { Department } from '../models/Department.js';

/**
 * Helper to generate unique Grievance Registration Number
 * Format: GRV-YYYY-XXXXXX
 */
const generateGrievanceId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  let unique = false;
  let grievanceId = '';

  while (!unique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    grievanceId = `GRV-${currentYear}-${randomDigits}`;
    const existing = await Complaint.findOne({ grievanceId }).lean();
    if (!existing) {
      unique = true;
    }
  }

  return grievanceId;
};

/**
 * Helper to generate unique Event ID
 */
const generateEventId = (): string => {
  return `EVT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * Helper to generate unique Draft ID
 */
const generateDraftId = (): string => {
  return `DFT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * Controller: Register a new public complaint
 * Route: POST /api/v1/complaints
 */
export const submitComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = (req as any).user?.userId;
    const {
      citizenId = authenticatedUserId || 'CITIZEN-GUEST',
      idempotencyKey = `IDEM-${Date.now()}-${Math.random()}`,
      narrative,
      rawInput,
      isVoiceInput = false,
      category,
      assignedDepartment,
      location,
      attachments = [],
      sessionId,
    } = req.body;

    if (!narrative || !narrative.trim()) {
      res.status(400).json({
        success: false,
        error: 'Problem narrative is required to register a complaint.',
      });
      return;
    }

    if (!location || !location.pinCode || location.pinCode.length !== 6) {
      res.status(400).json({
        success: false,
        error: 'A valid 6-digit Indian Postal PIN Code and location details are required.',
      });
      return;
    }

    // Idempotency check: prevent duplicate submission on network retry
    if (idempotencyKey) {
      const existingComplaint = await Complaint.findOne({ idempotencyKey });
      if (existingComplaint) {
        res.status(200).json({
          success: true,
          data: existingComplaint,
          message: 'Existing complaint retrieved via idempotency key.',
        });
        return;
      }
    }

    // Calculate 21-Day statutory SLA target date
    const slaDueDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

    // Resolve Department & Nodal Officer
    let deptId = assignedDepartment?.departmentId || 'DEP-GEN-01';
    let deptName = assignedDepartment?.departmentName || 'General Administrative Department';
    let nodalOfficerId = assignedDepartment?.nodalOfficerId || 'OFF-DEFAULT-01';

    if (assignedDepartment?.departmentId) {
      const matchedDept = await Department.findOne({ departmentId: assignedDepartment.departmentId }).lean();
      if (matchedDept) {
        deptId = matchedDept.departmentId;
        deptName = matchedDept.name;
        nodalOfficerId = matchedDept.nodalOfficerEmail || matchedDept.nodalOfficerName;
      }
    }

    const grievanceId = await generateGrievanceId();

    const newComplaint = new Complaint({
      grievanceId,
      citizenId,
      idempotencyKey,
      category: {
        categoryId: category?.categoryId || 'CAT-GEN-01',
        mainCategory: category?.mainCategory || 'Public Service Delivery',
        subCategory: category?.subCategory || 'Citizen Grievance',
        confidenceScore: category?.confidenceScore || 0.95,
      },
      assignedDepartment: {
        departmentId: deptId,
        departmentName: deptName,
        nodalOfficerId,
        assignedAt: new Date(),
      },
      narrative: narrative.trim(),
      rawInput: rawInput || narrative.trim(),
      isVoiceInput,
      location: {
        pinCode: location.pinCode,
        state: location.state || 'National / Central',
        district: location.district || 'Territorial Jurisdiction',
        locality: location.locality || 'General Area',
        landmark: location.landmark || '',
      },
      attachments: attachments.map((att: any, idx: number) => ({
        fileId: att.fileId || `FILE-${Date.now()}-${idx}`,
        fileName: att.fileName || 'Attachment',
        fileUrl: att.fileUrl || '',
        fileSize: att.fileSize || 1024,
        fileType: att.fileType || 'application/pdf',
        fileHash: att.fileHash || '',
        uploadedAt: new Date(),
      })),
      status: 'SUBMITTED',
      slaDueDate,
      isOverdue: false,
    });

    await newComplaint.save();

    // Create Initial Audit Event (Immutable event-sourced ledger)
    const initialEvent = new ComplaintEvent({
      eventId: generateEventId(),
      grievanceId: newComplaint.grievanceId,
      eventType: 'COMPLAINT_SUBMITTED',
      actor: {
        actorId: citizenId,
        actorType: 'CITIZEN',
        actorName: 'Complainant',
        actorIp: req.ip || '127.0.0.1',
      },
      previousStatus: undefined,
      newStatus: 'SUBMITTED',
      message: `Grievance registered. Transmitted to ${deptName} with a 21-day statutory SLA target date of ${slaDueDate.toLocaleDateString('en-IN')}.`,
      metadata: {
        pinCode: location.pinCode,
        assignedDepartment: deptName,
        isVoiceInput,
        attachmentsCount: attachments.length,
      },
      timestamp: new Date(),
    });

    await initialEvent.save();

    // Clear any active draft for this session
    if (sessionId) {
      await ComplaintDraft.deleteOne({ sessionId });
    }

    res.status(201).json({
      success: true,
      data: newComplaint,
      message: 'Public grievance registered successfully under DARPG statutory protocol.',
    });
  } catch (error: any) {
    console.error('[ComplaintController] submitComplaint Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while registering grievance.',
    });
  }
};

/**
 * Controller: Synchronize in-progress draft (Dual-Layer Autosave)
 * Route: POST /api/v1/drafts/sync
 */
export const syncDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sessionId,
      userId,
      currentStep = 1,
      rawNarrative = '',
      detectedIntent,
      suggestedCategory,
      suggestedDepartmentId,
      aiConfidence,
      formData = {},
      attachments = [],
    } = req.body;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'sessionId is required to synchronize draft.',
      });
      return;
    }

    const draft = await ComplaintDraft.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          draftId: generateDraftId(),
          userId: userId || null,
          sessionId,
          currentStep,
          rawNarrative,
          detectedIntent,
          suggestedCategory,
          suggestedDepartmentId,
          aiConfidence,
          formData,
          attachments,
          lastSavedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: draft,
      message: 'Draft synchronized successfully.',
    });
  } catch (error: any) {
    console.error('[ComplaintController] syncDraft Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to synchronize draft.',
    });
  }
};

/**
 * Controller: Retrieve in-progress draft for session recovery
 * Route: GET /api/v1/drafts/:sessionId
 */
export const getDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'sessionId parameter required' });
      return;
    }

    const draft = await ComplaintDraft.findOne({ sessionId }).lean();
    if (!draft) {
      res.status(404).json({
        success: false,
        message: 'No active draft found for this session.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error: any) {
    console.error('[ComplaintController] getDraft Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve draft.',
    });
  }
};

/**
 * Controller: Delete draft upon completion or discard
 * Route: DELETE /api/v1/drafts/:sessionId
 */
export const deleteDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    await ComplaintDraft.deleteOne({ sessionId });
    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Controller: Public status tracker & event timeline lookup
 * Route: GET /api/v1/complaints/:id
 */
export const getComplaintById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOne({
      $or: [{ grievanceId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!complaint) {
      res.status(404).json({
        success: false,
        error: `No grievance record found matching registration number '${id}'.`,
      });
      return;
    }

    // Fetch associated chronological events
    const events = await ComplaintEvent.find({ grievanceId: complaint.grievanceId })
      .sort({ timestamp: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        complaint,
        events,
      },
    });
  } catch (error: any) {
    console.error('[ComplaintController] getComplaintById Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve complaint status.',
    });
  }
};

/**
 * Controller: List citizen complaints
 * Route: GET /api/v1/complaints
 */
export const listComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = (req as any).user;
    const { citizenId, status, departmentId, limit = 20, page = 1 } = req.query;

    const filter: any = {};
    if (citizenId) {
      filter.citizenId = citizenId;
    } else if (authenticatedUser?.role === 'CITIZEN' || authenticatedUser?.userId) {
      filter.citizenId = authenticatedUser.userId;
    }
    if (status) filter.status = status;
    if (departmentId) filter['assignedDepartment.departmentId'] = departmentId;

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
