import { Document, Types } from 'mongoose';

export type ReviewStatus = 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';

export interface IReview {
  businessId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}

export interface CreateReviewDTO {
  businessId: string;
  userId?: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
  status?: ReviewStatus;
}

export interface ReviewQueryFilters {
  businessId?: string;
  userId?: string;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}
