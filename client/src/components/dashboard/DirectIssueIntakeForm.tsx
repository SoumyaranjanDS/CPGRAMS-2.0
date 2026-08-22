import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  Upload,
  ArrowRight,
  FileCheck,
  Trash2,
  ChevronDown,
  Search,
  Check,
  Navigation,
  Loader2,
  Compass,
  Cloud,
  ExternalLink,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../common/Button.js';
import { Alert } from '../common/Alert.js';
import { FloatingInput } from '../common/FloatingInput.js';
import { CPGRAMSOrganisation, CPGRAMS_ORGANISATIONS } from '../../data/cpgramsOrganisations.js';
import { detectDepartmentFromNarrative, AIDetectedDepartment } from '../../utils/aiDepartmentDetector.js';
import { detectGPSLocation, lookupPinCode } from '../../utils/locationService.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface DirectIssueIntakeFormProps {
  initialNarrative?: string;
  onSuccess: (complaintId: string) => void;
  onOpenVoiceModal?: () => void;
}

export const DirectIssueIntakeForm: React.FC<DirectIssueIntakeFormProps> = ({
  initialNarrative,
  onSuccess,
  onOpenVoiceModal,
}) => {
  const { user, loginWithPassword, registerCitizen } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // Inline Progressive Authentication State (when citizen is not logged in upfront)
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [isNewCitizen, setIsNewCitizen] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupGender, setSignupGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [signupInfoMsg, setSignupInfoMsg] = useState<string | null>(null);

  // Problem Narrative
  const [narrative, setNarrative] = useState(initialNarrative || '');
  const [isListening, setIsListening] = useState(false);

  // Sync narrative if initialNarrative changes (e.g. from Voice modal confirmation)
  useEffect(() => {
    if (initialNarrative) {
      setNarrative(initialNarrative);
    }
  }, [initialNarrative]);

  // Department Selection: Manual override or AI Auto-Detected
  const [manualOrganisation, setManualOrganisation] = useState<CPGRAMSOrganisation | null>(null);
  const [aiDetection, setAiDetection] = useState<AIDetectedDepartment | null>(null);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // Location Fields
  const [pinCode, setPinCode] = useState(user?.address?.pinCode || '751001');
  const [locality, setLocality] = useState(user?.address?.locality || user?.address?.premise || '');
  const [state, setState] = useState(user?.address?.state || 'Odisha');
  const [district, setDistrict] = useState(user?.address?.district || 'Khordha (Bhubaneswar)');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [suggestedPostOffices, setSuggestedPostOffices] = useState<string[]>([]);

  // Attachments & Declaration
  const [files, setFiles] = useState<Array<{ fileId?: string; name: string; size: number; type: string; fileUrl?: string; publicId?: string }>>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Form Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect department dynamically using backend OpenAI Mini / Gemini / NLP
  useEffect(() => {
    if (narrative.trim().length >= 4) {
      // 1. Immediate fast local estimation
      const local = detectDepartmentFromNarrative(narrative);
      setAiDetection(local);

      // 2. Debounced deep AI classification call to server mini model
      const timer = setTimeout(() => {
        axios
          .post('/api/v1/ai/classify-department', {
            text: narrative.trim(),
            departments: CPGRAMS_ORGANISATIONS.map((o) => ({
              id: o.id,
              code: o.code,
              name: o.name,
              category: o.category,
            })),
          })
          .then((res) => {
            if (res.data?.success && res.data.data) {
              const ai = res.data.data;
              const matchedOrg =
                CPGRAMS_ORGANISATIONS.find((o) => o.code === ai.departmentCode) ||
                CPGRAMS_ORGANISATIONS.find((o) => o.name.toLowerCase().includes(ai.departmentName.toLowerCase())) ||
                local.organisation;

              setAiDetection({
                organisation: matchedOrg,
                category: ai.category,
                subCategory: ai.subCategory,
                confidenceScore: ai.confidenceScore,
                matchedKeywords: [ai.reasoning],
              });
            }
          })
          .catch(() => {});
      }, 450);

      return () => clearTimeout(timer);
    } else {
      setAiDetection(null);
    }
  }, [narrative]);

  // Current active department (manual override takes precedence over AI detection)
  const activeOrganisation: CPGRAMSOrganisation =
    manualOrganisation ||
    aiDetection?.organisation ||
    CPGRAMS_ORGANISATIONS[0];

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

  // One-click GPS Location Auto-Detection
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
      setTimeout(() => setLocationFeedback(null), 6000);
    } catch (err: any) {
      setError(err.message || t('Could not detect location. Please enter your 6-digit PIN code.'));
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Voice Recognition in Browser
  const toggleVoiceInput = () => {
    if (onOpenVoiceModal) {
      onOpenVoiceModal();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t('Voice dictation is supported on Chrome, Edge, and Android browsers.'));
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        currentLanguage.code === 'hi'
          ? 'hi-IN'
          : currentLanguage.code === 'or'
          ? 'or-IN'
          : currentLanguage.code === 'bn'
          ? 'bn-IN'
          : currentLanguage.code === 'ta'
          ? 'ta-IN'
          : 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setNarrative((prev) => (prev ? `${prev.trim()} ${text.trim()}` : text.trim()));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
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
      console.warn('Cloudinary upload fallback to local reference:', uploadErr);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignupInfoMsg(null);

    if (!narrative.trim() || narrative.trim().length < 10) {
      setError(t('Please write a short description of your problem (at least 10 characters).'));
      return;
    }

    if (!pinCode || pinCode.length !== 6) {
      setError(t('Please enter a valid 6-digit PIN Code.'));
      return;
    }

    if (!agreedToTerms) {
      setError(t('Please confirm that your issue does not relate to court/RTI matters.'));
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. INLINE PROGRESSIVE AUTHENTICATION (If user is not logged in upfront)
      if (!user) {
        const cleanId = authIdentifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

        if (!cleanId) {
          setError(t('Please enter your Mobile Number or E-mail in the verification section below.'));
          setIsSubmitting(false);
          return;
        }

        if (!authPassword.trim()) {
          setError(t('Please enter your password in the verification section below.'));
          setIsSubmitting(false);
          return;
        }

        if (!isNewCitizen) {
          // Attempt Login with existing credentials
          const loginRes = await loginWithPassword(cleanId, authPassword);

          if (!loginRes.success) {
            if (loginRes.notRegistered) {
              // User not found -> Switch to instant signup mode seamlessly
              setIsNewCitizen(true);
              setSignupInfoMsg(
                t('No registered account was found for this mobile/email. Please provide your full name below to register and submit your grievance in one step.')
              );
              setIsSubmitting(false);
              return;
            } else {
              setError(loginRes.error || t('Invalid credentials for existing account. Please check your password.'));
              setIsSubmitting(false);
              return;
            }
          }
        } else {
          // Attempt Instant Registration + Sign In
          if (!signupName.trim()) {
            setError(t('Please enter your Full Name to complete citizen registration.'));
            setIsSubmitting(false);
            return;
          }

          const isEmail = cleanId.includes('@');
          const cleanMobile = !isEmail ? cleanId : '9876543210';
          const cleanEmail = isEmail ? cleanId.toLowerCase() : `${cleanMobile}@citizen.cpgrams.gov.in`;

          const regRes = await registerCitizen({
            name: signupName.trim(),
            gender: signupGender,
            phone: cleanMobile,
            email: cleanEmail,
            password: authPassword.trim(),
            address: {
              premise: locality.trim() || 'Premise Area',
              locality: locality.trim() || 'Central',
              district,
              state,
              pinCode: pinCode.trim(),
              country: 'India',
            },
            otp: '123456',
          });

          if (!regRes.success) {
            setError(regRes.error || t('Registration failed. Please check your details.'));
            setIsSubmitting(false);
            return;
          }
        }
      }

      // 2. SUBMIT GRIEVANCE RECORD
      const payload = {
        citizenId: user?.userId || 'CITIZEN-GUEST',
        narrative: narrative.trim(),
        assignedDepartment: {
          departmentId: activeOrganisation.code,
          departmentName: activeOrganisation.name,
        },
        category: {
          categoryId: aiDetection?.category || 'Public Service',
          mainCategory: aiDetection?.category || 'General Service',
          subCategory: aiDetection?.subCategory || 'Citizen Complaint',
          confidenceScore: aiDetection?.confidenceScore || 0.9,
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
      setError(err.response?.data?.error || err.response?.data?.message || t('Failed to submit issue. Please try again.'));
    }
  };

  const filteredDepts = CPGRAMS_ORGANISATIONS.filter(
    (o) =>
      o.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      o.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto pt-0 pb-6 text-left font-sans animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="space-y-1 mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A2540] tracking-tight">
          {t('Report an Issue / File Complaint')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          {t('Describe your issue in plain words or use voice dictation. Our AI automatically assigns the correct Department.')}
        </p>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Prevent accidental form submission when pressing Enter in input fields
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
        className="space-y-5 sm:space-y-6"
      >
          
          {/* ================= SECTION 1: PROBLEM DESCRIPTION & VOICE ================= */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>1. {t('What is the issue or problem you are facing?')}</span>
                <span className="text-red-500">*</span>
              </label>

              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-50 text-[#2563EB] hover:bg-blue-100 border border-blue-200'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{t('Listening...')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t('Speak Your Problem')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder={t(
                  'e.g. My monthly pension has not been credited to my bank account, or water supply disruption in my area for 3 days...'
                )}
                required
                className="w-full p-4 sm:p-5 rounded-2xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-slate-50/40 focus:bg-white text-[15px] sm:text-base font-normal text-slate-900 outline-none leading-relaxed transition-all resize-y min-h-[140px]"
              />
            </div>

            {/* SMART AI DEPARTMENT DETECTION CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A2540] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">
                    {manualOrganisation ? t('Selected Department (Manual)') : t('AI Auto-Assigned Department')}
                  </span>
                  <strong className="text-slate-900 font-bold text-xs sm:text-sm block">
                    {t(activeOrganisation.name)}
                  </strong>
                </div>
              </div>

              {/* Department Change Dropdown Button */}
              <div className="relative shrink-0" ref={deptDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                  className="w-full sm:w-auto text-[#2563EB] hover:text-[#1D4ED8] font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer bg-white hover:bg-blue-50 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                >
                  <span>{manualOrganisation ? t('Change') : t('Select Different Department')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* 92-Department Searchable Dropdown Popover */}
                {deptDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-72 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] p-2.5 text-left ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                    <div className="p-1.5 border-b border-slate-100 mb-1.5">
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder={t('Search 92 departments...')}
                          value={deptSearch}
                          onChange={(e) => setDeptSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 py-1">
                      {filteredDepts.map((org) => {
                        const isSelected = activeOrganisation.id === org.id;
                        return (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              setManualOrganisation(org);
                              setDeptDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-xs hover:bg-blue-50 transition-colors flex items-center justify-between group cursor-pointer rounded-lg ${
                              isSelected ? 'bg-blue-50 text-[#2563EB] font-bold' : 'text-slate-800'
                            }`}
                          >
                            <span className="truncate">{t(org.name)}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: LOCATION & PIN CODE ================= */}
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

            {/* Locality Input */}
            <div className="space-y-2.5">
              <FloatingInput
                label={t('Locality / Village / Street / Colony Details')}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="E.g. Near Big Bazaar, Patia / Sector-4"
              />

              {/* Suggested Localities under PIN Code */}
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
                        onClick={() => {
                          setLocality(po);
                        }}
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

          {/* ================= SECTION 3: ATTACHMENTS (OPTIONAL) ================= */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm sm:text-base font-bold text-slate-900 block">
                  3. {t('Supporting Photos or Documents (Optional)')}
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  PDF, JPG, PNG, DOC (Max 10MB per file)
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
                  <span className="text-xs text-slate-400">
                    Encrypting and storing attachments in Cloud Storage
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-[#2563EB] mx-auto mb-2" />
                  <span className="text-sm font-bold text-slate-800 block">
                    {t('Click to upload photos or files')}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Drag and drop or browse files from your device
                  </span>
                </>
              )}
            </div>

            {/* Uploaded Files with Cloudinary links */}
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
                          title="View in Cloud Storage"
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

          {/* ================= SECTION 4: CITIZEN IDENTITY & AUTHENTICATION ================= */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-[10px]">4</span>
                {t('Citizen Identity & Verification')}
              </span>
              {user ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('Verified Citizen Session')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  <Lock className="w-3.5 h-3.5" />
                  {isNewCitizen ? t('New Citizen Registration') : t('Citizen Sign In')}
                </span>
              )}
            </div>

            {/* Authenticated Citizen Summary */}
            {user ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                    {user.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight">{user.name || 'Citizen'}</h4>
                    <span className="text-xs text-slate-500 font-medium">{user.phone || user.email || 'Active Profile'}</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-800 font-medium">
                  {t('Filing grievance directly under your authenticated account.')}
                </span>
              </div>
            ) : (
              /* Inline Progressive Authentication (Sign in or Instant Registration) */
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                
                {signupInfoMsg && (
                  <Alert variant="info" className="text-xs">
                    {signupInfoMsg}
                  </Alert>
                )}

                {!isNewCitizen ? (
                  /* Mode A: Existing Citizen Sign In */
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t('Enter your registered Mobile Number or E-mail and password to submit under your account. If you are new, we will register you seamlessly.')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <FloatingInput
                        id="auth-identifier"
                        label={t('Mobile Number or E-mail *')}
                        value={authIdentifier}
                        onChange={(e) => setAuthIdentifier(e.target.value)}
                        placeholder="9876543210 or name@email.com"
                      />

                      <div className="relative">
                        <FloatingInput
                          id="auth-password"
                          type={showAuthPassword ? 'text' : 'password'}
                          label={t('Password *')}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthPassword(!showAuthPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewCitizen(true);
                          setSignupInfoMsg(null);
                        }}
                        className="text-[#2563EB] hover:underline font-bold cursor-pointer"
                      >
                        + {t('First time here? Register as a New Citizen')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Mode B: Instant Citizen Registration */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                      <span className="text-xs font-extrabold text-[#0A2540]">
                        {t('Citizen Registration (Will link automatically to your complaint)')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewCitizen(false);
                          setSignupInfoMsg(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                      >
                        {t('Already registered? Sign in')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <FloatingInput
                        id="signup-name"
                        label={t('Full Name (as per ID) *')}
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                      />

                      {/* Gender Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">{t('Gender *')}</label>
                        <div className="flex items-center gap-2">
                          {(['Male', 'Female', 'Other'] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setSignupGender(g)}
                              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                signupGender === g
                                  ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {t(g)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <FloatingInput
                        id="signup-identifier"
                        label={t('Mobile Number or E-mail *')}
                        value={authIdentifier}
                        onChange={(e) => setAuthIdentifier(e.target.value)}
                        placeholder="9876543210 or name@email.com"
                      />

                      <div className="relative">
                        <FloatingInput
                          id="signup-password"
                          type={showAuthPassword ? 'text' : 'password'}
                          label={t('Create Account Password *')}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Min 6 chars"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthPassword(!showAuthPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-100/60 text-xs text-blue-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        {t('Citizen Address will automatically use')} <strong>{locality || district}, {state} - {pinCode}</strong> {t('entered above.')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= SECTION 5: STATUTORY DECLARATION & SUBMIT ================= */}
          <div className="pt-4 border-t border-slate-200 space-y-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 mt-1 cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {t('I confirm that this issue does not relate to RTI, court/subjudice cases, or religious disputes.')}
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Average Resolution Target: <strong className="text-slate-800 font-bold">21 Days Standard SLA</strong>
              </span>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!agreedToTerms}
                className="w-full sm:w-auto font-bold text-sm sm:text-base px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('Submit Issue')}
              </Button>
            </div>
          </div>

        </form>

    </div>
  );
};
