import { Schema, model } from 'mongoose';
import { IBusinessDocument } from './business.interface.js';

const businessHoursSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    openingTime: { type: String },
    closingTime: { type: String },
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
    minGuests: { type: Number, min: 0 },
    maxGuests: { type: Number, min: 0 },
  },
  { _id: false },
);

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  { _id: false },
);

const businessSchema = new Schema<IBusinessDocument>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor ID is required'],
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
    location: {
      type: pointSchema,
      required: false,
    },
    contactInformation: {
      type: businessContactSchema,
      required: false,
    },
    capacity: {
      type: businessCapacitySchema,
      required: false,
    },
    businessHours: {
      type: [businessHoursSchema],
      default: [],
    },
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
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImage: {
      type: String,
    },
    logo: {
      type: String,
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

businessSchema.index({ location: '2dsphere' });

businessSchema.virtual('vendor', {
  ref: 'Vendor',
  localField: 'vendorId',
  foreignField: '_id',
  justOne: true,
});

businessSchema.virtual('menus', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'businessId',
});

businessSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'businessId',
});

export const BusinessModel = model<IBusinessDocument>('Business', businessSchema);
