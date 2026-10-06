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
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
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

vendorSchema.virtual('business', {
  ref: 'Business',
  localField: '_id',
  foreignField: 'vendorId',
  justOne: true,
});

export const VendorModel = model<IVendorDocument>('Vendor', vendorSchema);

