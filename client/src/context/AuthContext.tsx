import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User, UserRole } from "../types/index.js";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  sendOtpRequest: (
    phoneOrEmail: string,
  ) => Promise<{ success: boolean; message?: string; debugOtp?: string }>;
  verifyOtpAndLogin: (
    phoneOrEmail: string,
    otp: string,
    name?: string,
    rolePreset?: UserRole,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRolePreset: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = "cpgrams_auth_user";
const AUTH_TOKEN_KEY = "cpgrams_auth_token";

// Demo Mock Profiles for instant 1-click role testing
export const DEMO_PROFILES: Record<UserRole, User> = {
  CITIZEN: {
    userId: "USR-882910",
    name: "Soumya Ranjan",
    phone: "+91 98765 43210",
    email: "soumya@cpgrams.gov.in",
    role: "CITIZEN",
    address: {
      pinCode: "751001",
      locality: "Saheed Nagar",
      district: "Khordha",
      state: "Odisha",
    },
  },
  GRO_OFFICER: {
    userId: "OFF-GRO-402",
    name: "Dr. Debasis Pattnaik",
    phone: "+91 94370 12345",
    email: "gro.ssepd@odisha.gov.in",
    role: "GRO_OFFICER",
    departmentId: "DEP-OD-01",
    designation: "Grievance Redressal Officer (SSEPD)",
  },
  APPELLATE_OFFICER: {
    userId: "OFF-APP-101",
    name: "Smt. Arundhati Ray, IAS",
    phone: "+91 94370 67890",
    email: "appellate.darpg@nic.in",
    role: "APPELLATE_OFFICER",
    designation: "First Appellate Authority & Special Secretary",
  },
  ADMIN: {
    userId: "ADM-SYS-001",
    name: "National DARPG Administrator",
    phone: "+91 91111 22222",
    email: "admin.cpgrams@darpg.gov.in",
    role: "ADMIN",
    designation: "System Administrator (CPGRAMS 2.0)",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 1. Initialize Auth from LocalStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.warn("Failed to parse stored auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 2. Request OTP from backend (/api/v1/auth/send-otp)
  const sendOtpRequest = async (phoneOrEmail: string) => {
    try {
      const isEmail = phoneOrEmail.includes("@");
      const payload = isEmail
        ? { email: phoneOrEmail.trim() }
        : { phone: phoneOrEmail.trim() };
      const res = await axios.post("/api/v1/auth/send-otp", payload);
      return {
        success: true,
        message: res.data.message || "OTP sent successfully",
        debugOtp: res.data.debugOtp || "123456",
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      };
    }
  };

  // 3. Verify OTP & Authenticate (/api/v1/auth/verify-otp)
  const verifyOtpAndLogin = async (
    phoneOrEmail: string,
    otp: string,
    name?: string,
    rolePreset?: UserRole,
  ) => {
    try {
      const isEmail = phoneOrEmail.includes("@");
      const payload = {
        [isEmail ? "email" : "phone"]: phoneOrEmail.trim(),
        otp: otp.trim(),
        name: name?.trim(),
      };

      const res = await axios.post("/api/v1/auth/verify-otp", payload);
      const authData = res.data.data;
      const verifiedToken = authData.accessToken;
      let authenticatedUser: User = authData.user;

      // Apply role preset if testing officer accounts
      if (rolePreset && DEMO_PROFILES[rolePreset]) {
        authenticatedUser = {
          ...authenticatedUser,
          ...DEMO_PROFILES[rolePreset],
          phone: authenticatedUser.phone || DEMO_PROFILES[rolePreset].phone,
        };
      }

      // Persist state
      setUser(authenticatedUser);
      setToken(verifiedToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, verifiedToken);
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${verifiedToken}`;

      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error:
          err.response?.data?.message || "Invalid or expired OTP. Use 123456.",
      };
    }
  };

  // 4. Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
  };

  // 5. Quick Role Switcher for instant demo transitions
  const switchRolePreset = (role: UserRole) => {
    const profile = DEMO_PROFILES[role];
    if (profile) {
      const mockToken = `mock-token-${role.toLowerCase()}-${Date.now()}`;
      setUser(profile);
      setToken(mockToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        sendOtpRequest,
        verifyOtpAndLogin,
        logout,
        switchRolePreset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
