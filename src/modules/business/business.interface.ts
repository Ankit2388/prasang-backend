import { Document, Types } from 'mongoose';

export type BusinessApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface IBusinessHours {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isOpen: boolean;
  openingTime?: string;
  closingTime?: string;
}

export interface IBusinessContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface IBusinessCapacity {
  minGuests?: number;
  maxGuests?: number;
}

export interface IBusinessLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IBusiness {
  vendorId: Types.ObjectId | string;
  businessName: string;
  description?: string;
  cuisineTypes?: string[];
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: IBusinessLocation;
  contactInformation?: IBusinessContact;
  capacity?: IBusinessCapacity;
  businessHours?: IBusinessHours[];
  status: BusinessApprovalStatus;
  averageRating: number;
  totalReviews: number;
  coverImage?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessDocument extends IBusiness, Document {}

export type DocumentType = 'GST' | 'FSSAI' | 'BUSINESS_REGISTRATION' | 'OTHER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IBusinessDocumentEntity {
  businessId: Types.ObjectId | string;
  documentType: DocumentType;
  documentUrl: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedBy?: Types.ObjectId | string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessDocumentDoc extends IBusinessDocumentEntity, Document {}

export type ImageType = 'LOGO' | 'COVER' | 'GALLERY' | 'FOOD' | 'KITCHEN';

export interface IBusinessImage {
  businessId: Types.ObjectId | string;
  url: string;
  type: ImageType;
  caption?: string;
  sortOrder: number;
  createdAt: Date;
}

export interface IBusinessImageDoc extends IBusinessImage, Document {}

export interface CreateBusinessDTO {
  vendorId: string;
  businessName: string;
  description?: string;
  cuisineTypes?: string[];
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: IBusinessLocation;
  contactInformation?: IBusinessContact;
  capacity?: IBusinessCapacity;
  businessHours?: IBusinessHours[];
  status?: BusinessApprovalStatus;
  coverImage?: string;
  logo?: string;
}

export interface UpdateBusinessDTO {
  businessName?: string;
  description?: string;
  cuisineTypes?: string[];
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: IBusinessLocation;
  contactInformation?: IBusinessContact;
  capacity?: IBusinessCapacity;
  businessHours?: IBusinessHours[];
  status?: BusinessApprovalStatus;
  coverImage?: string;
  logo?: string;
}

export interface BusinessQueryFilters {
  city?: string;
  cuisine?: string;
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minRating?: number;
  status?: BusinessApprovalStatus;
  page?: number;
  limit?: number;
}
