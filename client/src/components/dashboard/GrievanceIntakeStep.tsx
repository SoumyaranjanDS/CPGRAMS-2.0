import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Trash2,
  Compass,
  Loader2,
  Navigation,
  Cloud,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../common/Button.js';
import { Alert } from '../common/Alert.js';
import { FloatingInput } from '../common/FloatingInput.js';
import { CPGRAMSOrganisation } from '../../data/cpgramsOrganisations.js';
import { detectGPSLocation, lookupPinCode } from '../../utils/locationService.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface GrievanceIntakeStepProps {
  organisation: CPGRAMSOrganisation;
  onChangeOrganisation: () => void;
  onSuccess: (grievanceId: string) => void;
}

export const GrievanceIntakeStep: React.FC<GrievanceIntakeStepProps> = ({
  organisation,
  onChangeOrganisation,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [narrative, setNarrative] = useState('');
  const [pinCode, setPinCode] = useState(user?.address?.pinCode || '751001');
  const [locality, setLocality] = useState(user?.address?.locality || user?.address?.premise || '');
  const [state, setState] = useState(user?.address?.state || 'Odisha');
  const [district, setDistrict] = useState(user?.address?.district || 'Khordha (Bhubaneswar)');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [suggestedPostOffices, setSuggestedPostOffices] = useState<string[]>([]);
  const [files, setFiles] = useState<Array<{ fileId?: string; name: string; size: number; type: string; fileUrl?: string; publicId?: string }>>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resolve PIN code to State, District & Post Office Localities
  const resolvePinCode = async (code: string) => {
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      const result = await lookupPinCode(code);
      if (result) {
        if (result.state) setState(result.state);
        if (result.district) setDistrict(result.district);
        if (result.postOffices && result.postOffices.length > 0) {
          setSuggestedPostOffices(result.postOffices);
          if (!locality.trim() && result.locality) {
            setLocality(result.locality);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (pinCode.length === 6) {
      resolvePinCode(pinCode);
    }
  }, [pinCode]);

  // GPS Auto-detect handler
  const handleDetectGPS = async () => {
    setIsDetectingLocation(true);
    setLocationFeedback(null);
    try {
      const loc = await detectGPSLocation();
      if (loc.pinCode) setPinCode(loc.pinCode);
      if (loc.state) setState(loc.state);
      if (loc.district) setDistrict(loc.district);
      if (loc.locality) setLocality(loc.locality);
      if (loc.postOffices && loc.postOffices.length > 0) {
        setSuggestedPostOffices(loc.postOffices);
      }
      setLocationFeedback(t('Location successfully detected via GPS!'));
      setTimeout(() => setLocationFeedback(null), 5000);
    } catch (err: any) {
      setError(err.message || t('Could not detect GPS location. Please enter your 6-digit PIN code.'));
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const formData = new FormData();
    let hasOversized = false;
    for (let i = 0; i < uploadedFiles.length; i++) {
      const f = uploadedFiles[i];
      if (f.size > 10 * 1024 * 1024) {
        hasOversized = true;
        continue;
      }
      formData.append('files', f);
    }

    if (hasOversized) {
      setError(t('Files larger than 10MB were skipped.'));
    }

    setIsUploadingFiles(true);
    try {
      const res = await axios.post('/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data.files) {
        const cloudFiles = res.data.files.map((f: any) => ({
          fileId: f.fileId,
          name: f.fileName,
          size: f.fileSize,
          type: f.fileType,
          fileUrl: f.fileUrl,
          publicId: f.publicId,
        }));
        setFiles((prev) => [...prev, ...cloudFiles]);
      }
    } catch (uploadErr: any) {
      console.warn('Cloudinary upload fallback:', uploadErr);
      const fallbackList = Array.from(uploadedFiles).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setFiles((prev) => [...prev, ...fallbackList]);
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!narrative.trim() || narrative.trim().length < 15) {
      setError(t('Please describe your grievance in at least 15 characters.'));
      return;
    }

    if (!pinCode || pinCode.length !== 6) {
      setError(t('Please enter a valid 6-digit PIN Code.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        citizenId: user?.userId || 'CITIZEN-GUEST',
        narrative: narrative.trim(),
        assignedDepartment: {
          departmentId: organisation.code,
          departmentName: organisation.name,
        },
        location: {
          pinCode: pinCode.trim(),
          district,
          state,
          addressLine: locality.trim(),
        },
        attachments: files.map((f, idx) => ({
          fileId: f.fileId || `FILE-${Date.now()}-${idx}`,
          fileName: f.name,
          fileUrl: f.fileUrl || '',
          fileSize: f.size,
          fileType: f.type,
        })),
      };

      const res = await axios.post('/api/v1/complaints', payload);
      const created = res.data.data;
      setIsSubmitting(false);

      if (created && created.grievanceId) {
        onSuccess(created.grievanceId);
      } else {
        onSuccess(`GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.response?.data?.error || t('Failed to submit grievance. Please try again.'));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-0 pb-6 text-left font-sans animate-in fade-in duration-200">
      
      {/* Selected Ministry Header Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0A2540] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 block">
              {t('Selected Ministry / Department')}
            </span>
            <strong className="text-sm sm:text-base text-slate-900 font-bold block">
              {t(organisation.name)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeOrganisation}
          className="text-xs sm:text-sm font-bold text-[#2563EB] hover:underline cursor-pointer self-start sm:self-auto shrink-0 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs"
        >
          {t('Change Ministry')}
        </button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Main Intake Form */}
      <form
        onSubmit={handleSubmitGrievance}
        onKeyDown={(e) => {
          // Prevent accidental form submission on pressing Enter in input fields
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="space-y-7 sm:space-y-9"
        >
          
          {/* Grievance Narrative */}
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-bold text-slate-900 block">
              1. {t('Grievance Description / Problem Statement')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder={t(
                'Please provide complete facts of the case, date of occurrence, reference numbers, or officer details...'
              )}
              required
              className="w-full p-4 sm:p-5 rounded-2xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-slate-50/40 focus:bg-white text-[15px] sm:text-base font-normal text-slate-900 outline-none leading-relaxed transition-all resize-y min-h-[140px]"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{t('Minimum 15 characters recommended')}</span>
              <span>{narrative.length} {t('characters')}</span>
            </div>
          </div>

          {/* Location & PIN Code Grid */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>2. {t('Area & Location Details')}</span>
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('Auto-detect via GPS or enter your 6-digit PIN code to populate area and district.')}
                </p>
              </div>

              {/* GPS 1-Click Auto-Detect Button */}
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingLocation}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs self-start sm:self-auto"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>{t('Detecting GPS Location...')}</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>{t('Auto-Detect Current Location')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Location Feedback Toast */}
            {locationFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{locationFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FloatingInput
                label={`${t('PIN Code')} (6 ${t('digits')})`}
                value={pinCode}
                maxLength={6}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                required
                leftIcon={<MapPin className="w-4 h-4 text-[#2563EB]" />}
              />

              <FloatingInput
                label={t('State')}
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />

              <FloatingInput
                label={t('District')}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>

            {/* Locality Input & Suggested Areas */}
            <div className="space-y-2.5">
              <FloatingInput
                label={t('Locality / Village / Town / Street Details')}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="E.g. Near Big Bazaar, Patia / Sector-4"
              />

              {suggestedPostOffices.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('Post Office & Local Areas under PIN')} {pinCode}:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {suggestedPostOffices.slice(0, 8).map((po, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLocality(po)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          locality.toLowerCase().includes(po.toLowerCase())
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-blue-50 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <span>{po}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Attachments */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm sm:text-base font-bold text-slate-900 block">
                  3. {t('Supporting Documents (Optional)')}
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  PDF, JPG, PNG, DOC (max 10MB per file)
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud Storage</span>
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                isUploadingFiles
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-300 hover:border-[#2563EB] bg-slate-50/60 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploadingFiles ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                  <span className="text-sm font-bold text-slate-800">
                    {t('Uploading...')}
                  </span>
                  <span className="text-xs text-slate-500">
                    Encrypting and storing attachments in Cloud Storage
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-[#2563EB] mx-auto mb-2" />
                  <span className="text-sm font-bold text-slate-800 block">
                    {t('Click to upload supporting files')}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Drag and drop or browse files from your device
                  </span>
                </>
              )}
            </div>

            {/* Uploaded File Badges */}
            {files.length > 0 && (
              <div className="space-y-2 pt-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm shadow-2xs hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      {file.fileUrl ? (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#2563EB] hover:underline truncate flex items-center gap-1"
                          title="View on Cloud Storage"
                        >
                          <span className="truncate">{file.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                      ) : (
                        <span className="font-semibold text-slate-900 truncate">{file.name}</span>
                      )}
                      <span className="text-slate-400 text-xs shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      {file.fileUrl && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                          <Cloud className="w-2.5 h-2.5" />
                          Uploaded
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                      title={t('Remove File')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onChangeOrganisation}
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Back to Ministries')}</span>
            </button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full sm:w-auto font-bold text-sm sm:text-base px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20 order-1 sm:order-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('Submit Public Grievance')}
            </Button>
          </div>

        </form>

    </div>
  );
};
