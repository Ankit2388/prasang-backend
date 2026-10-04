import { Document } from 'mongoose';

export type OtpPurpose = 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET';

export interface IOtp {
  mobileNumber: string;
  otp: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpDocument extends IOtp, Document {}
