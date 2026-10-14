import { env, logger } from '../../../config/index.js';
import { OtpModel } from '../otp.model.js';
import { OtpPurpose } from '../otp.interface.js';

export interface OtpSendResult {
  mobileNumber: string;
  expiresAt: Date;
  otp?: string;
  message: string;
}

export interface IOtpProvider {
  sendOtp(mobileNumber: string, purpose?: OtpPurpose): Promise<OtpSendResult>;
  verifyOtp(mobileNumber: string, otp: string, purpose?: OtpPurpose): Promise<boolean>;
}

/**
 * Development OTP Provider: Does not send real SMS messages.
 * Uses a default/mock OTP (e.g., '123456') or generates one and logs it cleanly.
 */
export class DevelopmentOtpProvider implements IOtpProvider {
  public async sendOtp(
    mobileNumber: string,
    purpose: OtpPurpose = 'LOGIN',
  ): Promise<OtpSendResult> {
    const otpCode = env.DEFAULT_DEV_OTP || '123456';
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    // Invalidate existing unverified OTPs for this number and purpose
    await OtpModel.deleteMany({ mobileNumber, purpose, isVerified: false });

    await OtpModel.create({
      mobileNumber,
      otp: otpCode,
      purpose,
      expiresAt,
      isVerified: false,
    });

    logger.info(
      `📱 [DEV OTP PROVIDER] Sent OTP to ${mobileNumber} for ${purpose}: [${otpCode}] (Valid for ${env.OTP_EXPIRES_IN_MINUTES} mins)`,
    );

    return {
      mobileNumber,
      expiresAt,
      otp: env.NODE_ENV === 'development' ? otpCode : undefined,
      message: `OTP sent successfully. (Dev mode OTP: ${otpCode})`,
    };
  }

  public async verifyOtp(
    mobileNumber: string,
    otp: string,
    purpose: OtpPurpose = 'LOGIN',
  ): Promise<boolean> {
    // Allow default dev OTP shortcut in development mode
    if (env.NODE_ENV === 'development' && otp === env.DEFAULT_DEV_OTP) {
      return true;
    }

    const otpRecord = await OtpModel.findOne({
      mobileNumber,
      otp,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return false;
    }

    otpRecord.isVerified = true;
    await otpRecord.save();
    return true;
  }
}

/**
 * Production OTP Provider placeholder: Structure ready for SMS Gateways (Twilio, Fast2SMS, MSG91, AWS SNS)
 */
export class ProductionOtpProvider implements IOtpProvider {
  public async sendOtp(
    mobileNumber: string,
    purpose: OtpPurpose = 'LOGIN',
  ): Promise<OtpSendResult> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    await OtpModel.deleteMany({ mobileNumber, purpose, isVerified: false });

    await OtpModel.create({
      mobileNumber,
      otp: otpCode,
      purpose,
      expiresAt,
      isVerified: false,
    });

    // TODO: Integrate actual SMS gateway API (e.g. Twilio/Fast2SMS/MSG91) here
    logger.info(`📱 [PROD OTP PROVIDER] Sending SMS OTP to ${mobileNumber}`);

    return {
      mobileNumber,
      expiresAt,
      message: 'OTP sent successfully to mobile number',
    };
  }

  public async verifyOtp(
    mobileNumber: string,
    otp: string,
    purpose: OtpPurpose = 'LOGIN',
  ): Promise<boolean> {
    const otpRecord = await OtpModel.findOne({
      mobileNumber,
      otp,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return false;
    }

    otpRecord.isVerified = true;
    await otpRecord.save();
    return true;
  }
}

export class OtpProviderFactory {
  private static devInstance: IOtpProvider = new DevelopmentOtpProvider();
  private static prodInstance: IOtpProvider = new ProductionOtpProvider();

  public static getProvider(): IOtpProvider {
    if (env.NODE_ENV === 'production') {
      return this.prodInstance;
    }
    return this.devInstance;
  }
}
