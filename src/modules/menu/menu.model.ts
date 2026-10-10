import { Schema, model } from 'mongoose';
import { IMenuDocument, IMenuItemDocument } from './menu.interface.js';

const menuSchema = new Schema<IMenuDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required for Menu'],
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
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
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

menuSchema.virtual('items', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'menuId',
});

const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    menuId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'Menu ID is required for MenuItem'],
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required for MenuItem'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Item category is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
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
export const MenuItemModel = model<IMenuItemDocument>('MenuItem', menuItemSchema);
