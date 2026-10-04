import { Schema, model } from 'mongoose';
import { IMenuDocument, IMenuItemDocument } from './menu.interface.js';

const menuSchema = new Schema<IMenuDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required for a menu'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Menu name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const retObj = ret as Record<string, unknown>;
        retObj.id = retObj._id;
        delete retObj._id;
        delete retObj.__v;
        return retObj;
      },
    },
  },
);

export const MenuModel = model<IMenuDocument>('Menu', menuSchema);

const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    menuId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'Menu ID is required for a menu item'],
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required for a menu item'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required (e.g., Starters, Main Course, Desserts)'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      trim: true,
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const retObj = ret as Record<string, unknown>;
        retObj.id = retObj._id;
        delete retObj._id;
        delete retObj.__v;
        return retObj;
      },
    },
  },
);

menuItemSchema.index({ menuId: 1, category: 1 });

export const MenuItemModel = model<IMenuItemDocument>('MenuItem', menuItemSchema);
