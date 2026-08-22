import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RotateCcw,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/common/Button.js';
import { Alert } from '../components/common/Alert.js';
import { Modal } from '../components/common/Modal.js';
import { FloatingInput, FloatingSelect } from '../components/common/FloatingInput.js';
import { useAuth } from '../context/AuthContext.js';

// Indian States and Major Districts mapping
const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  Odisha: [
    'Khordha (Bhubaneswar)',
    'Cuttack',
    'Puri',
    'Ganjam',
    'Balasore',
    'Sambalpur',
    'Sundargarh (Rourkela)',
    'Angul',
    'Bhadrak',
    'Mayurbhanj',
    'Jajpur',
    'Kendrapara',
  ],
  Delhi: [
    'New Delhi',
    'Central Delhi',
    'North Delhi',
    'South Delhi',
    'East Delhi',
    'West Delhi',
    'South West Delhi',
    'Shahdara',
  ],
  Maharashtra: [
    'Mumbai City',
    'Mumbai Suburban',
    'Pune',
    'Nagpur',
    'Thane',
    'Nashik',
    'Aurangabad',
    'Solapur',
  ],
  Karnataka: [
    'Bengaluru Urban',
    'Bengaluru Rural',
    'Mysuru',
    'Dakshina Kannada (Mangaluru)',
    'Belagavi',
    'Hubballi-Dharwad',
  ],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Kanchipuram',
  ],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur Nagar',
    'Gautam Buddha Nagar (Noida)',
    'Ghaziabad',
    'Varanasi',
    'Prayagraj',
    'Agra',
  ],
  'West Bengal': [
    'Kolkata',
    'North 24 Parganas',
    'South 24 Parganas',
    'Howrah',
    'Hooghly',
    'Darjeeling',
    'Purba Medinipur',
  ],
  Gujarat: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Gandhinagar',
  ],
  Rajasthan: [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Bikaner',
    'Ajmer',
  ],
  Telangana: [
    'Hyderabad',
    'Medchal-Malkajgiri',
    'Rangareddy',
    'Warangal',
    'Nizamabad',
  ],
};

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerCitizen, sendOtpRequest } = useAuth();

  // Form State matching Official CPGRAMS Form
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender'>('Male');
  const [premise, setPremise] = useState('');
  const [subLocality, setSubLocality] = useState('');
  const [locality, setLocality] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Odisha');
  const [district, setDistrict] = useState('Khordha (Bhubaneswar)');
  const [pinCode, setPinCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [phoneStd, setPhoneStd] = useState('');
  const [email, setEmail] = useState('');
  const [securityInput, setSecurityInput] = useState('');

  // Captcha Generator State
  const [captchaCode, setCaptchaCode] = useState('i79Mm2');

  // Google Places Autocomplete Recommendations State
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteTimerRef = useRef<any>(null);

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

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

  // Update Districts when State changes
  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const districts = INDIAN_STATES_DISTRICTS[selectedState] || [];
    setDistrict(districts.length > 0 ? districts[0] : '');
  };

  // Google Places Autocomplete Query via Axios
  const handleAddressInputChange = (val: string) => {
    setPremise(val);

    if (autocompleteTimerRef.current) clearTimeout(autocompleteTimerRef.current);

    if (!val || val.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    autocompleteTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('/api/v1/auth/address-autocomplete', {
          params: { input: val },
        });
        const suggestions = res.data.data || [];
        setAddressSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (err) {
        console.warn('Address recommendation error:', err);
      }
    }, 350);
  };

  // Select Place from Google Suggestions and auto-fill components
  const handleSelectSuggestion = async (item: any) => {
    setPremise(item.mainText || item.description);
    setShowSuggestions(false);

    try {
      const res = await axios.get(`/api/v1/auth/place-details/${item.placeId}`);
      const details = res.data.data;
      if (details) {
        if (details.premise) setPremise(details.premise);
        if (details.subLocality) setSubLocality(details.subLocality);
        if (details.locality) setLocality(details.locality);
        if (details.pinCode) setPinCode(details.pinCode);

        if (details.state) {
          const matchedState = Object.keys(INDIAN_STATES_DISTRICTS).find(
            (s) => s.toLowerCase() === details.state.toLowerCase()
          );
          if (matchedState) {
            setState(matchedState);
            const districts = INDIAN_STATES_DISTRICTS[matchedState] || [];
            const matchedDistrict = districts.find((d) =>
              d.toLowerCase().includes(details.district.toLowerCase())
            );
            setDistrict(matchedDistrict || districts[0] || details.district);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch place details:', err);
    }
  };

  // Validation & Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your full Name.');
      return;
    }
    if (!premise.trim()) {
      setFormError('Please enter your Premise Number or Address.');
      return;
    }
    if (!state) {
      setFormError('Please select a State.');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      setFormError('Please enter a valid 10-digit Mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid E-mail address.');
      return;
    }
    if (securityInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setFormError('Security Code / Captcha does not match. Please try again.');
      generateNewCaptcha();
      return;
    }

    setIsSubmitting(true);
    const otpRes = await sendOtpRequest(mobile);
    setIsSubmitting(false);

    if (otpRes.success) {
      setOtp(otpRes.debugOtp || '123456');
      setIsOtpModalOpen(true);
    } else {
      setFormError(otpRes.message || 'Failed to dispatch OTP. Please check your mobile number.');
    }
  };

  // Confirm Registration with OTP
  const handleVerifyAndRegister = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    const payload = {
      name: name.trim(),
      gender,
      phone: mobile.trim(),
      phoneStd: phoneStd.trim(),
      email: email.trim().toLowerCase(),
      address: {
        premise: premise.trim(),
        subLocality: subLocality.trim(),
        locality: locality.trim(),
        country,
        state,
        district,
        pinCode: pinCode.trim(),
      },
      otp: otp.trim(),
    };

    const res = await registerCitizen(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsOtpModalOpen(false);
      navigate('/');
    } else {
      setOtpError(res.error || 'Registration failed. Use 123456 for instant demo testing.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left font-sans animate-in fade-in duration-200">
      
      {/* Top Banner & Heading */}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          Registration/Sign up Form
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2 text-sm">
          <span className="font-bold text-[#6F0047] text-base">
            Enter Details
          </span>
          <span className="text-red-600 font-semibold text-xs sm:text-sm">
            Fields marked with * are mandatory
          </span>
        </div>
      </div>

      {formError && <Alert variant="danger" className="mb-6">{formError}</Alert>}

      {/* Clean Open Form Layout (No Card Container) */}
      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* 2-Column Grid with Google Outlined Floating Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN                                                               */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* Name */}
            <FloatingInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            {/* Address (Premise Number or Name) with Google Places Autocomplete */}
            <div className="relative">
              <FloatingInput
                label="Address (Premise Number or Name)"
                value={premise}
                onChange={(e) => handleAddressInputChange(e.target.value)}
                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                required
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              {/* Google Places Recommendation Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowSuggestions(false)}
                >
                  {addressSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors flex items-start gap-3 group cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-bold block text-sm group-hover:text-[#2563EB]">
                          {item.mainText}
                        </strong>
                        <span className="text-slate-500 text-xs block">{item.secondaryText}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Locality */}
            <FloatingInput
              label="Locality"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />

            {/* State */}
            <FloatingSelect
              label="State"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              required
              options={[
                { label: '--Select a state--', value: '' },
                ...Object.keys(INDIAN_STATES_DISTRICTS).map((st) => ({ label: st, value: st })),
              ]}
            />

            {/* Pincode */}
            <FloatingInput
              label="Pincode"
              value={pinCode}
              maxLength={6}
              onChange={(e) => setPinCode(e.target.value)}
            />

            {/* Phone number with STD code */}
            <FloatingInput
              label="Phone number with STD code (e.g. 011XXXXXXXX)"
              value={phoneStd}
              onChange={(e) => setPhoneStd(e.target.value)}
            />

            {/* Security Code / Captcha */}
            <div className="flex items-center gap-3">
              <FloatingInput
                label="Security Code"
                value={securityInput}
                onChange={(e) => setSecurityInput(e.target.value)}
                required
              />
              
              <div className="px-4 py-3 rounded-xl bg-slate-100 border border-slate-300 select-none tracking-widest text-lg font-serif italic font-bold text-slate-800 shadow-inner shrink-0 min-w-[105px] text-center">
                {captchaCode}
              </div>

              <button
                type="button"
                onClick={generateNewCaptcha}
                className="p-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer shrink-0"
                title="Generate New Security Code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN                                                              */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* Gender Radio Buttons */}
            <div className="space-y-2 pt-1">
              <label className="text-sm font-bold text-slate-700 block">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6 pt-1">
                {(['Male', 'Female', 'Transgender'] as const).map((g) => (
                  <label key={g} className="inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base text-slate-800 font-medium">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] border-slate-300"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-locality */}
            <FloatingInput
              label="Sub-locality"
              value={subLocality}
              onChange={(e) => setSubLocality(e.target.value)}
            />

            {/* Country */}
            <FloatingSelect
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              options={[
                { label: 'India', value: 'India' },
                { label: 'Other', value: 'Other' },
              ]}
            />

            {/* District */}
            <FloatingSelect
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              options={[
                { label: state ? '--Select district--' : '--Select a state first--', value: '' },
                ...(INDIAN_STATES_DISTRICTS[state] || []).map((dst) => ({ label: dst, value: dst })),
              ]}
            />

            {/* Mobile number */}
            <FloatingInput
              label="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              leftIcon={<Smartphone className="w-4 h-4" />}
            />

            {/* E-mail address */}
            <FloatingInput
              label="E-mail address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

          </div>

        </div>

        {/* Form Actions */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-bold hover:underline">
              Sign In here
            </Link>
          </p>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="font-bold text-sm sm:text-base px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit Registration
          </Button>
        </div>

      </form>

      {/* ================= OTP VERIFICATION MODAL ================= */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title={
          <div className="flex items-center gap-3 text-[#0A2540] text-left">
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#2563EB]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Mobile OTP Verification</h3>
              <p className="text-xs text-slate-500 font-normal">
                Confirm OTP to complete statutory citizen registration.
              </p>
            </div>
          </div>
        }
        maxWidth="sm"
      >
        <div className="space-y-5 text-left font-sans">
          {otpError && <Alert variant="danger">{otpError}</Alert>}

          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-sm">
            <span className="text-slate-500 block text-xs">Verification code sent to:</span>
            <strong className="text-[#0A2540] font-bold text-sm">{mobile}</strong>
          </div>

          <FloatingInput
            label="6-Digit OTP Code"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="text-center font-mono text-xl tracking-widest font-bold"
            autoFocus
          />

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs sm:text-sm text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Demo Testing OTP: <strong>123456</strong></span>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setIsOtpModalOpen(false)} className="text-sm">
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleVerifyAndRegister}
              className="font-bold text-sm px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Verify &amp; Create Account
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
