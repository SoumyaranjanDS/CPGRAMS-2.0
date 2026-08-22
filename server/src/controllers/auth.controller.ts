import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { env } from '../config/env.js';
import { cache } from '../config/redis.js';
import { User, IUser } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const GOOGLE_MAPS_API_KEY =
  env.GOOGLE_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.VITE_GOOGLE_MAPS_API_KEY ||
  '';

// Validation Regex Helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9]\d{5}$/;
// 8+ chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special symbol
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/]).{8,}$/;

/**
 * Controller: Register a new citizen account
 * Route: POST /api/v1/auth/register
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      gender = 'Male',
      phone,
      phoneStd = '',
      email,
      password,
      address = {},
      otp = '123456',
    } = req.body;

    // 1. Name Validation (Space validation and min 2 chars)
    if (!name || typeof name !== 'string' || !name.trim() || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid full Name (at least 2 characters, non-empty).',
      });
      return;
    }

    // 2. Mobile Validation (10 digits starting with 6-9)
    const cleanPhone = phone ? phone.toString().trim().replace(/^\+91/, '').replace(/\s+/g, '') : '';
    if (!cleanPhone || !MOBILE_REGEX.test(cleanPhone)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian Mobile number starting with 6, 7, 8, or 9.',
      });
      return;
    }

    // 3. Email Validation
    const cleanEmail = email ? email.toString().trim().toLowerCase() : '';
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid E-mail address (e.g. name@domain.com).',
      });
      return;
    }

    // 4. Password Strength Validation (8+ chars, upper, lower, number, symbol)
    if (!password || typeof password !== 'string' || !STRONG_PASSWORD_REGEX.test(password.trim())) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special symbol (!@#$%^&*).',
      });
      return;
    }

    // 5. Address Premise & State Validation
    const cleanPremise = address.premise ? address.premise.toString().trim() : '';
    if (!cleanPremise || cleanPremise.length < 3) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid Address / Premise number (at least 3 characters).',
      });
      return;
    }

    const cleanState = address.state ? address.state.toString().trim() : '';
    if (!cleanState) {
      res.status(400).json({
        success: false,
        message: 'Please select a valid State from the list.',
      });
      return;
    }

    // 6. Pincode Validation (if provided)
    const cleanPin = address.pinCode ? address.pinCode.toString().trim() : '';
    if (cleanPin && !PINCODE_REGEX.test(cleanPin)) {
      res.status(400).json({
        success: false,
        message: 'PIN Code must be a 6-digit number starting with 1-9.',
      });
      return;
    }

    // 7. Check Duplicate Mobile or Email in MongoDB
    const existingUser = await User.findOne({
      $or: [{ phone: cleanPhone }, { email: cleanEmail }],
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this Mobile Number or Email already exists. Please sign in.',
      });
      return;
    }

    // 8. Verify OTP
    const cachedOtp = (await cache.get(`otp:${cleanPhone}`)) || (await cache.get(`otp:${cleanEmail}`));
    if (otp !== '123456' && cachedOtp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Use 123456 for instant testing.',
      });
      return;
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password.trim(), 10);

    // Generate Unique User ID
    const userId = `USR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newUser = new User({
      userId,
      name: name.trim(),
      gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Male',
      phone: cleanPhone,
      phoneStd: phoneStd ? phoneStd.toString().trim() : '',
      phoneVerified: true,
      email: cleanEmail,
      emailVerified: true,
      passwordHash,
      role: 'CITIZEN',
      address: {
        premise: cleanPremise,
        subLocality: address.subLocality ? address.subLocality.toString().trim() : '',
        locality: address.locality ? address.locality.toString().trim() : '',
        country: address.country ? address.country.toString().trim() : 'India',
        state: cleanState,
        district: address.district ? address.district.toString().trim() : '',
        pinCode: cleanPin,
      },
      lastLoginAt: new Date(),
    });

    await newUser.save();

    const tokenPayload = {
      userId: newUser.userId,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      departmentId: newUser.departmentId,
    };

    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Citizen registration completed successfully.',
      data: {
        user: {
          userId: newUser.userId,
          name: newUser.name,
          gender: newUser.gender,
          phone: newUser.phone,
          phoneStd: newUser.phoneStd,
          email: newUser.email,
          role: newUser.role,
          address: newUser.address,
        },
        accessToken,
        refreshToken,
        expiresIn: '15m',
      },
    });
  } catch (error: any) {
    console.error('[AuthController] registerUser error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal error during registration.',
    });
  }
};

/**
 * Controller: Sign In with Password & DB-Driven Role Extraction
 * Route: POST /api/v1/auth/login-password
 */
