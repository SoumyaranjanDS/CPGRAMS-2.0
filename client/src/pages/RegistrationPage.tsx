import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RotateCcw,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Alert } from '../components/common/Alert.js';
import { Modal } from '../components/common/Modal.js';
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
          // Find matching state in dictionary
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

    // Trigger OTP dispatch to mobile
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Page Banner */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          Registration/Sign up Form
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <span className="text-sm font-bold text-[#6F0047]">
            Enter Details
          </span>
          <span className="text-xs text-red-600 font-semibold">
            Fields marked with * are mandatory
          </span>
        </div>
      </div>

      {formError && <Alert variant="danger" className="mb-6">{formError}</Alert>}

      <Card padding="lg" className="bg-white border-slate-200 shadow-xs rounded-2xl">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* Main 2-Column Form Grid matching Government Portal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            
            {/* ========================================================================= */}
            {/* LEFT COLUMN                                                               */}
            {/* ========================================================================= */}
            <div className="space-y-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Address (Premise Number or Name) with Google Places Autocomplete */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#2563EB] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Google Autocomplete Active
                  </span>
                </div>
                
                <input
                  type="text"
                  value={premise}
                  onChange={(e) => handleAddressInputChange(e.target.value)}
                  onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Premise Number or Name (Start typing for Google recommendations)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />

                {/* Google Places Recommendation Dropdown */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setShowSuggestions(false)}
                  >
                    {addressSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-blue-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 font-bold block group-hover:text-[#2563EB]">
                            {item.mainText}
                          </strong>
                          <span className="text-slate-500 text-[11px] block">{item.secondaryText}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Locality */}
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Locality"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">--Select a state--</option>
                  {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pinCode}
                  maxLength={6}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="6-digit Postal PIN code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Phone number with STD code */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Phone number
                </label>
                <input
                  type="text"
                  value={phoneStd}
                  onChange={(e) => setPhoneStd(e.target.value)}
                  placeholder="Phone number with STD code. (e.g 011XXXXXXXX)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Security Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Security Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={securityInput}
                  onChange={(e) => setSecurityInput(e.target.value)}
                  placeholder="Enter characters shown in captcha image"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

            </div>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN                                                              */}
            {/* ========================================================================= */}
            <div className="space-y-5">
              
              {/* Gender Radio Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6 pt-2">
                  {(['Male', 'Female', 'Transgender'] as const).map((g) => (
                    <label key={g} className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-800 font-medium">
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
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Sub-locality
                </label>
                <input
                  type="text"
                  value={subLocality}
                  onChange={(e) => setSubLocality(e.target.value)}
                  placeholder="Sub-locality"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">--Select a state first--</option>
                  {(INDIAN_STATES_DISTRICTS[state] || []).map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile number */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Mobile number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* E-mail address */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                  E-mail address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Captcha Display & Refresh Button */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-500 block">
                  Captcha Verification
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 select-none tracking-widest text-lg font-serif italic font-bold text-slate-800 shadow-inner bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[size:8px_8px]">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer"
                    title="Generate New Security Code"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2563EB] font-bold hover:underline">
                Sign In here
              </Link>
            </p>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="font-bold text-xs sm:text-sm px-8 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Registration
            </Button>
          </div>

        </form>
      </Card>

      {/* ================= OTP VERIFICATION MODAL ================= */}
      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5 text-[#0A2540] text-left">
            <div className="p-2 rounded-xl bg-blue-100 text-[#2563EB]">
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
        <div className="space-y-4 text-left">
          {otpError && <Alert variant="danger">{otpError}</Alert>}

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
            <span className="text-slate-500 block">Verification code sent to:</span>
            <strong className="text-[#0A2540] font-bold">{mobile}</strong>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Enter 6-Digit OTP Code *
            </label>
            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-center font-mono text-xl tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Demo Testing OTP: <strong>123456</strong></span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setIsOtpModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleVerifyAndRegister}
              className="font-bold text-xs px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Verify &amp; Create Account
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
