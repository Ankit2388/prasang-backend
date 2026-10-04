import { Document, Types } from 'mongoose';

export interface IMenu {
  businessId: Types.ObjectId | string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuDocument extends IMenu, Document {}

export interface IMenuItem {
  menuId: Types.ObjectId | string;
  businessId: Types.ObjectId | string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuItemDocument extends IMenuItem, Document {}

export interface CreateMenuDTO {
  businessId: string;
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdateMenuDTO {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface CreateMenuItemDTO {
  menuId: string;
  businessId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  isVegetarian?: boolean;
  isAvailable?: boolean;
}

export interface UpdateMenuItemDTO {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  image?: string;
  isVegetarian?: boolean;
  isAvailable?: boolean;
}
