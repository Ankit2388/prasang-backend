import { Request, Response } from 'express';
import { menuService } from './menu.service.js';
import { vendorService } from '../vendor/vendor.service.js';
import { businessService } from '../business/business.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class MenuController {
  public createMenu = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found');
      }

      const business = await businessService.getBusinessByVendorId(vendor._id.toString());
      if (!business) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Business profile not found');
      }

      const menu = await menuService.createMenu({
        businessId: business._id.toString(),
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        isActive: req.body.isActive,
      });

      ApiResponse.success(res, 'Menu created successfully', menu, 201);
    },
  );

  public getMenusByBusiness = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { businessId } = req.params;
      const menus = await menuService.getMenusByBusinessId(businessId);
      ApiResponse.success(res, 'Menus retrieved successfully', menus);
    },
  );

  public getMenuWithItems = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { menuId } = req.params;
      const result = await menuService.getMenuWithItems(menuId);
      ApiResponse.success(res, 'Menu details and items retrieved', result);
    },
  );

  public updateMenu = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { menuId } = req.params;
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found');
      }

      const updated = await menuService.updateMenu(menuId, vendor._id.toString(), req.body);
      ApiResponse.success(res, 'Menu updated successfully', updated);
    },
  );

  public deleteMenu = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { menuId } = req.params;
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found');
      }

      await menuService.deleteMenu(menuId, vendor._id.toString());
      ApiResponse.success(res, 'Menu and its items deleted successfully');
    },
  );

  public createMenuItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { menuId } = req.params;
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found');
      }

      const business = await businessService.getBusinessByVendorId(vendor._id.toString());
      if (!business) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Business profile not found');
      }

      const item = await menuService.createMenuItem({
        menuId,
        businessId: business._id.toString(),
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        image: req.body.image,
        isVegetarian: req.body.isVegetarian,
        isAvailable: req.body.isAvailable,
      });

      ApiResponse.success(res, 'Menu item added successfully', item, 201);
    },
  );

  public updateMenuItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { itemId } = req.params;
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found');
      }

      const updated = await menuService.updateMenuItem(itemId, vendor._id.toString(), req.body);
      ApiResponse.success(res, 'Menu item updated successfully', updated);
    },
  );

  public deleteMenuItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { itemId } = req.params;
      const userId = req.user!.id;
      const vendor = await vendorService.getVendorByUserId(userId);
      if (!vendor) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Vendor profile not found');
      }

      await menuService.deleteMenuItem(itemId, vendor._id.toString());
      ApiResponse.success(res, 'Menu item deleted successfully');
    },
  );
}

export const menuController = new MenuController();
