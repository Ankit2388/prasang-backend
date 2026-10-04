import { Schema, model } from 'mongoose';
import { IOtpDocument } from './otp.interface.js';

const otpSchema = new Schema<IOtpDocument>(
  {
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      index: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'REGISTRATION', 'PASSWORD_RESET'],
      default: 'LOGIN',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Mongoose TTL index automatically removes expired records
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const OtpModel = model<IOtpDocument>('Otp', otpSchema);
