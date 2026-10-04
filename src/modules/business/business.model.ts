import { Schema, model } from 'mongoose';
import {
  IBusinessDocument,
  IBusinessDocumentDoc,
  IBusinessImageDoc,
} from './business.interface.js';

const businessHoursSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    openingTime: { type: String, trim: true },
    closingTime: { type: String, trim: true },
  },
  { _id: false },
);

const businessContactSchema = new Schema(
  {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
  },
  { _id: false },
);

const businessCapacitySchema = new Schema(
  {
    minGuests: { type: Number, min: 1 },
    maxGuests: { type: Number, min: 1 },
  },
  { _id: false },
);

const businessLocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false },
);

const businessSchema = new Schema<IBusinessDocument>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor ID is required for a business profile'],
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cuisineTypes: {
      type: [String],
      default: [],
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    location: businessLocationSchema,
    contactInformation: businessContactSchema,
    capacity: businessCapacitySchema,
    businessHours: [businessHoursSchema],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'APPROVED',
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
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

// Compound indexes for optimized filtering
businessSchema.index({ status: 1, city: 1 });
businessSchema.index({ status: 1, averageRating: -1 });

export const BusinessModel = model<IBusinessDocument>('Business', businessSchema);

// Business Document Schema
const businessDocumentSchema = new Schema<IBusinessDocumentDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    documentType: {
      type: String,
      enum: ['GST', 'FSSAI', 'BUSINESS_REGISTRATION', 'OTHER'],
      required: [true, 'Document type is required'],
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL is required'],
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
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

export const BusinessDocumentModel = model<IBusinessDocumentDoc>(
  'BusinessDocument',
  businessDocumentSchema,
);

// Business Image Schema
const businessImageSchema = new Schema<IBusinessImageDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['LOGO', 'COVER', 'GALLERY', 'FOOD', 'KITCHEN'],
      default: 'GALLERY',
    },
    caption: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

export const BusinessImageModel = model<IBusinessImageDoc>('BusinessImage', businessImageSchema);
