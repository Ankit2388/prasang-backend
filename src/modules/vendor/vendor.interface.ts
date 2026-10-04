import { Document, Types } from 'mongoose';
import { IBusinessDocument } from '../business/business.interface.js';

export type VendorAccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IVendor {
  userId: Types.ObjectId | string;
  firstName: string;
  lastName?: string;
  status: VendorAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorDocument extends IVendor, Document {
  business?: IBusinessDocument;
}

export interface CreateVendorDTO {
  userId: string;
  firstName: string;
  lastName?: string;
  businessName: string;
  city?: string;
  address?: string;
  cuisineTypes?: string[];
  status?: VendorAccountStatus;
}
