import { AuthStrategyResolver } from './strategies/auth.strategy.js';
import { OtpProviderFactory } from './providers/otp.provider.js';
import { verifyRefreshToken, generateAuthTokens } from './auth.tokens.js';
import { userService } from '../user/user.service.js';
import { vendorService } from '../vendor/vendor.service.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';
import {
  RegisterUserDTO,
  LoginUserDTO,
  RegisterVendorDTO,
  LoginVendorDTO,
  LoginAdminDTO,
  SendOtpDTO,
  VerifyOtpDTO,
  AuthResult,
  AuthTokens,
} from './auth.interface.js';

export class AuthService {
  public async registerUser(data: RegisterUserDTO): Promise<AuthResult> {
    const strategy = AuthStrategyResolver.getStrategy();
    return strategy.registerUser(data);
  }

  public async loginUser(data: LoginUserDTO): Promise<AuthResult> {
    const strategy = AuthStrategyResolver.getStrategy();
    return strategy.loginUser(data);
  }

  public async registerVendor(data: RegisterVendorDTO): Promise<AuthResult> {
    const strategy = AuthStrategyResolver.getStrategy();
    return strategy.registerVendor(data);
  }

  public async loginVendor(data: LoginVendorDTO): Promise<AuthResult> {
    const strategy = AuthStrategyResolver.getStrategy();
    return strategy.loginVendor(data);
  }

  public async loginAdmin(data: LoginAdminDTO): Promise<AuthResult> {
    const strategy = AuthStrategyResolver.getStrategy();
    return strategy.loginAdmin(data);
  }

  public async sendOtp(data: SendOtpDTO) {
    const otpProvider = OtpProviderFactory.getProvider();
    return otpProvider.sendOtp(data.mobileNumber, data.purpose || 'LOGIN');
  }

  public async verifyOtp(data: VerifyOtpDTO): Promise<{ verified: boolean; message: string }> {
    const otpProvider = OtpProviderFactory.getProvider();
    const isValid = await otpProvider.verifyOtp(
      data.mobileNumber,
      data.otp,
      data.purpose || 'LOGIN',
    );
    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired OTP');
    }
    return { verified: true, message: 'OTP verified successfully' };
  }

  public async refreshToken(refreshTokenString: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshTokenString);
    const user = await userService.getUserById(payload.id);

    if (!user || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token or inactive user');
    }

    return generateAuthTokens(user);
  }

  public async getCurrentUser(userId: string) {
    const user = await userService.getUserById(userId);
    let vendor;
    if (user.role === 'VENDOR') {
      vendor = await vendorService.getVendorByUserId(user._id.toString());
    }

    return {
      user: {
        id: user._id.toString(),
        mobileNumber: user.mobileNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ...(vendor ? { vendor } : {}),
    };
  }
}

export const authService = new AuthService();