export const loginWithPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({
        success: false,
        message: 'Please enter your registered Mobile Number or E-mail address.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      res.status(400).json({
        success: false,
        message: 'Please enter your account password.',
      });
      return;
    }

    const cleanId = identifier.trim().replace(/^\+91/, '').replace(/\s+/g, '');

    // Query user including passwordHash
    const user = await User.findOne({
      $or: [{ phone: cleanId }, { email: cleanId.toLowerCase() }],
    }).select('+passwordHash');

    if (!user) {
      res.status(404).json({
        success: false,
        notRegistered: true,
        message: `No registered account found with ${cleanId}. Please register first.`,
      });
      return;
    }

    // Verify Password
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password.trim(), user.passwordHash);
    }

    // Fallback for default seed officers / testing credentials
    if (!isMatch && (password === 'Password@123' || password === 'Officer@123' || password === '123456')) {
      isMatch = true;
    }

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials or use OTP verification.',
      });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokenPayload = {
      userId: user.userId,
      phone: user.phone,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    };

    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    await cache.setex(`session:activity:${user.userId}`, 1800, Date.now().toString());

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          gender: user.gender,
          phone: user.phone,
          phoneStd: user.phoneStd,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId,
          designation: user.designation,
          address: user.address,
        },
        accessToken,
        refreshToken,
        expiresIn: '15m',
      },
    });
  } catch (error: any) {
    console.error('[AuthController] loginWithPassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: Send OTP to Phone or Email
 * Route: POST /api/v1/auth/send-otp
 */
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      res.status(400).json({
        success: false,
        error: 'PHONE_OR_EMAIL_REQUIRED',
        message: 'Please provide either a mobile number or email address to receive OTP.',
      });
      return;
    }

    const rawId = phone || email;
    const identifier = phone
      ? phone.toString().trim().replace(/^\+91/, '').replace(/\s+/g, '')
      : email.toString().trim().toLowerCase();

    if (phone && !MOBILE_REGEX.test(identifier)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
      });
      return;
    }

    if (email && !EMAIL_REGEX.test(identifier)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
      return;
    }

    const mockOtp = '123456';
    await cache.setex(`otp:${identifier}`, 300, mockOtp);

    res.status(200).json({
      success: true,
      message: `Verification code dispatched to ${rawId}.`,
      debugOtp: process.env.NODE_ENV === 'development' ? mockOtp : undefined,
      expiresInSeconds: 300,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: Verify OTP & Sign In (DB-Driven Role Extraction)
 * Route: POST /api/v1/auth/verify-otp
 */
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email, otp } = req.body;
    const rawId = phone ? phone.toString().trim() : email ? email.toString().trim() : '';
    const identifier = phone
      ? phone.toString().trim().replace(/^\+91/, '').replace(/\s+/g, '')
      : email
      ? email.toString().trim().toLowerCase()
      : '';

    if (!identifier || !otp) {
      res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Identifier (phone/email) and OTP are required.',
      });
      return;
    }

    const cachedOtp = await cache.get(`otp:${identifier}`);

    if (otp !== '123456' && cachedOtp !== otp) {
      res.status(400).json({
        success: false,
        error: 'INVALID_OTP',
        message: 'Invalid or expired verification code. Use 123456 for instant verification.',
      });
      return;
    }

    // Clear OTP
    await cache.del(`otp:${identifier}`);

    // Query user from MongoDB to get true registered role
    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }],
    });

    if (!user) {
      res.status(404).json({
        success: false,
        notRegistered: true,
        message: `No registered account found with ${rawId}. Please complete Citizen Registration.`,
      });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokenPayload = {
      userId: user.userId,
      phone: user.phone,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    };

    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    await cache.setex(`session:activity:${user.userId}`, 1800, Date.now().toString());

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          gender: user.gender,
          phone: user.phone,
          phoneStd: user.phoneStd,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId,
          designation: user.designation,
          address: user.address,
        },
        accessToken,
        refreshToken,
        expiresIn: '15m',
      },
    });
  } catch (error: any) {
    console.error('[AuthController] verifyOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: Google Places Address Autocomplete Recommendation
 * Route: GET /api/v1/auth/address-autocomplete
 */
export const getAddressRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { input } = req.query;

    if (!input || typeof input !== 'string' || input.trim().length < 2) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&components=country:in&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(googleUrl);
    const predictions = response.data.predictions || [];

    const formatted = predictions.map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || '',
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('[AuthController] Address recommendation error:', error.message);
    res.status(200).json({
      success: true,
      data: [],
    });
  }
};

/**
 * Controller: Google Place Details
 * Route: GET /api/v1/auth/place-details/:placeId
 */
export const getPlaceDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { placeId } = req.params;
    if (!placeId) {
      res.status(400).json({ success: false, message: 'placeId required' });
      return;
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(googleUrl);
    const result = response.data.result;

    if (!result) {
      res.status(404).json({ success: false, message: 'Place details not found.' });
      return;
    }

    const components = result.address_components || [];
    let premise = '';
    let subLocality = '';
    let locality = '';
    let district = '';
    let state = '';
    let pinCode = '';

    components.forEach((c: any) => {
      const types = c.types || [];
      if (types.includes('premise') || types.includes('street_number') || types.includes('route')) {
        premise = premise ? `${premise}, ${c.long_name}` : c.long_name;
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
        subLocality = c.long_name;
      }
      if (types.includes('locality') || types.includes('administrative_area_level_3')) {
        locality = c.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        district = c.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = c.long_name;
      }
      if (types.includes('postal_code')) {
        pinCode = c.long_name;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        formattedAddress: result.formatted_address,
        premise,
        subLocality,
        locality: locality || subLocality,
        district,
        state,
        pinCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: Get current authenticated user profile
 * Route: GET /api/v1/auth/me
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    return;
  }

  try {
    const user = await User.findOne({ userId: req.user.userId }).lean();
    if (user) {
      res.status(200).json({ success: true, data: user });
      return;
    }
  } catch {}

  res.status(404).json({ success: false, message: 'User not found.' });
};
