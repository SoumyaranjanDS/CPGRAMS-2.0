import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, UserRole } from '../types/index.js';

export interface RegistrationPayload {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  phoneStd?: string;
  email: string;
  password: string;
  address: {
    premise?: string;
    subLocality?: string;
    locality?: string;
    country?: string;
    state?: string;
    district?: string;
    pinCode?: string;
  };
  otp: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtpRequest: (phoneOrEmail: string) => Promise<{ success: boolean; message?: string; debugOtp?: string }>;
  loginWithOtp: (
    phoneOrEmail: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string; notRegistered?: boolean; role?: UserRole }>;
  loginWithPassword: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; notRegistered?: boolean; role?: UserRole }>;
  registerCitizen: (
    payload: RegistrationPayload
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'cpgrams_auth_user';
const AUTH_TOKEN_KEY = 'cpgrams_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth from LocalStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.warn('Failed to parse stored auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. Request OTP from backend (/api/v1/auth/send-otp)
  const sendOtpRequest = async (phoneOrEmail: string) => {
    try {
      const isEmail = phoneOrEmail.includes('@');
      const payload = isEmail ? { email: phoneOrEmail.trim() } : { phone: phoneOrEmail.trim() };
      const res = await axios.post('/api/v1/auth/send-otp', payload);
      return {
        success: true,
        message: res.data.message || 'OTP sent successfully',
        debugOtp: res.data.debugOtp || '123456',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send OTP. Please try again.',
      };
    }
  };

  // 2. Sign In with Password (/api/v1/auth/login-password)
  const loginWithPassword = async (identifier: string, password: string) => {
    try {
      const res = await axios.post('/api/v1/auth/login-password', {
        identifier: identifier.trim(),
        password: password.trim(),
      });
      const authData = res.data.data;
      const verifiedToken = authData.accessToken;
      const authenticatedUser: User = authData.user;

      setUser(authenticatedUser);
      setToken(verifiedToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, verifiedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${verifiedToken}`;

      return {
        success: true,
        role: authenticatedUser.role,
      };
    } catch (err: any) {
      const respData = err.response?.data;
      return {
        success: false,
        notRegistered: respData?.notRegistered || false,
        error: respData?.message || 'Incorrect credentials. Please try again.',
      };
    }
  };

  // 3. Sign In with OTP (DB-Driven Role Verification)
  const loginWithOtp = async (phoneOrEmail: string, otp: string) => {
    try {
      const isEmail = phoneOrEmail.includes('@');
      const payload = {
        [isEmail ? 'email' : 'phone']: phoneOrEmail.trim(),
        otp: otp.trim(),
      };

      const res = await axios.post('/api/v1/auth/verify-otp', payload);
      const authData = res.data.data;
      const verifiedToken = authData.accessToken;
      const authenticatedUser: User = authData.user;

      setUser(authenticatedUser);
      setToken(verifiedToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, verifiedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${verifiedToken}`;

      return {
        success: true,
        role: authenticatedUser.role,
      };
    } catch (err: any) {
      const respData = err.response?.data;
      return {
        success: false,
        notRegistered: respData?.notRegistered || false,
        error: respData?.message || 'Invalid or expired OTP. Please try again.',
      };
    }
  };

  // 4. Register Citizen (/api/v1/auth/register)
  const registerCitizen = async (payload: RegistrationPayload) => {
    try {
      const res = await axios.post('/api/v1/auth/register', payload);
      const authData = res.data.data;
      const verifiedToken = authData.accessToken;
      const authenticatedUser: User = authData.user;

      setUser(authenticatedUser);
      setToken(verifiedToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, verifiedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${verifiedToken}`;

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed. Please check your details.',
      };
    }
  };

  // 5. Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        sendOtpRequest,
        loginWithPassword,
        loginWithOtp,
        registerCitizen,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
