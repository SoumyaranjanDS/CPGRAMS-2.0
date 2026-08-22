import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  RotateCcw,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import axios from "axios";
import { Button } from "../components/common/Button.js";
import { Alert } from "../components/common/Alert.js";
import { Modal } from "../components/common/Modal.js";
import {
  FloatingInput,
  FloatingSelect,
} from "../components/common/FloatingInput.js";
import { useAuth } from "../context/AuthContext.js";
import { useLanguage } from "../context/LanguageContext.js";

// Indian States and Major Districts mapping
const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  Odisha: [
    "Khordha (Bhubaneswar)",
    "Cuttack",
    "Puri",
    "Ganjam",
    "Balasore",
    "Sambalpur",
    "Sundargarh (Rourkela)",
    "Angul",
    "Bhadrak",
    "Mayurbhanj",
    "Jajpur",
    "Kendrapara",
  ],
  Delhi: [
    "New Delhi",
    "Central Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
    "South West Delhi",
    "Shahdara",
  ],
  Maharashtra: [
    "Mumbai City",
    "Mumbai Suburban",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
  ],
  Karnataka: [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Dakshina Kannada (Mangaluru)",
    "Belagavi",
    "Hubballi-Dharwad",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Kanchipuram",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur Nagar",
    "Gautam Buddha Nagar (Noida)",
    "Ghaziabad",
    "Varanasi",
    "Prayagraj",
    "Agra",
  ],
  "West Bengal": [
    "Kolkata",
    "North 24 Parganas",
    "South 24 Parganas",
    "Howrah",
    "Hooghly",
    "Darjeeling",
    "Purba Medinipur",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Gandhinagar",
  ],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"],
  Telangana: [
    "Hyderabad",
    "Medchal-Malkajgiri",
    "Rangareddy",
    "Warangal",
    "Nizamabad",
  ],
};

