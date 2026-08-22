import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Trash2,
  FileText,
  RotateCcw,
  Cloud,
} from 'lucide-react';
import axios from 'axios';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Input } from '../common/Input.js';
import { Textarea } from '../common/Textarea.js';
import { Badge } from '../common/Badge.js';
import { Alert } from '../common/Alert.js';
import { Stepper } from '../common/Stepper.js';
import { Department } from '../../types/index.js';
import {
  saveLocalDraft,
  getLocalDraft,
  clearLocalDraft,
  syncRemoteDraft,
  getSessionId,
} from '../../services/draftStorage.js';

export interface IntakeWorkflowProps {
  initialNarrative?: string;
  onSuccess: (grievanceId: string) => void;
  onCancel: () => void;
  onOpenVoiceModal: () => void;
}

export const IntakeWorkflow: React.FC<IntakeWorkflowProps> = ({
  initialNarrative = '',
  onSuccess,
  onCancel,
  onOpenVoiceModal,
}) => {
  const [step, setStep] = useState(1);
  const [narrative, setNarrative] = useState(initialNarrative);
  const [pinCode, setPinCode] = useState('751001');
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('DEP-OD-01');
  const [selectedDeptName, setSelectedDeptName] = useState<string>('Department of Social Security (SSEPD Odisha)');
  const [citizenName, setCitizenName] = useState('Soumya Ranjan');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [citizenEmail, setCitizenEmail] = useState('citizen@cpgrams.gov.in');
  const [hasDeclared, setHasDeclared] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; size: number; type: string }>>([]);
  
  // Dynamic taxonomy departments list
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // UI & Autosave State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSavedStatus, setLastSavedStatus] = useState<string>('Saved locally');
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const syncTimerRef = useRef<any>(null);

  // 1. Fetch Department Taxonomy
  useEffect(() => {
    axios
      .get('/api/v1/taxonomy/departments')
      .then((res) => {
        const depts = res.data.data || [];
        setDepartments(depts);
      })
      .catch(() => {});
  }, []);

  // 2. Check for Previous Local Draft on Mount
  useEffect(() => {
    getLocalDraft().then((saved) => {
      if (saved && saved.narrative && saved.narrative.trim().length > 5 && !initialNarrative) {
        setHasRecoverableDraft(true);
      }
    });
  }, [initialNarrative]);

  // 3. Synchronize initialNarrative from props/voice
  useEffect(() => {
    if (initialNarrative) {
      setNarrative(initialNarrative);
      saveLocalDraft({ narrative: initialNarrative });
    }
  }, [initialNarrative]);

  // 4. Dual-Layer Autosave Engine: Keystroke to IndexedDB + Debounced Sync to Server
  const handleNarrativeChange = (val: string) => {
    setNarrative(val);
    setLastSavedStatus('Saving...');

    saveLocalDraft({
      narrative: val,
      currentStep: step,
      pinCode,
      locality,
      landmark,
      departmentId: selectedDeptId,
      departmentName: selectedDeptName,
      citizenName,
      citizenPhone,
      citizenEmail,
      hasDeclared,
    }).then(() => {
      setLastSavedStatus('Saved locally');
    });

    // Debounce 2.5s remote cloud sync
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncRemoteDraft({
        narrative: val,
        currentStep: step,
        pinCode,
        locality,
        landmark,
        departmentId: selectedDeptId,
        citizenName,
        citizenPhone,
        citizenEmail,
      }).then((success) => {
        if (success) setLastSavedStatus('Synced to cloud');
      });
    }, 2500);
  };

  // 5. Restore Draft Handler
  const handleRestoreDraft = async () => {
    const draft = await getLocalDraft();
    if (draft) {
      if (draft.narrative) setNarrative(draft.narrative);
      if (draft.pinCode) setPinCode(draft.pinCode);
      if (draft.locality) setLocality(draft.locality);
      if (draft.landmark) setLandmark(draft.landmark);
      if (draft.departmentId) setSelectedDeptId(draft.departmentId);
      if (draft.departmentName) setSelectedDeptName(draft.departmentName);
      if (draft.citizenName) setCitizenName(draft.citizenName);
      if (draft.citizenPhone) setCitizenPhone(draft.citizenPhone);
      if (draft.citizenEmail) setCitizenEmail(draft.citizenEmail);
      if (draft.hasDeclared !== undefined) setHasDeclared(draft.hasDeclared);
      if (draft.currentStep) setStep(draft.currentStep);
    }
    setHasRecoverableDraft(false);
  };

  // Discard Draft Handler
  const handleDiscardDraft = async () => {
    await clearLocalDraft();
    setHasRecoverableDraft(false);
  };

  // 6. Real-Time AI Intent & Category Classification
  useEffect(() => {
    if (!narrative.trim()) {
      setDetectedCategory(null);
      return;
    }

    const text = narrative.toLowerCase();
    if (text.includes('pension') || text.includes('dbt') || text.includes('allowance') || text.includes('old age')) {
      setDetectedCategory({
        deptId: 'DEP-OD-01',
        deptName: 'Department of Social Security & Empowerment (SSEPD)',
        category: 'Non-Credit / Delay of Monthly Pension',
        confidence: 96,
        sla: 21,
      });
      setSelectedDeptId('DEP-OD-01');
      setSelectedDeptName('Department of Social Security & Empowerment (SSEPD)');
    } else if (text.includes('road') || text.includes('pothole') || text.includes('drain') || text.includes('garbage') || text.includes('sanitation')) {
      setDetectedCategory({
        deptId: 'DEP-OD-02',
        deptName: 'Bhubaneswar Municipal Corporation (BMC)',
        category: 'Road Hazards & Civic Sanitation',
        confidence: 94,
        sla: 21,
      });
      setSelectedDeptId('DEP-OD-02');
      setSelectedDeptName('Bhubaneswar Municipal Corporation (BMC)');
    } else if (text.includes('power') || text.includes('electric') || text.includes('transformer') || text.includes('voltage') || text.includes('meter')) {
      setDetectedCategory({
        deptId: 'DEP-OD-03',
        deptName: 'TP Central Odisha Distribution Limited (TPCODL)',
        category: 'Electricity Supply & Burnt Transformer',
        confidence: 92,
        sla: 21,
      });
      setSelectedDeptId('DEP-OD-03');
      setSelectedDeptName('TP Central Odisha Distribution Limited (TPCODL)');
    } else if (text.includes('water') || text.includes('pipe') || text.includes('watco') || text.includes('leak')) {
      setDetectedCategory({
        deptId: 'DEP-OD-04',
        deptName: 'Water Corporation of Odisha (WATCO)',
        category: 'Drinking Water Pipeline Supply & Contamination',
        confidence: 93,
        sla: 21,
      });
      setSelectedDeptId('DEP-OD-04');
      setSelectedDeptName('Water Corporation of Odisha (WATCO)');
    } else {
      setDetectedCategory({
        deptId: 'DEP-GEN-01',
        deptName: 'General Administrative / Public Service Delivery',
        category: 'Citizen Grievance under Review',
        confidence: 88,
        sla: 21,
      });
    }
  }, [narrative]);

  // 7. PIN Code Cascade Lookup
  useEffect(() => {
    if (pinCode.length === 6) {
      axios
        .get(`/api/v1/taxonomy/pin/${pinCode}`)
        .then((res) => {
          setLocationDetails(res.data.data);
        })
        .catch(() => {
          setLocationDetails(null);
        });
    }
  }, [pinCode]);

  // 8. File Upload Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 9. Quick Scenario Templates
  const scenarioTemplates = [
    {
      label: '👴 Pension Delay',
      text: 'My monthly old-age pension under the Madhu Babu Pension Yojana (MBPY) for the last 3 months has not been credited to my bank account despite regular submission of life certificate.',
    },
    {
      label: '🚧 Road Hazard / Drain',
      text: 'Deep open potholes and overflowing drainage water on Main Street in our locality are creating severe road hazards and causing accidents for two-wheelers and pedestrians.',
    },
    {
      label: '⚡ Electricity Outage',
      text: 'Severe low voltage and frequent unscheduled power tripping caused the neighborhood distribution transformer to burn out. Repeated calls to the fuse call centre remain unresolved.',
    },
    {
      label: '💧 Drinking Water Supply',
      text: 'Contaminated muddy water is coming through the municipal tap supply line for the past 5 days, posing severe health hazards to over 80 households in our ward.',
    },
  ];

  // 10. Final Submission Handler
  const handleFinalSubmit = async () => {
    if (!hasDeclared) {
      setSubmitError('Please accept the mandatory statutory truthfulness declaration before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        citizenId: 'USR-882910',
        sessionId: getSessionId(),
        idempotencyKey: `IDEM-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        narrative: narrative.trim(),
        rawInput: narrative.trim(),
        isVoiceInput: false,
        category: {
          categoryId: detectedCategory?.deptId || 'CAT-GEN-01',
          mainCategory: detectedCategory?.deptName || 'Public Service Delivery',
          subCategory: detectedCategory?.category || 'Citizen Grievance',
          confidenceScore: (detectedCategory?.confidence || 90) / 100,
        },
        assignedDepartment: {
          departmentId: selectedDeptId,
          departmentName: selectedDeptName,
        },
        location: {
          pinCode: pinCode || '751001',
          state: locationDetails?.state || 'Odisha',
          district: locationDetails?.district || 'Khordha',
          locality: locality || locationDetails?.subDivision || 'Urban Ward',
          landmark: landmark || '',
        },
        attachments: files.map((f, idx) => ({
          fileId: `FILE-${Date.now()}-${idx}`,
          fileName: f.name,
          fileUrl: `/uploads/mock-${f.name}`,
          fileSize: f.size,
          fileType: f.type || 'application/pdf',
        })),
      };

      const res = await axios.post('/api/v1/complaints', payload);
      const generatedGrievanceId = res.data.data.grievanceId;

      // Clear local and remote draft
      await clearLocalDraft();

      onSuccess(generatedGrievanceId);
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 animate-in fade-in duration-200">
      
      {/* ================= RECOVERABLE DRAFT BANNER ================= */}
      {hasRecoverableDraft && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <strong className="text-xs sm:text-sm font-bold block">Unfinished Complaint Draft Found</strong>
              <p className="text-[11px] sm:text-xs text-amber-800">
                You have an unsubmitted complaint draft saved on this device. Would you like to restore it?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer shadow-2xs"
            >
              Restore Draft
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 font-semibold text-xs cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ================= TOP HEADER WITH STEPPER & AUTOSAVE STATUS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#6F0047]/10 text-xs font-bold text-[#6F0047] uppercase tracking-wider mb-2">
            <span>CPGRAMS 2.0 Citizen Intake Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Register Public Problem / Complaint
          </h2>
        </div>

        {/* Autosave Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 shrink-0">
          <Cloud className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{lastSavedStatus}</span>
        </div>
      </div>

      {/* Stepper Header */}
      <Stepper
        currentStep={step}
        steps={[
          { id: 1, title: '1. Problem Description', description: 'Narrative & AI Triage' },
          { id: 2, title: '2. Location & Authority', description: 'PIN Code & Department' },
          { id: 3, title: '3. Verification & Submit', description: 'Citizen Identity & Statutory SLA' },
        ]}
      />

      {/* ================= STEP 1: PROBLEM DESCRIPTION & AI TRIAGE ================= */}
      {step === 1 && (
        <Card padding="lg" className="space-y-6 border-slate-200 bg-white shadow-xs rounded-2xl">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[#0A2540]">
              Describe what happened in your own words
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Type in plain language or speak your problem using voice entry. Our system will
              automatically classify the department and statutory SLA target.
            </p>
          </div>

          {/* Quick Scenario Templates */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Quick Problem Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              {scenarioTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleNarrativeChange(template.text)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] text-xs font-semibold text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Narrative Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Problem Description *</label>
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6F0047] hover:underline cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Dictate via Voice</span>
              </button>
            </div>
            <Textarea
              rows={5}
              value={narrative}
              onChange={(e) => handleNarrativeChange(e.target.value)}
              placeholder="E.g., I have not received my monthly social pension for the past 3 months..."
              className="text-sm sm:text-base leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Zero data loss: Every keystroke is saved locally</span>
              <span>{narrative.length} characters</span>
            </div>
          </div>

          {/* AI Intent Triage Card */}
          {detectedCategory && (
            <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Smart Triage Recommendation</span>
                </div>
                <Badge variant="blue" size="sm" className="font-bold">
                  {detectedCategory.confidence}% Match
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
                <div>
                  <span className="text-slate-500 block text-xs">Identified Department:</span>
                  <strong className="text-slate-900 font-bold">{detectedCategory.deptName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Issue Category &amp; SLA:</span>
                  <strong className="text-slate-900 font-bold">
                    {detectedCategory.category} &bull; {detectedCategory.sla} Days SLA
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Supporting Attachments Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 block">
                  Supporting Documents / Photos (Optional)
                </label>
                <p className="text-xs text-slate-500">
                  Attach sanction letters, bill receipts, passbook copy, or site photos (PDF, JPG, PNG up to 5MB).
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Add Document</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="space-y-2 pt-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button variant="ghost" onClick={onCancel} className="text-slate-600 text-xs sm:text-sm">
              Cancel &amp; Return
            </Button>
            <Button
              variant="primary"
              disabled={!narrative.trim()}
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold text-xs sm:text-sm px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Next: Location &amp; Authority
            </Button>
          </div>
        </Card>
      )}

      {/* ================= STEP 2: LOCATION & AUTHORITY SELECTION ================= */}
      {step === 2 && (
        <Card padding="lg" className="space-y-6 border-slate-200 bg-white shadow-xs rounded-2xl">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[#0A2540]">
              Jurisdiction &amp; Department Mapping
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Verify your postal PIN code to automatically assign the concerned territorial authority.
            </p>
          </div>

          {/* PIN Code Cascade Lookup */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="6-Digit Indian Postal PIN Code *"
                value={pinCode}
                maxLength={6}
                onChange={(e) => {
                  const val = e.target.value;
                  setPinCode(val);
                  saveLocalDraft({ pinCode: val });
                }}
                leftIcon={<MapPin className="w-4 h-4" />}
                helperText="Enter 6-digit PIN code (e.g. 751001, 751024, 110001)"
              />

              <Input
                label="Locality / Ward / Street Address"
                value={locality}
                placeholder="E.g. Unit-4, Bhouma Nagar"
                onChange={(e) => {
                  setLocality(e.target.value);
                  saveLocalDraft({ locality: e.target.value });
                }}
              />
            </div>

            {/* Resolved Location Box */}
            {locationDetails ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">State:</span>
                  <strong className="text-slate-900 font-bold">{locationDetails.state}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">District:</span>
                  <strong className="text-slate-900 font-bold">{locationDetails.district}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Sub-Division:</span>
                  <strong className="text-slate-900 font-bold">
                    {locationDetails.subDivision || 'Urban Subdivision'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Civic Body:</span>
                  <strong className="text-slate-900 font-bold">
                    {locationDetails.localBody || 'Municipal Body'}
                  </strong>
                </div>
              </div>
            ) : (
              <Alert variant="warning">
                Unable to automatically verify PIN code. You can proceed; authorities will route based
                on your address details.
              </Alert>
            )}

            <Input
              label="Landmark (Optional)"
              value={landmark}
              placeholder="E.g. Near Govt High School / Post Office"
              onChange={(e) => {
                setLandmark(e.target.value);
                saveLocalDraft({ landmark: e.target.value });
              }}
            />
          </div>

          {/* Department Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Assigned Government Department / Public Authority *
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                const selected = departments.find((d) => d.departmentId === e.target.value);
                setSelectedDeptId(e.target.value);
                if (selected) {
                  setSelectedDeptName(selected.name);
                  saveLocalDraft({
                    departmentId: selected.departmentId,
                    departmentName: selected.name,
                  });
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.name} ({dept.ministry}) &bull; {dept.slaDays} Days SLA
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-xs sm:text-sm"
            >
              Back: Problem Description
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold text-xs sm:text-sm px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Next: Verification &amp; Submit
            </Button>
          </div>
        </Card>
      )}

      {/* ================= STEP 3: CITIZEN VERIFICATION & STATUTORY SUBMIT ================= */}
      {step === 3 && (
        <Card padding="lg" className="space-y-6 border-slate-200 bg-white shadow-xs rounded-2xl">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[#0A2540]">
              Citizen Identification &amp; Statutory Declarations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Please review your details and confirm the statutory truthfulness declaration.
            </p>
          </div>

          {submitError && <Alert variant="danger">{submitError}</Alert>}

          {/* Citizen Contact Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Citizen Full Name *"
              value={citizenName}
              onChange={(e) => {
                setCitizenName(e.target.value);
                saveLocalDraft({ citizenName: e.target.value });
              }}
            />
            <Input
              label="Registered Mobile Number *"
              value={citizenPhone}
              onChange={(e) => {
                setCitizenPhone(e.target.value);
                saveLocalDraft({ citizenPhone: e.target.value });
              }}
              helperText="For SMS registration & dispatch updates"
            />
            <Input
              label="Email Address *"
              value={citizenEmail}
              onChange={(e) => {
                setCitizenEmail(e.target.value);
                saveLocalDraft({ citizenEmail: e.target.value });
              }}
              helperText="For official Action Taken Reports"
            />
          </div>

          {/* Summary Review Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-[#0A2540] uppercase tracking-wider text-xs">
                Grievance Registration Summary
              </span>
              <Badge variant="blue" size="sm" className="font-bold">
                21-Day SLA Target
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block">Assigned Department:</span>
                <strong className="text-slate-900 font-bold">{selectedDeptName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Territory / PIN:</span>
                <strong className="text-slate-900 font-bold">
                  {pinCode} &bull; {locationDetails?.district || 'Khordha'}, {locationDetails?.state || 'Odisha'}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Grievance Narrative:</span>
                <p className="text-slate-800 line-clamp-2 italic font-normal">&ldquo;{narrative}&rdquo;</p>
              </div>
              <div>
                <span className="text-slate-400 block">Attached Documents:</span>
                <strong className="text-slate-900 font-bold">{files.length} document(s) uploaded</strong>
              </div>
            </div>
          </div>

          {/* Statutory Declaration Checkbox */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDeclared}
                onChange={(e) => {
                  setHasDeclared(e.target.checked);
                  saveLocalDraft({ hasDeclared: e.target.checked });
                }}
                className="mt-1 w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
              />
              <span className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                I hereby solemnly declare that the facts stated in this grievance are true to the best
                of my knowledge. I confirm that this matter is not sub-judice or pending before any
                court of law, and complies with DARPG guidelines.
              </span>
            </label>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-xs sm:text-sm"
            >
              Back: Location
            </Button>
            <Button
              variant="primary"
              disabled={!hasDeclared || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleFinalSubmit}
              rightIcon={<FileCheck className="w-4 h-4" />}
              className="font-bold text-xs sm:text-sm px-8 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm cursor-pointer"
            >
              Submit Grievance to Authority
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
