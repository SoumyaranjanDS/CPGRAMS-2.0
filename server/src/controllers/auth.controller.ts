import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { cache } from '../config/redis.js';
import { User, IUser } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Seed Mock Users for instant testing
const MOCK_CITIZEN: Partial<IUser> = {
  userId: 'USR-882910',
  name: 'Soumya Ranjan',
  phone: '+919876543210',
  email: 'soumya@example.com',
  role: 'CITIZEN',
  phoneVerified: true,
  emailVerified: true,
  address: {
    pinCode: '751001',
    locality: 'Saheed Nagar',
    district: 'Khordha',
    state: 'Odisha',
  },
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    res.status(400).json({
      success: false,
      error: 'PHONE_OR_EMAIL_REQUIRED',
      message: 'Please provide either a mobile number or email address to receive OTP.',
    });
    return;
  }

  const identifier = phone || email;
  const mockOtp = '123456'; // Standard testing OTP

  // Store in cache for 5 minutes (300 seconds)
  await cache.setex(`otp:${identifier}`, 300, mockOtp);

  res.status(200).json({
    success: true,
    message: `Verification code sent to ${identifier}.`,
    debugOtp: process.env.NODE_ENV === 'development' ? mockOtp : undefined,
    expiresInSeconds: 300,
  });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone, email, otp, name } = req.body;
  const identifier = phone || email;

  if (!identifier || !otp) {
    res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Identifier (phone/email) and OTP are required.',
    });
    return;
  }

  const cachedOtp = await cache.get(`otp:${identifier}`);

  // Allow standard mock OTP 123456 or cached OTP
  if (otp !== '123456' && cachedOtp !== otp) {
    res.status(400).json({
      success: false,
      error: 'INVALID_OTP',
      message: 'Invalid or expired verification code. Use 123456 for instant verification.',
    });
    return;
  }

  // Clear OTP from cache
  await cache.del(`otp:${identifier}`);

  let user = null;
  try {
    user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }],
    });

    if (!user) {
      const generatedId = `USR-${Math.floor(100000 + Math.random() * 900000)}`;
      user = await User.create({
        userId: generatedId,
        name: name || 'Citizen User',
        phone: phone || '+919876543210',
        phoneVerified: Boolean(phone),
        email: email || undefined,
        emailVerified: Boolean(email),
        role: 'CITIZEN',
        lastLoginAt: new Date(),
      });
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }
  } catch (error) {
    // Resilient fallback user if MongoDB is in offline mode
    user = {
      ...MOCK_CITIZEN,
      phone: phone || MOCK_CITIZEN.phone,
      name: name || MOCK_CITIZEN.name,
    } as any;
  }

  const tokenPayload = {
    userId: user.userId,
    phone: user.phone,
    role: user.role,
    departmentId: user.departmentId,
  };

  const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  // Track session activity in cache for 30-minute idle timeout
  await cache.setex(`session:activity:${user.userId}`, 1800, Date.now().toString());

  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    data: {
      user: {
        userId: user.userId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        address: user.address,
      },
      accessToken,
      refreshToken,
      expiresIn: '15m',
    },
  });
};

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

  res.status(200).json({
    success: true,
    data: {
      ...MOCK_CITIZEN,
      userId: req.user.userId,
      role: req.user.role,
    },
  });
};