// Validation Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9]\d{5}$/;
const NAME_REGEX = /^[a-zA-Z\s.'-]+$/;

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registerCitizen, sendOtpRequest, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const redirectPath = searchParams.get("redirect")
    ? decodeURIComponent(searchParams.get("redirect")!)
    : "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Form State
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [premise, setPremise] = useState("");
  const [subLocality, setSubLocality] = useState("");
  const [locality, setLocality] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("Khordha (Bhubaneswar)");
  const [pinCode, setPinCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [phoneStd, setPhoneStd] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [securityInput, setSecurityInput] = useState("");

  // Field Specific Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Captcha Generator State
  const [captchaCode, setCaptchaCode] = useState("i79Mm2");

  // Google Places Autocomplete Recommendations State
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteTimerRef = useRef<any>(null);

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Password Rules Checklist State
  const passHasMinLen = password.length >= 8;
  const passHasUpper = /[A-Z]/.test(password);
  const passHasLower = /[a-z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/]/.test(password);
  const isPasswordStrong =
    passHasMinLen &&
    passHasUpper &&
    passHasLower &&
    passHasNumber &&
    passHasSymbol;
  const isPasswordMatching =
    confirmPassword.length > 0 && password === confirmPassword;

  // Clear specific field error on change
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
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setSecurityInput("");
    clearFieldError("securityInput");
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  // Update Districts when State changes
  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    clearFieldError("state");
    const districts = INDIAN_STATES_DISTRICTS[selectedState] || [];
    setDistrict(districts.length > 0 ? districts[0] : "");
  };

  // Google Places Autocomplete Query via Axios
  const handleAddressInputChange = (val: string) => {
    setPremise(val);
    clearFieldError("premise");

    if (autocompleteTimerRef.current)
      clearTimeout(autocompleteTimerRef.current);

    if (!val || val.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    autocompleteTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get("/api/v1/auth/address-autocomplete", {
          params: { input: val },
        });
        const suggestions = res.data.data || [];
        setAddressSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (err) {
        console.warn("Address recommendation error:", err);
      }
    }, 350);
  };

  // Select Place from Google Suggestions and auto-fill components
  const handleSelectSuggestion = async (item: any) => {
    setPremise(item.mainText || item.description);
    clearFieldError("premise");
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
            (s) => s.toLowerCase() === details.state.toLowerCase(),
          );
          if (matchedState) {
            setState(matchedState);
            const districts = INDIAN_STATES_DISTRICTS[matchedState] || [];
            const matchedDistrict = districts.find((d) =>
              d.toLowerCase().includes(details.district.toLowerCase()),
            );
            setDistrict(matchedDistrict || districts[0] || details.district);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch place details:", err);
    }
  };

  // Comprehensive Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = t("Full name is mandatory and cannot be empty spaces.");
    } else if (name.trim().length < 2) {
      errors.name = t("Name must be at least 2 characters.");
    } else if (!NAME_REGEX.test(name.trim())) {
      errors.name = t("Name can only contain alphabets, spaces, and dots.");
    }

    if (!premise.trim()) {
      errors.premise = t("Premise Number or Address is mandatory.");
    } else if (premise.trim().length < 3) {
      errors.premise = t("Address must be at least 3 characters.");
    }

    if (!state) {
      errors.state = t("Please select a State.");
    }
    if (!district) {
      errors.district = t("Please select a District.");
    }

    if (pinCode.trim() && !PINCODE_REGEX.test(pinCode.trim())) {
      errors.pinCode = t(
        "PIN Code must be a 6-digit number starting with 1-9.",
      );
    }

    const cleanMobile = mobile.trim().replace(/^\+91/, "").replace(/\s+/g, "");
    if (!cleanMobile) {
      errors.mobile = t("Mobile number is mandatory.");
    } else if (!MOBILE_REGEX.test(cleanMobile)) {
      errors.mobile = t(
        "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.",
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      errors.email = t("E-mail address is mandatory.");
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = t("Enter a valid e-mail address (e.g. name@domain.com).");
    }

    if (!password) {
      errors.password = t("Password is mandatory.");
    } else if (!isPasswordStrong) {
      errors.password = t(
        "Password must meet all 5 security requirements below.",
      );
    }

    if (!confirmPassword) {
      errors.confirmPassword = t("Please confirm your password.");
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t("Passwords do not match.");
    }

    if (!securityInput.trim()) {
      errors.securityInput = t("Security code is mandatory.");
    } else if (
      securityInput.trim().toLowerCase() !== captchaCode.toLowerCase()
    ) {
      errors.securityInput = t("Captcha code does not match. Try again.");
      generateNewCaptcha();
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const isValid = validateForm();
    if (!isValid) {
      setFormError(t("Please fix all highlighted errors before submitting."));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const cleanMobile = mobile.trim().replace(/^\+91/, "").replace(/\s+/g, "");

    setIsSubmitting(true);
    const otpRes = await sendOtpRequest(cleanMobile);
    setIsSubmitting(false);

    if (otpRes.success) {
      setOtp(otpRes.debugOtp || "123456");
      setIsOtpModalOpen(true);
    } else {
      setFormError(
        otpRes.message ||
          t("Failed to dispatch OTP. Please check your mobile number."),
      );
    }
  };

  // Confirm Registration with OTP
  const handleVerifyAndRegister = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError(t("Please enter a valid 6-digit OTP code."));
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    const cleanMobile = mobile.trim().replace(/^\+91/, "").replace(/\s+/g, "");

    const payload = {
      name: name.trim(),
      gender,
      phone: cleanMobile,
      phoneStd: phoneStd.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
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
      navigate(redirectPath, { replace: true });
    } else {
      setOtpError(
        res.error ||
          t("Registration failed. Use 123456 for instant demo testing."),
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left font-sans animate-in fade-in duration-200">
      
      {/* Top Back Navigation Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A2540] bg-slate-100/90 hover:bg-slate-200/90 px-3 py-1.5 rounded-xl transition-all cursor-pointer mb-5 shadow-2xs group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>{t('Back')}</span>
      </button>

      {/* Top Banner & Heading */}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          {t("Registration/Sign up Form")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2 text-sm">
          <span className="font-bold text-[#6F0047] text-base">
            {t("Enter Details")}
          </span>
          <span className="text-red-600 font-semibold text-xs sm:text-sm">
            {t("Fields marked with * are mandatory")}
          </span>
        </div>
      </div>

      {formError && (
        <Alert variant="danger" className="mb-6">
          {formError}
        </Alert>
      )}

      {/* Clean Open Form Layout */}
      <form onSubmit={handleFormSubmit} noValidate className="space-y-8">
        {/* 2-Column Grid with Google Outlined Floating Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {/* ========================================================================= */}
          {/* LEFT COLUMN                                                               */}
          {/* ========================================================================= */}
          <div className="space-y-5">
            {/* Name */}
            <FloatingInput
              label={t("Name")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              required
              error={fieldErrors.name}
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            {/* Address (Premise Number or Name) with Google Places Autocomplete */}
            <div className="relative">
              <FloatingInput
                label={t("Address (Premise Number or Name)")}
                value={premise}
                onChange={(e) => handleAddressInputChange(e.target.value)}
                onFocus={() =>
                  addressSuggestions.length > 0 && setShowSuggestions(true)
                }
                required
                error={fieldErrors.premise}
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
                        <span className="text-slate-500 text-xs block">
                          {item.secondaryText}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Locality */}
            <FloatingInput
              label={t("Locality")}
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />

            {/* State */}
            <FloatingSelect
              label={t("State")}
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              required
              error={fieldErrors.state}
              options={[
                { label: `--${t("Select a state")}--`, value: "" },
                ...Object.keys(INDIAN_STATES_DISTRICTS).map((st) => ({
                  label: st,
                  value: st,
                })),
              ]}
            />

            {/* Pincode */}
            <FloatingInput
              label={`${t("Pincode")} (6 ${t("digits")})`}
              value={pinCode}
              maxLength={6}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPinCode(val);
                clearFieldError("pinCode");
              }}
              error={fieldErrors.pinCode}
            />

            {/* Phone number with STD code */}
            <FloatingInput
              label={t("Phone number with STD code (e.g. 011XXXXXXXX)")}
              value={phoneStd}
              onChange={(e) => setPhoneStd(e.target.value)}
            />

            {/* Password */}
            <div className="space-y-2">
              <FloatingInput
                label={`${t("Password")} (${t("min 8 chars, mixed")})`}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />

              {/* Real-time Password Strength Checklist */}
              {password.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600 animate-in fade-in duration-150">
                  <div className="font-bold text-slate-700 pb-0.5">
                    {t("Password Security Checklist")}:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div
                      className={`flex items-center gap-1.5 ${passHasMinLen ? "text-emerald-700 font-semibold" : "text-slate-400"}`}
                    >
                      {passHasMinLen ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span>8+ {t("Characters")}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passHasUpper ? "text-emerald-700 font-semibold" : "text-slate-400"}`}
                    >
                      {passHasUpper ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span>{t("Uppercase")} (A-Z)</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passHasLower ? "text-emerald-700 font-semibold" : "text-slate-400"}`}
                    >
                      {passHasLower ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span>{t("Lowercase")} (a-z)</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${passHasNumber ? "text-emerald-700 font-semibold" : "text-slate-400"}`}
                    >
                      {passHasNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span>{t("Number")} (0-9)</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 col-span-2 ${passHasSymbol ? "text-emerald-700 font-semibold" : "text-slate-400"}`}
                    >
                      {passHasSymbol ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span>{t("Special Symbol")} (!@#$%^&amp;*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Code / Captcha */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <FloatingInput
                  label={t("Security Code")}
                  value={securityInput}
                  onChange={(e) => {
                    setSecurityInput(e.target.value);
                    clearFieldError("securityInput");
                  }}
                  required
                  error={fieldErrors.securityInput}
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
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN                                                              */}
          {/* ========================================================================= */}
          <div className="space-y-5">
            {/* Gender Radio Buttons */}
            <div className="space-y-2 pt-1">
              <label className="text-sm font-bold text-slate-700 block">
                {t("Gender")} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6 pt-1">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <label
                    key={g}
                    className="inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base text-slate-800 font-medium"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] border-slate-300"
                    />
                    <span>{t(g)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-locality */}
            <FloatingInput
              label={t("Sub-locality")}
              value={subLocality}
              onChange={(e) => setSubLocality(e.target.value)}
            />

            {/* Country */}
            <FloatingSelect
              label={t("Country")}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              options={[
                { label: t("India"), value: "India" },
                { label: t("Other"), value: "Other" },
              ]}
            />

            {/* District */}
            <FloatingSelect
              label={t("District")}
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                clearFieldError("district");
              }}
              required
              error={fieldErrors.district}
              options={[
                {
                  label: state
                    ? `--${t("Select district")}--`
                    : `--${t("Select a state first")}--`,
                  value: "",
                },
                ...(INDIAN_STATES_DISTRICTS[state] || []).map((dst) => ({
                  label: dst,
                  value: dst,
                })),
              ]}
            />

            {/* Mobile number */}
            <FloatingInput
              label={`${t("Mobile number")} (10 ${t("digits")})`}
              value={mobile}
              maxLength={10}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setMobile(val);
                clearFieldError("mobile");
              }}
              required
              error={fieldErrors.mobile}
              leftIcon={<Smartphone className="w-4 h-4" />}
            />

            {/* E-mail address */}
            <FloatingInput
              label={t("E-mail address")}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              required
              error={fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {/* Confirm Password */}
            <div className="space-y-2">
              <FloatingInput
                label={t("Confirm Password")}
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError("confirmPassword");
                }}
                required
                error={fieldErrors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              {/* Confirm Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <div
                  className={`text-xs font-semibold flex items-center gap-1.5 pl-1 ${isPasswordMatching ? "text-emerald-700" : "text-red-600"}`}
                >
                  {isPasswordMatching ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{t("Passwords match perfectly")}</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{t("Passwords do not match")}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            {t("Already have an account?")}{" "}
            <Link
              to="/login"
              className="text-[#2563EB] font-bold hover:underline"
            >
              {t("Sign In here")}
            </Link>
          </p>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="font-bold text-sm sm:text-base px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t("Submit Registration")}
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
              <h3 className="text-lg font-bold">
                {t("Mobile OTP Verification")}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {t("Confirm OTP to complete statutory citizen registration.")}
              </p>
            </div>
          </div>
        }
        maxWidth="sm"
      >
        <div className="space-y-5 text-left font-sans">
          {otpError && <Alert variant="danger">{otpError}</Alert>}

          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-sm">
            <span className="text-slate-500 block text-xs">
              {t("Verification code sent to")}:
            </span>
            <strong className="text-[#0A2540] font-bold text-sm">
              +91 {mobile}
            </strong>
          </div>

          <FloatingInput
            label={t("6-Digit OTP Code")}
            value={otp}
            maxLength={6}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtp(val);
              setOtpError(null);
            }}
            required
            className="text-center font-mono text-xl tracking-widest font-bold"
            autoFocus
          />

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs sm:text-sm text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t("Demo Testing OTP")}: <strong>123456</strong>
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOtpModalOpen(false)}
              className="text-sm"
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleVerifyAndRegister}
              className="font-bold text-sm px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              {t("Verify & Create Account")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
