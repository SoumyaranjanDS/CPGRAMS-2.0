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
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Alert } from '../components/common/Alert.js';
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
    <div className="max-w-md mx-auto px-4 py-10 text-left animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          Sign In to CPGRAMS 2.0
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
          National public grievance redressal portal for Citizens &amp; Government Officers.
        </p>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {notRegistered && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 mb-4 text-xs text-amber-900">
          <p className="font-bold">No account found with this identifier.</p>
          <p>You can complete registration in less than a minute.</p>
          <Link
            to="/registration"
            className="inline-flex items-center gap-1 font-bold text-[#6F0047] hover:underline pt-1"
          >
            <span>Go to Citizen Registration Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <Card padding="lg" className="bg-white border-slate-200 shadow-xs rounded-2xl">
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                Registered Mobile Number or Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. +91 98XXXXXXXX or email@gov.in"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Government officers can enter their official department email.
              </span>
            </div>

            {/* Captcha */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                Security Code <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={securityInput}
                  onChange={(e) => setSecurityInput(e.target.value)}
                  placeholder="Enter captcha"
                  required
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 select-none tracking-widest text-base font-serif italic font-bold text-slate-800 shadow-inner">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
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
              className="w-full justify-center font-bold text-xs sm:text-sm py-3 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Verification Code (OTP)
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">OTP Code sent to:</span>
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

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                Enter 6-Digit OTP Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-center font-mono text-xl tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Demo Testing OTP: <strong>123456</strong></span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center font-bold text-xs sm:text-sm py-3 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify OTP &amp; Sign In
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
                className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-5 mt-5 border-t border-slate-100 text-center text-xs text-slate-600">
          New to CPGRAMS?{' '}
          <Link to="/registration" className="text-[#6F0047] font-extrabold hover:underline">
            Register as a Citizen
          </Link>
        </div>
      </Card>

    </div>
  );
};
