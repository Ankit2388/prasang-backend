import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class AuthController {
  public registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.registerUser(req.body);
    ApiResponse.created(res, 'User registered successfully', result);
  });

  public loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.loginUser(req.body);
    ApiResponse.success(res, 'User logged in successfully', result);
  });

  public registerVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.registerVendor(req.body);
    ApiResponse.created(res, 'Vendor account & profile registered successfully', result);
  });

  public loginVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.loginVendor(req.body);
    ApiResponse.success(res, 'Vendor logged in successfully', result);
  });

  public loginAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.loginAdmin(req.body);
    ApiResponse.success(res, 'Super Admin authenticated successfully', result);
  });

  public sendOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.sendOtp(req.body);
    ApiResponse.success(res, result.message, result);
  });

  public verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.verifyOtp(req.body);
    ApiResponse.success(res, result.message, result);
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    ApiResponse.success(res, 'Access token refreshed successfully', tokens);
  });

  public logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    ApiResponse.success(res, 'User logged out successfully');
  });

  public getCurrentUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      if (!req.user) {
        ApiResponse.success(res, 'Anonymous guest user profile', { isAnonymous: true });
        return;
      }

      const profile = await authService.getCurrentUser(req.user.id);
      ApiResponse.success(res, 'Current user profile fetched successfully', profile);
    },
  );
}

export const authController = new AuthController();
