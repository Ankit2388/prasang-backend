import { Request, Response } from 'express';
import { businessService } from './business.service.js';
import { BusinessApprovalStatus } from './business.interface.js';
import { vendorService } from '../vendor/vendor.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';

import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class BusinessController {
  public createBusiness = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      let vendorId = req.body.vendorId;

      if (!vendorId && req.user) {
        const vendor = await vendorService.getVendorByUserId(req.user.id);
        if (!vendor) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            'You must have a vendor profile before registering a business',
          );
        }
        vendorId = vendor._id.toString();
      }

      if (!vendorId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Vendor ID is required to create a business');
      }

      const business = await businessService.createBusiness({
        ...req.body,
        vendorId,
      });

      ApiResponse.success(res, 'Business profile created successfully', business, 201);
    },
  );

  public getBusinesses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = {
      city: req.query.city as string | undefined,
      cuisine: req.query.cuisine as string | undefined,
      search: req.query.search as string | undefined,
      minCapacity: req.query.minCapacity ? Number(req.query.minCapacity) : undefined,
      maxCapacity: req.query.maxCapacity ? Number(req.query.maxCapacity) : undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      status: req.query.status as BusinessApprovalStatus | undefined,

      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const result = await businessService.getBusinesses(filters);
    ApiResponse.success(res, 'Businesses retrieved successfully', result);
  });

  public getBusinessById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const business = await businessService.getBusinessById(req.params.id);
    ApiResponse.success(res, 'Business details retrieved successfully', business);
  });

  public getMyBusiness = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendor = await vendorService.getVendorByUserId(req.user!.id);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found for user');
      }

      const business = await businessService.getBusinessByVendorId(vendor._id.toString());
      if (!business) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No business profile found for this vendor');
      }

      ApiResponse.success(res, 'My business details retrieved successfully', business);
    },
  );

  public updateBusiness = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendor = await vendorService.getVendorByUserId(req.user!.id);
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const vendorId = vendor ? vendor._id.toString() : '';

      const updated = await businessService.updateBusiness(
        req.params.id,
        vendorId,
        req.body,
        isSuperAdmin,
      );

      ApiResponse.success(res, 'Business profile updated successfully', updated);
    },
  );

  public updateBusinessStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { status } = req.body;
      const updated = await businessService.updateBusinessStatus(req.params.id, status);
      ApiResponse.success(res, `Business status updated to ${status}`, updated);
    },
  );
}

export const businessController = new BusinessController();
