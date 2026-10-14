import { MenuModel, MenuItemModel } from './menu.model.js';
import { BusinessModel } from '../business/business.model.js';
import {
  CreateMenuDTO,
  UpdateMenuDTO,
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
  IMenuDocument,
  IMenuItemDocument,
} from './menu.interface.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class MenuService {
  public async createMenu(data: CreateMenuDTO): Promise<IMenuDocument> {
    const business = await BusinessModel.findById(data.businessId);
    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${data.businessId} not found`);
    }

    const menu = new MenuModel({
      businessId: data.businessId,
      name: data.name,
      description: data.description,
      category: data.category,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return menu.save();
  }

  public async getMenusByBusinessId(businessId: string): Promise<IMenuDocument[]> {
    return MenuModel.find({ businessId, isActive: true }).populate('items');
  }

  public async getMenuById(id: string): Promise<IMenuDocument> {
    const menu = await MenuModel.findById(id).populate('items');
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${id} not found`);
    }
    return menu;
  }

  public async updateMenu(
    id: string,
    vendorId: string,
    data: UpdateMenuDTO,
    isSuperAdmin = false,
  ): Promise<IMenuDocument> {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${id} not found`);
    }

    if (!isSuperAdmin) {
      const business = await BusinessModel.findById(menu.businessId);
      if (!business || business.vendorId.toString() !== vendorId) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          'Access denied: You do not own the business associated with this menu',
        );
      }
    }

    Object.assign(menu, data);
    return menu.save();
  }

  public async deleteMenu(id: string, vendorId: string, isSuperAdmin = false): Promise<void> {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${id} not found`);
    }

    if (!isSuperAdmin) {
      const business = await BusinessModel.findById(menu.businessId);
      if (!business || business.vendorId.toString() !== vendorId) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          'Access denied: You do not own the business associated with this menu',
        );
      }
    }

    await MenuItemModel.deleteMany({ menuId: id });
    await MenuModel.findByIdAndDelete(id);
  }

  public async createMenuItem(data: CreateMenuItemDTO): Promise<IMenuItemDocument> {
    const menu = await MenuModel.findById(data.menuId);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${data.menuId} not found`);
    }

    const businessId = data.businessId || menu.businessId.toString();

    const menuItem = new MenuItemModel({
      menuId: data.menuId,
      businessId,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      image: data.image,
      isVegetarian: data.isVegetarian !== undefined ? data.isVegetarian : true,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
    });

    return menuItem.save();
  }

  public async getMenuItemsByMenuId(menuId: string): Promise<IMenuItemDocument[]> {
    return MenuItemModel.find({ menuId, isAvailable: true });
  }

  public async getMenuItemsByBusinessId(businessId: string): Promise<IMenuItemDocument[]> {
    return MenuItemModel.find({ businessId, isAvailable: true });
  }

  public async getMenuItemById(id: string): Promise<IMenuItemDocument> {
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu Item with ID ${id} not found`);
    }
    return menuItem;
  }

  public async updateMenuItem(
    id: string,
    vendorId: string,
    data: UpdateMenuItemDTO,
    isSuperAdmin = false,
  ): Promise<IMenuItemDocument> {
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu Item with ID ${id} not found`);
    }

    if (!isSuperAdmin) {
      const business = await BusinessModel.findById(menuItem.businessId);
      if (!business || business.vendorId.toString() !== vendorId) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          'Access denied: You do not own the business associated with this menu item',
        );
      }
    }

    Object.assign(menuItem, data);
    return menuItem.save();
  }

  public async deleteMenuItem(id: string, vendorId: string, isSuperAdmin = false): Promise<void> {
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu Item with ID ${id} not found`);
    }

    if (!isSuperAdmin) {
      const business = await BusinessModel.findById(menuItem.businessId);
      if (!business || business.vendorId.toString() !== vendorId) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          'Access denied: You do not own the business associated with this menu item',
        );
      }
    }

    await MenuItemModel.findByIdAndDelete(id);
  }
}

export const menuService = new MenuService();
