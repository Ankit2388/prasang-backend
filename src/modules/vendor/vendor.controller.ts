import { Request, Response } from 'express';
import { vendorService } from './vendor.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class VendorController {
  public getPublicVendors = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendors = await vendorService.getAllApprovedVendors();
      const isAnonymous = req.isAnonymous ?? !req.user;

      ApiResponse.success(
        res,
        isAnonymous
          ? 'Vendors retrieved for guest/anonymous user'
          : `Vendors retrieved for authenticated user (${req.user?.name})`,
        vendors,
        200,
        { isAnonymous, user: req.user ? { name: req.user.name, role: req.user.role } : null },
      );
    },
  );

  public getVendorById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vendor = await vendorService.getVendorById(req.params.id);
    ApiResponse.success(res, 'Vendor profile retrieved', vendor);
  });

  public getVendorDashboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const vendorProfile = await vendorService.getVendorByUserId(userId);

      ApiResponse.success(res, 'Vendor Dashboard access granted', {
        user: req.user,
        vendor: vendorProfile,
        dashboardStats: {
          totalQuotations: 12,
          pendingEstimations: 4,
          confirmedBookings: 8,
          rating: 4.8,
        },
      });
    },
  );

  public requestEstimation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { vendorId, guestCount, eventDate, preservedActionContext } = req.body;

      ApiResponse.success(res, 'Estimation request submitted successfully!', {
        requestId: `est_${Date.now()}`,
        requestedBy: req.user,
        vendorId,
        guestCount,
        eventDate,
        contextPreserved: preservedActionContext || null,
        status: 'PENDING_VENDOR_REVIEW',
      });
    },
  );
}

export const vendorController = new VendorController();
