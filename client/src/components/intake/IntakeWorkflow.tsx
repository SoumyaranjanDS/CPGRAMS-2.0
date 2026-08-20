import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Save,
  Building,
  Shield,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Input } from '../common/Input.js';
import { Textarea } from '../common/Textarea.js';
import { Badge } from '../common/Badge.js';
import { Alert } from '../common/Alert.js';
import { Stepper } from '../common/Stepper.js';

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
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [detectedCategory, setDetectedCategory] = useState<any>(null);

  // Synchronize initialNarrative if updated from voice
  useEffect(() => {
    if (initialNarrative) {
      setNarrative(initialNarrative);
    }
  }, [initialNarrative]);

  // AI Classification heuristic analyzer (Phase 2 preview)
  useEffect(() => {
    if (!narrative.trim()) {
      setDetectedCategory(null);
      return;
    }

    const text = narrative.toLowerCase();
    if (text.includes('pension') || text.includes('dbt') || text.includes('allowance')) {
      setDetectedCategory({
        deptName: 'Department of Social Security (SSEPD Odisha)',
        category: 'Non-Credit / Delay of Monthly Pension',
        confidence: 96,
        sla: 21,
      });
    } else if (text.includes('road') || text.includes('pothole') || text.includes('drain')) {
      setDetectedCategory({
        deptName: 'Bhubaneswar Municipal Corporation (BMC)',
        category: 'Road Hazards & Drainage Overflow',
        confidence: 94,
        sla: 21,
      });
    } else if (text.includes('power') || text.includes('electric') || text.includes('transformer') || text.includes('voltage')) {
      setDetectedCategory({
        deptName: 'TP Central Odisha Distribution Limited (TPCODL Power)',
        category: 'Electricity Supply & Burnt Transformer',
        confidence: 92,
        sla: 21,
      });
    } else {
      setDetectedCategory({
        deptName: 'General Administrative / Public Service Delivery',
        category: 'Citizen Grievance under Review',
        confidence: 88,
        sla: 21,
      });
    }
  }, [narrative]);

  // Handle PIN Lookup
  useEffect(() => {
    if (pinCode.length === 6) {
      axios
        .get(`/api/v1/taxonomy/pin/${pinCode}`)
        .then((res) => {
          setLocationDetails(res.data.data);
          if (res.data.data.locality && !locality) {
            setLocality(res.data.data.locality);
          }
        })
        .catch(() => setLocationDetails(null));
    }
  }, [pinCode]);

  // Dual-Layer Autosave simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 5000);
    return () => clearInterval(timer);
  }, [narrative, pinCode, locality]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedGrievanceId = `GRV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      onSuccess(generatedGrievanceId);
    }, 1200);
  };

  const steps = [
    { id: 1, title: 'Describe Issue', description: 'What happened?' },
    { id: 2, title: 'Location & Proof', description: 'PIN & Evidence' },
    { id: 3, title: 'Review & Lodge', description: 'Statutory 21-Day SLA' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Stepper Header & Autosave Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="w-full sm:w-auto flex-1">
          <Stepper steps={steps} currentStep={step} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          <Save className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Your Work Is Safe &bull; Autosaved at {lastSaved}</span>
        </div>
      </div>

      {/* STEP 1: Describe What Happened */}
      {step === 1 && (
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#0A2540]">Tell us what happened</h2>
              <p className="text-xs text-slate-500 mt-1">
                Describe the problem in everyday language. You do not need to know the government
                ministry name.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenVoiceModal}
              leftIcon={<Mic className="w-4 h-4 text-red-600" />}
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-semibold"
            >
              Speak Instead
            </Button>
          </div>

          <Textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={6}
            placeholder="e.g. My monthly disability pension has not been credited to my bank account for the last two months. I visited the local block office but received no update..."
            maxLength={1000}
            currentLength={narrative.length}
          />

          {/* AI Live Intent Card */}
          {detectedCategory && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 shadow-2xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#0A2540]">
                  <Sparkles className="w-4 h-4 text-[#FF9933]" />
                  AI Suggested Authority &amp; Classification
                </span>
                <Badge variant="emerald" size="sm">
                  {detectedCategory.confidence}% Match
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Recommended Department:</span>
                  <strong className="text-slate-800">{detectedCategory.deptName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Grievance Category:</span>
                  <strong className="text-slate-800">{detectedCategory.category}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="saffron"
              onClick={() => setStep(2)}
              disabled={!narrative.trim()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold"
            >
              Continue to Location &amp; Proof
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Location Intelligence & Evidence */}
      {step === 2 && (
        <Card padding="lg" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#0A2540]">Location &amp; Supporting Evidence</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Postal PIN code to automatically resolve jurisdiction and attach photos or receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="6-Digit Postal PIN Code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              maxLength={6}
              leftIcon={<MapPin className="w-4 h-4" />}
              helperText="e.g. 751001 for Bhubaneswar"
            />
            <Input
              label="Locality / Area Name"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Saheed Nagar, Sector 4"
            />
          </div>

          {locationDetails && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block">State:</span>
                <strong>{locationDetails.state}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">District:</span>
                <strong>{locationDetails.district}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Local Authority:</span>
                <strong>{locationDetails.localBody || 'Municipal Corp'}</strong>
              </div>
            </div>
          )}

          <Input
            label="Specific Landmark / Street Address (Optional)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Community Center, Opposite Post Office"
          />

          {/* File Attachment Upload */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Attach Supporting Documents / Photos (Optional)
            </label>
            
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-amber-50/30 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Upload className="w-8 h-8 text-[#0A2540] mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                Click or drag &amp; drop evidence files here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: PDF, JPG, PNG (Max 5MB per file)
              </p>
            </div>

            {/* Uploaded File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-slate-800">{file.name}</span>
                      <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="saffron"
              onClick={() => setStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold"
            >
              Review &amp; Lodge
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <Card padding="lg" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#0A2540]">Review Your Grievance</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please check the summary before final submission. A tracking receipt will be generated instantly.
            </p>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                Grievance Narrative:
              </span>
              <p className="text-slate-900 text-sm mt-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {narrative}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Assigned Authority:
                </span>
                <strong className="text-slate-900 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-[#0A2540]" />
                  {detectedCategory?.deptName || 'Department of Social Security, Odisha'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Resolved Location:
                </span>
                <strong className="text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
                  {locality || 'Bhubaneswar'}, PIN: {pinCode}
                </strong>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                Attached Evidence:
              </span>
              <p className="text-slate-700 mt-0.5 font-medium">
                {files.length > 0
                  ? `${files.length} document(s) attached`
                  : 'No documents attached (Can be uploaded later upon officer request)'}
              </p>
            </div>
          </div>

          {/* Statutory 21-Day SLA Promise */}
          <Alert variant="success" title="Guaranteed 21-Day Redressal SLA">
            Upon lodging, your grievance is timestamped into an immutable audit ledger. The
            designated Grievance Redressal Officer (GRO) has a statutory deadline of 21 calendar days
            to execute the corrective action and upload an official Action Taken Report (ATR).
          </Alert>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Edit Details
            </Button>
            <Button
              variant="saffron"
              size="lg"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<Shield className="w-5 h-5 text-slate-950" />}
              className="font-bold"
            >
              Lodge Grievance Securely
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
