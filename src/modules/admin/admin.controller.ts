import { Response } from 'express';
import { userService } from '../user/user.service.js';
import { vendorService } from '../vendor/vendor.service.js';
import { BusinessModel } from '../business/business.model.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class AdminController {
  public getSystemOverview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const users = await userService.getAllUsers();
      const vendors = await vendorService.getAllApprovedVendors();
      const totalBusinesses = await BusinessModel.countDocuments();

      ApiResponse.success(res, 'Super Admin overview fetched successfully', {
        adminUser: req.user,
        totalUsers: users.length,
        totalVendors: vendors.length,
        totalBusinesses,
        recentUsers: users.slice(0, 5),
      });
    },
  );
}

export const adminController = new AdminController();

