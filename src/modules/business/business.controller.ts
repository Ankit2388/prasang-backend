import { Request, Response } from 'express';
import { businessService } from './business.service.js';
import { vendorService } from '../vendor/vendor.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';
import { BusinessApprovalStatus } from './business.interface.js';

export class BusinessController {
  public getAllApprovedBusinesses = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { city, cuisine, search, minCapacity, minRating, page, limit } = req.query;

      const result = await businessService.getAllApprovedBusinesses({
        city: city as string,
        cuisine: cuisine as string,
        search: search as string,
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      const isAnonymous = req.isAnonymous ?? !req.user;

      ApiResponse.success(
        res,
        isAnonymous
          ? 'Approved catering businesses retrieved for guest user'
          : `Approved catering businesses retrieved for authenticated user (${req.user?.firstName})`,
        result.businesses,
        200,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          isAnonymous,
          user: req.user
            ? { firstName: req.user.firstName, lastName: req.user.lastName, role: req.user.role }
            : null,
        },
      );
    },
  );

  public getBusinessById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const business = await businessService.getBusinessById(req.params.id);
    ApiResponse.success(res, 'Business details retrieved successfully', business);
  });

  public getMyBusiness = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found for active user');
      }

      const business = await businessService.getBusinessByVendorId(vendor._id.toString());
      if (!business) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Business profile not found for this vendor');
      }

      ApiResponse.success(res, 'Vendor business profile retrieved successfully', business);
    },
  );

  public updateMyBusiness = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found for active user');
      }

      const business = await businessService.getBusinessByVendorId(vendor._id.toString());
      if (!business) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Business profile not found for this vendor');
      }

      const updated = await businessService.updateBusiness(
        business._id.toString(),
        vendor._id.toString(),
        req.body,
      );

      ApiResponse.success(res, 'Business profile updated successfully', updated);
    },
  );

  public updateApprovalStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const { status } = req.body as { status: BusinessApprovalStatus };

      const updated = await businessService.updateBusinessStatus(id, status);
      ApiResponse.success(res, `Business approval status updated to ${status}`, updated);
    },
  );
}

export const businessController = new BusinessController();
