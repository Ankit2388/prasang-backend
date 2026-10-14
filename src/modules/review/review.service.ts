import { ReviewModel } from './review.model.js';
import { BusinessModel } from '../business/business.model.js';
import { businessService } from '../business/business.service.js';
import {
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewStatus,
  IReviewDocument,
  ReviewQueryFilters,
} from './review.interface.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class ReviewService {
  public async createReview(data: CreateReviewDTO): Promise<IReviewDocument> {
    const business = await BusinessModel.findById(data.businessId);
    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${data.businessId} not found`);
    }

    const review = new ReviewModel({
      businessId: data.businessId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      status: 'PUBLISHED',
    });

    const saved = await review.save();
    await businessService.recalculateBusinessRating(data.businessId);
    return saved;
  }

  public async getReviewsByBusinessId(businessId: string, filters: ReviewQueryFilters) {
    const { page = 1, limit = 10, status = 'PUBLISHED' } = filters;
    const query = { businessId, status };
    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .populate('user', 'firstName lastName mobileNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ReviewModel.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  public async getReviewById(id: string): Promise<IReviewDocument> {
    const review = await ReviewModel.findById(id).populate('user', 'firstName lastName mobileNumber');
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Review with ID ${id} not found`);
    }
    return review;
  }

  public async updateReview(
    id: string,
    userId: string,
    data: UpdateReviewDTO,
    isSuperAdmin = false,
  ): Promise<IReviewDocument> {
    const review = await ReviewModel.findById(id);
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Review with ID ${id} not found`);
    }

    if (!isSuperAdmin && review.userId.toString() !== userId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Access denied: You can only edit your own reviews',
      );
    }

    Object.assign(review, data);
    const updated = await review.save();
    await businessService.recalculateBusinessRating(review.businessId.toString());
    return updated;
  }

  public async deleteReview(id: string, userId: string, isSuperAdmin = false): Promise<void> {
    const review = await ReviewModel.findById(id);
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Review with ID ${id} not found`);
    }

    if (!isSuperAdmin && review.userId.toString() !== userId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Access denied: You can only delete your own reviews',
      );
    }

    const businessId = review.businessId.toString();
    await ReviewModel.findByIdAndDelete(id);
    await businessService.recalculateBusinessRating(businessId);
  }

  public async moderateReviewStatus(id: string, status: ReviewStatus): Promise<IReviewDocument> {
    const review = await ReviewModel.findById(id);
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Review with ID ${id} not found`);
    }

    review.status = status;
    const updated = await review.save();
    await businessService.recalculateBusinessRating(review.businessId.toString());
    return updated;
  }
}

export const reviewService = new ReviewService();
