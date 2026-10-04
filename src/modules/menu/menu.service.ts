import { MenuModel, MenuItemModel } from './menu.model.js';
import {
  IMenuDocument,
  IMenuItemDocument,
  CreateMenuDTO,
  UpdateMenuDTO,
  CreateMenuItemDTO,
  UpdateMenuItemDTO,
} from './menu.interface.js';
import { BusinessModel } from '../business/business.model.js';
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
    return MenuModel.find({ businessId, isActive: true }).sort({ createdAt: -1 });
  }

  public async getMenuWithItems(menuId: string): Promise<{ menu: IMenuDocument; items: IMenuItemDocument[] }> {
    const menu = await MenuModel.findById(menuId);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${menuId} not found`);
    }

    const items = await MenuItemModel.find({ menuId, isAvailable: true }).sort({ category: 1, name: 1 });
    return { menu, items };
  }

  public async updateMenu(
    menuId: string,
    vendorId: string,
    data: UpdateMenuDTO,
  ): Promise<IMenuDocument> {
    const menu = await MenuModel.findById(menuId);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${menuId} not found`);
    }

    const business = await BusinessModel.findById(menu.businessId);
    if (!business || business.vendorId.toString() !== vendorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this menu');
    }

    Object.assign(menu, data);
    return menu.save();
  }

  public async deleteMenu(menuId: string, vendorId: string): Promise<void> {
    const menu = await MenuModel.findById(menuId);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${menuId} not found`);
    }

    const business = await BusinessModel.findById(menu.businessId);
    if (!business || business.vendorId.toString() !== vendorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this menu');
    }

    await Promise.all([
      MenuModel.findByIdAndDelete(menuId),
      MenuItemModel.deleteMany({ menuId }),
    ]);
  }

  public async createMenuItem(data: CreateMenuItemDTO): Promise<IMenuItemDocument> {
    const menu = await MenuModel.findById(data.menuId);
    if (!menu) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu with ID ${data.menuId} not found`);
    }

    const item = new MenuItemModel({
      menuId: data.menuId,
      businessId: data.businessId,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      image: data.image,
      isVegetarian: data.isVegetarian !== undefined ? data.isVegetarian : true,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
    });

    return item.save();
  }

  public async updateMenuItem(
    itemId: string,
    vendorId: string,
    data: UpdateMenuItemDTO,
  ): Promise<IMenuItemDocument> {
    const item = await MenuItemModel.findById(itemId);
    if (!item) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu item with ID ${itemId} not found`);
    }

    const business = await BusinessModel.findById(item.businessId);
    if (!business || business.vendorId.toString() !== vendorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this menu item');
    }

    Object.assign(item, data);
    return item.save();
  }

  public async deleteMenuItem(itemId: string, vendorId: string): Promise<void> {
    const item = await MenuItemModel.findById(itemId);
    if (!item) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Menu item with ID ${itemId} not found`);
    }

    const business = await BusinessModel.findById(item.businessId);
    if (!business || business.vendorId.toString() !== vendorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this menu item');
    }

    await MenuItemModel.findByIdAndDelete(itemId);
  }
}

export const menuService = new MenuService();
