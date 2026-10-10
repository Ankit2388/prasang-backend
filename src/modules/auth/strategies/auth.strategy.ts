import { env } from '../../../config/index.js';
import { ApiError } from '../../../utils/api-error.js';
import { StatusCodes } from '../../../constants/index.js';
import { USER_ROLES } from '../../../constants/roles.js';
import { userService } from '../../user/user.service.js';
import { vendorService } from '../../vendor/vendor.service.js';
import { businessService } from '../../business/business.service.js';
import { IVendorDocument } from '../../vendor/vendor.interface.js';
import { IBusinessDocument } from '../../business/business.interface.js';
import { OtpProviderFactory } from '../providers/otp.provider.js';
import {
  RegisterUserDTO,
  LoginUserDTO,
  RegisterVendorDTO,
  LoginVendorDTO,
  LoginAdminDTO,
  AuthResult,
  AuthTokens,
} from '../auth.interface.js';
import { generateAuthTokens } from '../auth.tokens.js';
import { IUserDocument, UserResponseDTO } from '../../user/user.interface.js';

export interface IAuthStrategy {
  registerUser(data: RegisterUserDTO): Promise<AuthResult>;
  loginUser(data: LoginUserDTO): Promise<AuthResult>;
  registerVendor(data: RegisterVendorDTO): Promise<AuthResult>;
  loginVendor(data: LoginVendorDTO): Promise<AuthResult>;
  loginAdmin(data: LoginAdminDTO): Promise<AuthResult>;
}

const mapUserToDTO = (user: IUserDocument): UserResponseDTO => ({
  id: user._id.toString(),
  mobileNumber: user.mobileNumber,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateResult = async (
  user: IUserDocument,
  vendorProfile?: IVendorDocument,
  businessProfile?: IBusinessDocument,
): Promise<AuthResult> => {
  await userService.updateLastLogin(user._id.toString());
  const tokens: AuthTokens = generateAuthTokens(user);
  return {
    user: mapUserToDTO(user),
    ...(vendorProfile ? { vendor: vendorProfile } : {}),
    ...(businessProfile ? { business: businessProfile } : {}),
    tokens,
  };
};

/**
 * Mobile Number + Password Authentication Strategy (Development Default)
 */
export class PasswordAuthStrategy implements IAuthStrategy {
  public async registerUser(data: RegisterUserDTO): Promise<AuthResult> {
    if (!data.password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Password is required for registration in password authentication mode',
      );
    }

    const user = await userService.createUser({
      mobileNumber: data.mobileNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      email: data.email,
      role: USER_ROLES.USER,
    });

    return generateResult(user);
  }

  public async loginUser(data: LoginUserDTO): Promise<AuthResult> {
    if (!data.password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Password is required for login in password authentication mode',
      );
    }

    const user = await userService.getUserByMobileWithPassword(data.mobileNumber);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid mobile number or password');
    }

    if (!user.isActive) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'User account is deactivated. Contact support.');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid mobile number or password');
    }

    return generateResult(user);
  }

  public async registerVendor(data: RegisterVendorDTO): Promise<AuthResult> {
    if (!data.password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Password is required for vendor registration in password authentication mode',
      );
    }

    const user = await userService.createUser({
      mobileNumber: data.mobileNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      email: data.email,
      role: USER_ROLES.VENDOR,
    });

    const vendor = await vendorService.createVendorProfile({
      userId: user._id.toString(),
      ownerName: `${data.firstName} ${data.lastName}`.trim(),
    });

    return generateResult(user, vendor);
  }

  public async loginVendor(data: LoginVendorDTO): Promise<AuthResult> {
    if (!data.password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Password is required for vendor login in password authentication mode',
      );
    }

    const user = await userService.getUserByMobileWithPassword(data.mobileNumber);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid mobile number or password');
    }

    if (user.role !== USER_ROLES.VENDOR && user.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied: You do not have a vendor account');
    }

    if (!user.isActive) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Vendor account is deactivated');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid mobile number or password');
    }

    const vendor = await vendorService.getVendorByUserId(user._id.toString());
    const business = vendor
      ? await businessService.getBusinessByVendorId(vendor._id.toString())
      : null;

    return generateResult(user, vendor || undefined, business || undefined);
  }

  public async loginAdmin(data: LoginAdminDTO): Promise<AuthResult> {
    const user = await userService.getUserByMobileWithPassword(data.mobileNumber);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid admin credentials');
    }

    if (user.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied: Super Admin credentials required');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid admin credentials');
    }

    return generateResult(user);
  }
}

/**
 * Mobile Number + OTP Authentication Strategy (Production Ready)
 */
export class OtpAuthStrategy implements IAuthStrategy {
  private otpProvider = OtpProviderFactory.getProvider();

  public async registerUser(data: RegisterUserDTO): Promise<AuthResult> {
    const user = await userService.createUser({
      mobileNumber: data.mobileNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: USER_ROLES.USER,
    });

    return generateResult(user);
  }

  public async loginUser(data: LoginUserDTO): Promise<AuthResult> {
    if (!data.otp) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'OTP is required for login in OTP authentication mode',
      );
    }

    const isValid = await this.otpProvider.verifyOtp(data.mobileNumber, data.otp, 'LOGIN');
    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired OTP');
    }

    let user = await userService.getUserByMobile(data.mobileNumber);
    if (!user) {
      // Auto-register user on first successful OTP login if user doesn't exist yet
      user = await userService.createUser({
        mobileNumber: data.mobileNumber,
        firstName: 'User',
        lastName: data.mobileNumber.slice(-4),
        role: USER_ROLES.USER,
      });
    }

    if (!user.isActive) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'User account is deactivated');
    }

    return generateResult(user);
  }

  public async registerVendor(data: RegisterVendorDTO): Promise<AuthResult> {
    const user = await userService.createUser({
      mobileNumber: data.mobileNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: USER_ROLES.VENDOR,
    });

    const vendor = await vendorService.createVendorProfile({
      userId: user._id.toString(),
      ownerName: `${data.firstName} ${data.lastName}`.trim(),
    });

    return generateResult(user, vendor);
  }

  public async loginVendor(data: LoginVendorDTO): Promise<AuthResult> {
    if (!data.otp) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'OTP is required for vendor login in OTP authentication mode',
      );
    }

    const isValid = await this.otpProvider.verifyOtp(data.mobileNumber, data.otp, 'LOGIN');
    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired OTP');
    }

    const user = await userService.getUserByMobile(data.mobileNumber);
    if (!user) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'No vendor account found associated with this mobile number. Please register as a vendor first.',
      );
    }

    if (user.role !== USER_ROLES.VENDOR && user.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Access denied: Mobile number is not registered as a vendor',
      );
    }

    const vendor = await vendorService.getVendorByUserId(user._id.toString());
    const business = vendor
      ? await businessService.getBusinessByVendorId(vendor._id.toString())
      : null;

    return generateResult(user, vendor || undefined, business || undefined);
  }

  public async loginAdmin(data: LoginAdminDTO): Promise<AuthResult> {
    const user = await userService.getUserByMobileWithPassword(data.mobileNumber);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid admin credentials');
    }

    if (user.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied: Super Admin account required');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid admin credentials');
    }

    return generateResult(user);
  }
}

export class AuthStrategyResolver {
  private static passwordStrategy = new PasswordAuthStrategy();
  private static otpStrategy = new OtpAuthStrategy();

  public static getStrategy(): IAuthStrategy {
    if (env.AUTH_MODE === 'otp') {
      return this.otpStrategy;
    }
    return this.passwordStrategy;
  }
}

