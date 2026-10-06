import { Document, Types } from 'mongoose';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IVendor {
  userId: Types.ObjectId | string;
  ownerName: string;
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorDocument extends IVendor, Document {}

export interface CreateVendorDTO {
  mobileNumber: string;
  password?: string;
  name: string;
  ownerName?: string;
  email?: string;
  businessName?: string;
  city?: string;
  address?: string;
  cuisineTypes?: string[];
}

