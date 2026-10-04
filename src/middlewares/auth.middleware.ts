import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyAccessToken } from '../modules/auth/auth.tokens.js';
import { userService } from '../modules/user/user.service.js';
import { ApiError } from '../utils/api-error.js';
import { StatusCodes } from '../constants/index.js';
import { UserRole } from '../constants/roles.js';

/**
 * Require JWT Authentication middleware.
 * Use this on protected endpoints where user MUST be authenticated.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Authentication required. Please provide a valid Bearer token.',
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user exists and is active in database
    const user = await userService.getUserById(payload.id);
    if (!user || !user.isActive) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'The user account belonging to this token no longer exists or is deactivated.',
      );
    }

    req.user = {
      id: user._id.toString(),
      mobileNumber: user.mobileNumber,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    req.isAnonymous = false;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication middleware for End-User Guest/Anonymous browsing.
 * If a valid token is provided, attaches req.user and sets req.isAnonymous = false.
 * If no token is provided, sets req.isAnonymous = true without failing.
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      req.isAnonymous = true;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyAccessToken(token);
      const user = await userService.getUserById(payload.id);
      if (user && user.isActive) {
        req.user = {
          id: user._id.toString(),
          mobileNumber: user.mobileNumber,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        req.isAnonymous = false;
      } else {
        req.user = undefined;
        req.isAnonymous = true;
      }
    } catch {
      // Invalid/expired token in optional auth treated as anonymous guest
      req.user = undefined;
      req.isAnonymous = true;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based Authorization middleware.
 * Enforces that authenticated user possesses one of the allowed roles.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Authentication required before authorization check',
        ),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          StatusCodes.FORBIDDEN,
          `Access forbidden: Requires one of [${allowedRoles.join(', ')}] permissions. Current role: ${req.user.role}`,
        ),
      );
    }

    next();
  };
};
