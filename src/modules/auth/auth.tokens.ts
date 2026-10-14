import jwt from 'jsonwebtoken';
import { env } from '../../config/index.js';
import { IUserDocument } from '../user/user.interface.js';
import { AuthUserPayload } from '../../types/index.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';
import { AuthTokens } from './auth.interface.js';

export const generateAccessToken = (user: IUserDocument): string => {
  const payload: AuthUserPayload = {
    id: user._id.toString(),
    mobileNumber: user.mobileNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (user: IUserDocument): string => {
  const payload = {
    id: user._id.toString(),
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const generateAuthTokens = (user: IUserDocument): AuthTokens => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

export const verifyAccessToken = (token: string): AuthUserPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access token has expired');
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): { id: string } => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token has expired');
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }
};
