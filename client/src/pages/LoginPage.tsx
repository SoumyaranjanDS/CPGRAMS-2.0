import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { Alert } from '../components/common/Alert.js';
import { FloatingInput } from '../components/common/FloatingInput.js';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithOtp, sendOtpRequest, isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('123456');
  const [securityInput, setSecurityInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('k83Nw9');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  // Generate random 6-character Captcha Code
  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setSecurityInput('');
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotRegistered(false);

    if (!identifier.trim()) {
      setError('Please enter your registered Mobile Number or E-mail.');
      return;
    }

    if (securityInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setError('Security Code / Captcha does not match. Please try again.');
      generateNewCaptcha();
      return;
    }

    setIsLoading(true);
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
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await loginWithOtp(identifier, otp);
    setIsLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      if (res.notRegistered) {
        setNotRegistered(true);
      }
      setError(res.error || 'Invalid OTP. Use 123456 for instant testing.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-left font-sans animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center space-y-2.5 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          Sign In to CPGRAMS 2.0
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-600 max-w-sm mx-auto leading-relaxed">
          National public grievance redressal portal for Citizens &amp; Government Officers.
        </p>
      </div>

      {error && <Alert variant="danger" className="mb-5">{error}</Alert>}

      {notRegistered && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 mb-5 text-sm text-amber-900 leading-relaxed">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>No account found with this identifier</span>
          </div>
          <p>Please register to create your verified Citizen profile.</p>
          <Link
            to="/registration"
            className="inline-flex items-center gap-1.5 font-bold text-[#6F0047] hover:underline pt-1"
          >
            <span>Complete Citizen Registration</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Clean Open Form Layout without Card Box */}
      <div className="space-y-6">
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            
            {/* Google-Style Floating Input: Identifier */}
            <FloatingInput
              label="Registered Mobile Number or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              leftIcon={<Smartphone className="w-4 h-4" />}
              autoFocus
            />

            {/* Captcha Input & Visual Box */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FloatingInput
                  label="Security Code"
                  value={securityInput}
                  onChange={(e) => setSecurityInput(e.target.value)}
                  required
                />
                
                <div className="px-4 py-3 rounded-xl bg-slate-100 border border-slate-300 select-none tracking-widest text-lg font-serif italic font-bold text-slate-800 shadow-inner shrink-0 min-w-[100px] text-center">
                  {captchaCode}
                </div>

                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="p-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
                  title="Refresh Captcha"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center font-bold text-sm sm:text-base py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Verification Code (OTP)
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-500 block text-xs">OTP Code sent to:</span>
                <strong className="text-[#0A2540] font-bold text-sm">{identifier}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Floating Input: OTP */}
            <FloatingInput
              label="6-Digit Verification Code (OTP)"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              required
              leftIcon={<KeyRound className="w-4 h-4" />}
              className="text-center font-mono text-xl tracking-widest font-bold"
              autoFocus
            />

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs sm:text-sm text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Default testing OTP: <strong>123456</strong></span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center font-bold text-sm sm:text-base py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify OTP &amp; Sign In
            </Button>

            <div className="flex items-center justify-between text-sm text-slate-600 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resend OTP</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
          New to CPGRAMS?{' '}
          <Link to="/registration" className="text-[#6F0047] font-extrabold hover:underline">
            Register as a Citizen
          </Link>
        </div>
      </div>

    </div>
  );
};
