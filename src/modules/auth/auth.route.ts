import { Router } from 'express';
import { z } from 'zod';
import { authController } from './auth.controller.js';
import { validateRequest, authenticate } from '../../middlewares/index.js';

const router = Router();

// Mobile number regex (Standard 10-digit Indian mobile format)
const mobileRegex = /^[6-9]\d{9}$/;

// Zod Validation Schemas
const registerUserSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    email: z.string().email('Invalid email address format').optional(),
  }),
});

const loginUserSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    password: z.string().optional(),
    otp: z.string().optional(),
  }),
});

const registerVendorSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    email: z.string().email('Invalid email address format').optional(),
  }),
});

const loginVendorSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    password: z.string().optional(),
    otp: z.string().optional(),
  }),
});

const loginAdminSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const sendOtpSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    purpose: z.enum(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET']).optional(),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    mobileNumber: z
      .string()
      .regex(mobileRegex, 'Invalid mobile number. Must be a valid 10-digit Indian mobile number'),
    otp: z.string().min(4, 'OTP must be at least 4 digits'),
    purpose: z.enum(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET']).optional(),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Authentication Routes
router.post('/register/user', validateRequest(registerUserSchema), authController.registerUser);
router.post('/login/user', validateRequest(loginUserSchema), authController.loginUser);

router.post(
  '/register/vendor',
  validateRequest(registerVendorSchema),
  authController.registerVendor,
);
router.post('/login/vendor', validateRequest(loginVendorSchema), authController.loginVendor);

router.post('/login/admin', validateRequest(loginAdminSchema), authController.loginAdmin);

router.post('/send-otp', validateRequest(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);

router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getCurrentUser);

export const authRoutes = router;
