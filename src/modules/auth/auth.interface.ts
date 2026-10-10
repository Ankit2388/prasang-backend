import { UserResponseDTO } from '../user/user.interface.js';
import { IVendorDocument } from '../vendor/vendor.interface.js';
import { IBusinessDocument } from '../business/business.interface.js';
import { OtpPurpose } from './otp.interface.js';

export interface RegisterUserDTO {
  mobileNumber: string;
  name: string;
  password?: string;
  email?: string;
}

export interface LoginUserDTO {
  mobileNumber: string;
  password?: string;
  otp?: string;
}

export interface RegisterVendorDTO {
  mobileNumber: string;
  name: string;
  password?: string;
  email?: string;
}

export interface LoginVendorDTO {
  mobileNumber: string;
  password?: string;
  otp?: string;
}

export interface LoginAdminDTO {
  mobileNumber: string;
  password: string;
}

export interface SendOtpDTO {
  mobileNumber: string;
  purpose?: OtpPurpose;
}

export interface VerifyOtpDTO {
  mobileNumber: string;
  otp: string;
  purpose?: OtpPurpose;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: UserResponseDTO;
  vendor?: IVendorDocument;
  business?: IBusinessDocument;
  tokens: AuthTokens;
}

