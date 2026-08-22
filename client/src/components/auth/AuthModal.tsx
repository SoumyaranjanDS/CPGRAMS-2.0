import React, { useState } from 'react';
import {
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { Alert } from '../common/Alert.js';
import { useAuth } from '../../context/AuthContext.js';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { sendOtpRequest, loginWithOtp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const res = await loginWithOtp(identifier, otp);
    setIsLoading(false);

    if (res.success) {
      onClose();
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
            <h3 className="text-lg font-bold">Secure Portal Sign In</h3>
            <p className="text-xs text-slate-500 font-normal">
              Enter your registered mobile or email to sign in via OTP.
            </p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-6 text-left">
        {error && <Alert variant="danger">{error}</Alert>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Registered Mobile Number or Email *"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+91 98XXXXXXXX or email@gov.in"
              leftIcon={<Smartphone className="w-4 h-4" />}
            />

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

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
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
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Default testing OTP: <strong>123456</strong></span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center font-bold text-sm py-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify &amp; Sign In
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
                className="inline-flex items-center gap-1 text-[#2563EB] font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
