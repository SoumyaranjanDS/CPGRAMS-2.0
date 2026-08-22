import { Router } from 'express';
import {
  registerUser,
  loginWithPassword,
  sendOtp,
  verifyOtp,
  getMe,
  getAddressRecommendations,
  getPlaceDetails,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Registration & Verification
router.post('/register', registerUser);
router.post('/login-password', loginWithPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Google Address Recommendations
router.get('/address-autocomplete', getAddressRecommendations);
router.get('/place-details/:placeId', getPlaceDetails);

// Profile
router.get('/me', authenticate, getMe);

export default router;
