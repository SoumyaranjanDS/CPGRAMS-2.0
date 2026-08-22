import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Building2,
  Scale,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { Alert } from '../common/Alert.js';
import { useAuth, DEMO_PROFILES } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { sendOtpRequest, verifyOtpAndLogin } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('+91 98765 43210');
  const [name, setName] = useState('Soumya Ranjan');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');
  const [otp, setOtp] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Preset Selector
  const handleSelectPreset = (role: UserRole) => {
    setSelectedRole(role);
    const profile = DEMO_PROFILES[role];
    if (profile) {
      setIdentifier(profile.phone);
      setName(profile.name);
      setError(null);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter a valid mobile number or email.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await sendOtpRequest(identifier);
    setIsLoading(false);

    if (res.success) {
      setStep(2);
      setOtp(res.debugOtp || '123456');
    } else {
      setError(res.message || 'Failed to send OTP.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await verifyOtpAndLogin(identifier, otp, name, selectedRole);
    setIsLoading(false);

    if (res.success) {
      onClose();
      // Reset state for next time
      setStep(1);
    } else {
      setError(res.error || 'Invalid OTP. Use 123456.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3 text-[#0A2540] text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Secure Portal Authentication</h3>
            <p className="text-xs text-slate-500 font-normal">
              Single-screen OTP login for Indian citizens and government officers.
            </p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-6 text-left">
        
        {/* Error Alert */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* ================= STEP 1: IDENTIFIER & ROLE PRESETS ================= */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            
            {/* Instant Demo Role Switcher */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Select Demo Account / Role Preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('CITIZEN')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    selectedRole === 'CITIZEN'
                      ? 'border-[#2563EB] bg-blue-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <UserIcon className="w-4 h-4 text-[#2563EB]" />
                    {selectedRole === 'CITIZEN' && <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Citizen</strong>
                    <span className="text-[10px] text-slate-500 block truncate">Soumya Ranjan</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('GRO_OFFICER')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    selectedRole === 'GRO_OFFICER'
                      ? 'border-[#6F0047] bg-fuchsia-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-[#6F0047]" />
                    {selectedRole === 'GRO_OFFICER' && <CheckCircle2 className="w-3.5 h-3.5 text-[#6F0047]" />}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Nodal GRO</strong>
                    <span className="text-[10px] text-slate-500 block truncate">Dr. D. Pattnaik</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('APPELLATE_OFFICER')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    selectedRole === 'APPELLATE_OFFICER'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    {selectedRole === 'APPELLATE_OFFICER' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Appellate IAS</strong>
                    <span className="text-[10px] text-slate-500 block truncate">Arundhati Ray</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Identifier Inputs */}
            <div className="space-y-4 pt-1">
              <Input
                label="Registered Mobile Number or Email Address *"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+91 98XXXXXXXX or email@gov.in"
                leftIcon={<Smartphone className="w-4 h-4" />}
                helperText="A 6-digit OTP will be dispatched for identity verification"
              />

              <Input
                label="Full Name (As per official records) *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                leftIcon={<UserIcon className="w-4 h-4" />}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center font-bold text-sm py-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Verification OTP
            </Button>
          </form>
        )}

        {/* ================= STEP 2: 6-DIGIT OTP VERIFICATION ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            
            {/* Sent Header */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 block">Verification code sent to:</span>
                <strong className="text-[#0A2540] font-bold">{identifier}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Input
                label="Enter 6-Digit Verification Code *"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="text-center font-mono text-xl tracking-widest font-bold"
              />

              {/* Demo Hint Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Demo Mode Active:</strong> Default testing OTP is <strong>123456</strong>.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full justify-center font-bold text-sm py-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Verify &amp; Enter Portal
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-[#2563EB] font-semibold hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};
