import Dexie, { Table } from 'dexie';
import axios from 'axios';

export interface LocalDraft {
  id: string;
  sessionId: string;
  userId?: string;
  currentStep: number;
  narrative: string;
  pinCode: string;
  locality: string;
  landmark: string;
  departmentId?: string;
  departmentName?: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  hasDeclared: boolean;
  updatedAt: string;
}

class DraftDatabase extends Dexie {
  drafts!: Table<LocalDraft>;

  constructor() {
    super('cpgrams_draft_db');
    this.version(1).stores({
      drafts: 'id, sessionId, updatedAt',
    });
  }
}

export const db = new DraftDatabase();

const DEFAULT_SESSION_KEY = 'cpgrams_citizen_session_id';

/**
 * Get or generate a stable local session ID for the citizen
 */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(DEFAULT_SESSION_KEY);
  if (!sessionId) {
    sessionId = `SES-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem(DEFAULT_SESSION_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Save draft to local IndexedDB (Zero data loss per keystroke)
 */
export const saveLocalDraft = async (draft: Partial<LocalDraft>): Promise<void> => {
  try {
    const sessionId = getSessionId();
    const existing = await db.drafts.get(sessionId);

    const record: LocalDraft = {
      id: sessionId,
      sessionId,
      userId: draft.userId || existing?.userId,
      currentStep: draft.currentStep || existing?.currentStep || 1,
      narrative: draft.narrative !== undefined ? draft.narrative : existing?.narrative || '',
      pinCode: draft.pinCode !== undefined ? draft.pinCode : existing?.pinCode || '751001',
      locality: draft.locality !== undefined ? draft.locality : existing?.locality || '',
      landmark: draft.landmark !== undefined ? draft.landmark : existing?.landmark || '',
      departmentId: draft.departmentId || existing?.departmentId,
      departmentName: draft.departmentName || existing?.departmentName,
      citizenName: draft.citizenName !== undefined ? draft.citizenName : existing?.citizenName || '',
      citizenPhone: draft.citizenPhone !== undefined ? draft.citizenPhone : existing?.citizenPhone || '',
      citizenEmail: draft.citizenEmail !== undefined ? draft.citizenEmail : existing?.citizenEmail || '',
      hasDeclared: draft.hasDeclared !== undefined ? draft.hasDeclared : existing?.hasDeclared || false,
      updatedAt: new Date().toISOString(),
    };

    await db.drafts.put(record);
  } catch (err) {
    console.warn('[DraftStorage] IndexedDB save error:', err);
  }
};

/**
 * Get draft from local IndexedDB
 */
export const getLocalDraft = async (): Promise<LocalDraft | undefined> => {
  try {
    const sessionId = getSessionId();
    return await db.drafts.get(sessionId);
  } catch (err) {
    console.warn('[DraftStorage] IndexedDB read error:', err);
    return undefined;
  }
};

/**
 * Clear local draft after successful submission
 */
export const clearLocalDraft = async (): Promise<void> => {
  try {
    const sessionId = getSessionId();
    await db.drafts.delete(sessionId);
    // Also trigger server delete
    axios.delete(`/api/v1/drafts/${sessionId}`).catch(() => {});
  } catch (err) {
    console.warn('[DraftStorage] IndexedDB clear error:', err);
  }
};

/**
 * Synchronize draft to backend cloud endpoint (/api/v1/drafts/sync)
 */
export const syncRemoteDraft = async (draft: Partial<LocalDraft>): Promise<boolean> => {
  try {
    const sessionId = getSessionId();
    await axios.post('/api/v1/drafts/sync', {
      sessionId,
      userId: draft.userId,
      currentStep: draft.currentStep,
      rawNarrative: draft.narrative,
      formData: {
        pinCode: draft.pinCode,
        locality: draft.locality,
        landmark: draft.landmark,
        citizenName: draft.citizenName,
        citizenPhone: draft.citizenPhone,
        citizenEmail: draft.citizenEmail,
      },
      suggestedDepartmentId: draft.departmentId,
    });
    return true;
  } catch {
    return false;
  }
};
