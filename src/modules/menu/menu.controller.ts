import { Request, Response } from 'express';
import { menuService } from './menu.service.js';
import { vendorService } from '../vendor/vendor.service.js';
import { businessService } from '../business/business.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class MenuController {
  // --- Menu Handlers ---
  public createMenu = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      let businessId = req.body.businessId;

      if (!businessId && req.user) {
        const vendor = await vendorService.getVendorByUserId(req.user.id);
        if (!vendor) {
          throw new ApiError(StatusCodes.FORBIDDEN, 'Vendor profile required');
        }
        const business = await businessService.getBusinessByVendorId(vendor._id.toString());
        if (!business) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor has no registered business');
        }
        businessId = business._id.toString();
      }

      const menu = await menuService.createMenu({
        ...req.body,
        businessId,
      });

      ApiResponse.success(res, 'Menu created successfully', menu, 201);
    },
  );

  public getMenusByBusinessId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const menus = await menuService.getMenusByBusinessId(req.params.businessId);
      ApiResponse.success(res, 'Menus retrieved successfully', menus);
    },
  );

  public getMenuById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const menu = await menuService.getMenuById(req.params.id);
    ApiResponse.success(res, 'Menu retrieved successfully', menu);
  });

  public updateMenu = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendor = await vendorService.getVendorByUserId(req.user!.id);
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const vendorId = vendor ? vendor._id.toString() : '';

      const updated = await menuService.updateMenu(
        req.params.id,
        vendorId,
        req.body,
        isSuperAdmin,
      );

      ApiResponse.success(res, 'Menu updated successfully', updated);
    },
  );

  public deleteMenu = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendor = await vendorService.getVendorByUserId(req.user!.id);
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const vendorId = vendor ? vendor._id.toString() : '';

      await menuService.deleteMenu(req.params.id, vendorId, isSuperAdmin);
      ApiResponse.success(res, 'Menu deleted successfully');
    },
  );

  // --- MenuItem Handlers ---
  public createMenuItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const menuItem = await menuService.createMenuItem(req.body);
      ApiResponse.success(res, 'Menu item created successfully', menuItem, 201);
    },
  );

  public getMenuItemsByMenuId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const items = await menuService.getMenuItemsByMenuId(req.params.menuId);
      ApiResponse.success(res, 'Menu items retrieved successfully', items);
    },
  );

  public getMenuItemsByBusinessId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const items = await menuService.getMenuItemsByBusinessId(req.params.businessId);
      ApiResponse.success(res, 'Business menu items retrieved successfully', items);
    },
  );

  public getMenuItemById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const item = await menuService.getMenuItemById(req.params.id);
    ApiResponse.success(res, 'Menu item retrieved successfully', item);
  });

  public updateMenuItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendor = await vendorService.getVendorByUserId(req.user!.id);
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const vendorId = vendor ? vendor._id.toString() : '';

      const updated = await menuService.updateMenuItem(
        req.params.id,
        vendorId,
        req.body,
        isSuperAdmin,
      );

      ApiResponse.success(res, 'Menu item updated successfully', updated);
    },
  );

  public deleteMenuItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const vendor = await vendorService.getVendorByUserId(req.user!.id);
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const vendorId = vendor ? vendor._id.toString() : '';

      await menuService.deleteMenuItem(req.params.id, vendorId, isSuperAdmin);
      ApiResponse.success(res, 'Menu item deleted successfully');
    },
  );
}

export const menuController = new MenuController();
