import { Schema, model } from 'mongoose';
import { IVendorDocument } from './vendor.interface.js';

const vendorSchema = new Schema<IVendorDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for vendor profile'],
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    cuisineTypes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
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

export const VendorModel = model<IVendorDocument>('Vendor', vendorSchema);
