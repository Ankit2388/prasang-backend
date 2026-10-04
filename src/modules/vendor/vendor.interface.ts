import { Document, Types } from 'mongoose';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IVendor {
  userId: Types.ObjectId | string;
  businessName: string;
  ownerName: string;
  city?: string;
  address?: string;
  cuisineTypes?: string[];
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorDocument extends IVendor, Document {}

export interface CreateVendorDTO {
  mobileNumber: string;
  password?: string;
  name: string;
  businessName: string;
  ownerName?: string;
  city?: string;
  address?: string;
  cuisineTypes?: string[];
  email?: string;
}
