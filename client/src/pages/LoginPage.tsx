import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { Alert } from '../components/common/Alert.js';
import { FloatingInput } from '../components/common/FloatingInput.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithPassword, loginWithOtp, sendOtpRequest, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const redirectPath = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')!) : '/dashboard';

  // Mode: 'password' (default) | 'otp'
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [securityInput, setSecurityInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('k83Nw9');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  // Generate random 6-character Captcha Code
  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setSecurityInput('');
    clearFieldError('securityInput');
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Validation for Password Mode
  const validatePasswordMode = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanId = identifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

    if (!cleanId) {
      errors.identifier = t('Please enter your registered Mobile Number or E-mail.');
    } else if (cleanId.includes('@')) {
      if (!EMAIL_REGEX.test(cleanId.toLowerCase())) {
        errors.identifier = t('Please enter a valid e-mail address (e.g. name@domain.com).');
      }
    } else {
      if (!MOBILE_REGEX.test(cleanId)) {
        errors.identifier = t('Mobile number must be a 10-digit number starting with 6, 7, 8, or 9.');
      }
    }

    if (!password) {
      errors.password = t('Please enter your account password.');
    }

    if (!securityInput.trim()) {
      errors.securityInput = t('Security code is mandatory.');
    } else if (securityInput.trim() !== captchaCode) {
      errors.securityInput = t('Captcha code does not match. Try again.');
      generateNewCaptcha();
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation for OTP Step 1
  const validateOtpStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanId = identifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

    if (!cleanId) {
      errors.identifier = t('Please enter your Mobile Number or E-mail.');
    } else if (cleanId.includes('@')) {
      if (!EMAIL_REGEX.test(cleanId.toLowerCase())) {
        errors.identifier = t('Please enter a valid e-mail address.');
      }
    } else {
      if (!MOBILE_REGEX.test(cleanId)) {
        errors.identifier = t('Enter a valid 10-digit mobile number.');
      }
    }

    if (!securityInput.trim()) {
      errors.securityInput = t('Security code is mandatory.');
    } else if (securityInput.trim() !== captchaCode) {
      errors.securityInput = t('Captcha code does not match. Try again.');
      generateNewCaptcha();
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Password-based Sign In
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotRegistered(false);

    if (!validatePasswordMode()) {
      return;
    }

    const cleanId = identifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

    setIsLoading(true);
    const res = await loginWithPassword(cleanId, password);
    setIsLoading(false);

    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      if (res.notRegistered) {
        setNotRegistered(true);
      }
      setError(res.error || t('Invalid credentials. Please try again.'));
    }
  };

  // Step 1 of OTP Mode: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotRegistered(false);

    if (!validateOtpStep1()) {
      return;
    }

    const cleanId = identifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

    setIsLoading(true);
    const res = await sendOtpRequest(cleanId);
    setIsLoading(false);

    if (res.success) {
      setOtpStep(2);
      setOtp(res.debugOtp || '123456');
    } else {
      setError(res.message || t('Failed to send OTP.'));
    }
  };

  // Step 2 of OTP Mode: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setFieldErrors({ otp: t('Please enter a valid 6-digit OTP code.') });
      return;
    }

    const cleanId = identifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

    setIsLoading(true);
    setError(null);

    const res = await loginWithOtp(cleanId, cleanOtp);
    setIsLoading(false);

    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      if (res.notRegistered) {
        setNotRegistered(true);
      }
      setError(res.error || t('Invalid OTP. Use 123456 for instant testing.'));
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-left font-sans animate-in fade-in duration-200">
      
      {/* Top Back Navigation Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A2540] bg-slate-100/90 hover:bg-slate-200/90 px-3 py-1.5 rounded-xl transition-all cursor-pointer mb-5 shadow-2xs group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>{t('Back')}</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-2.5 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          {t('Sign In to CPGRAMS 2.0')}
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-600 max-w-sm mx-auto leading-relaxed">
          {t('National public grievance portal for Citizens & Government Officers.')}
        </p>
      </div>

      {/* Mode Selector Tabs (Password vs OTP) */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setLoginMode('password');
            setError(null);
            setFieldErrors({});
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
            loginMode === 'password'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Password Login')}
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMode('otp');
            setOtpStep(1);
            setError(null);
            setFieldErrors({});
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
            loginMode === 'otp'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('OTP Login')}
        </button>
      </div>

      {error && <Alert variant="danger" className="mb-5">{error}</Alert>}

      {notRegistered && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 mb-5 text-sm text-amber-900 leading-relaxed">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{t('No account found with this identifier')}</span>
          </div>
          <p>{t('Please register to create your verified Citizen profile.')}</p>
          <Link
            to="/registration"
            className="inline-flex items-center gap-1.5 font-bold text-[#6F0047] hover:underline pt-1"
          >
            <span>{t('Complete Citizen Registration')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ================= PASSWORD LOGIN FORM ================= */}
      {loginMode === 'password' && (
        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5 animate-in fade-in duration-150">
          
          {/* Identifier */}
          <FloatingInput
            label={t('Registered Mobile Number or Email')}
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              clearFieldError('identifier');
            }}
            required
            error={fieldErrors.identifier}
            leftIcon={<Smartphone className="w-4 h-4" />}
            autoFocus
          />

          {/* Password Input with Show/Hide Eye */}
          <FloatingInput
            label={t('Password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError('password');
            }}
            required
            error={fieldErrors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-700 cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Captcha Input & Visual Box */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FloatingInput
                label={t('Security Code')}
                value={securityInput}
                onChange={(e) => {
                  setSecurityInput(e.target.value);
                  clearFieldError('securityInput');
                }}
                required
                error={fieldErrors.securityInput}
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
            {t('Sign In with Password')}
          </Button>

          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                setOtpStep(1);
                setFieldErrors({});
              }}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer"
            >
              {t('Sign In using OTP instead')}
            </button>
          </div>
        </form>
      )}

      {/* ================= OTP LOGIN FORM ================= */}
      {loginMode === 'otp' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {otpStep === 1 && (
            <form onSubmit={handleSendOtp} noValidate className="space-y-5">
              <FloatingInput
                label={t('Registered Mobile Number or Email')}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  clearFieldError('identifier');
                }}
                required
                error={fieldErrors.identifier}
                leftIcon={<Smartphone className="w-4 h-4" />}
                autoFocus
              />

              {/* Captcha */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <FloatingInput
                    label={t('Security Code')}
                    value={securityInput}
                    onChange={(e) => {
                      setSecurityInput(e.target.value);
                      clearFieldError('securityInput');
                    }}
                    required
                    error={fieldErrors.securityInput}
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
                {t('Get Verification Code (OTP)')}
              </Button>
            </form>
          )}

          {otpStep === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">{t('OTP Code sent to')}:</span>
                  <strong className="text-[#0A2540] font-bold text-sm">{identifier}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(1);
                    setFieldErrors({});
                  }}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  {t('Change')}
                </button>
              </div>

              <FloatingInput
                label={t('6-Digit Verification Code (OTP)')}
                value={otp}
                maxLength={6}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                  clearFieldError('otp');
                }}
                required
                error={fieldErrors.otp}
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="text-center font-mono text-xl tracking-widest font-bold"
                autoFocus
              />

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs sm:text-sm text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('Default testing OTP')}: <strong>123456</strong></span>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full justify-center font-bold text-sm sm:text-base py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('Verify OTP & Sign In')}
              </Button>

              <div className="flex items-center justify-between text-sm text-slate-600 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(1);
                    setFieldErrors({});
                  }}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('Back')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('Resend OTP')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
        {t('New to CPGRAMS?')}{' '}
        <Link to="/registration" className="text-[#6F0047] font-extrabold hover:underline">
          {t('Register as a Citizen')}
        </Link>
      </div>

    </div>
  );
};
