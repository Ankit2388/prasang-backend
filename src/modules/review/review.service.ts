import { ReviewModel } from './review.model.js';
import { IReviewDocument, CreateReviewDTO, UpdateReviewDTO } from './review.interface.js';
import { BusinessModel } from '../business/business.model.js';
import { ApiError } from '../../utils/api-error.js';
import { StatusCodes } from '../../constants/index.js';

export class ReviewService {
  private async recalculateBusinessRating(businessId: string): Promise<void> {
    const reviews = await ReviewModel.find({ businessId, status: 'PUBLISHED' });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1),
          )
        : 0;

    await BusinessModel.findByIdAndUpdate(businessId, {
      averageRating,
      totalReviews,
    });
  }

  public async createReview(data: CreateReviewDTO): Promise<IReviewDocument> {
    const business = await BusinessModel.findById(data.businessId);
    if (!business) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Business with ID ${data.businessId} not found`);
    }

    const existing = await ReviewModel.findOne({
      businessId: data.businessId,
      userId: data.userId,
    });

    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'You have already submitted a review for this catering business',
      );
    }

    const review = new ReviewModel({
      businessId: data.businessId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      status: 'PUBLISHED',
    });

    const savedReview = await review.save();
    await this.recalculateBusinessRating(data.businessId);
    return savedReview;
  }

  public async getReviewsByBusinessId(
    businessId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: IReviewDocument[]; total: number; page: number; limit: number }> {
    const skip = (Math.max(1, page) - 1) * Math.min(100, limit);

    const [reviews, total] = await Promise.all([
      ReviewModel.find({ businessId, status: 'PUBLISHED' })
        .populate('userId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReviewModel.countDocuments({ businessId, status: 'PUBLISHED' }),
    ]);

    return { reviews, total, page, limit };
  }

  public async updateReview(
    reviewId: string,
    userId: string,
    data: UpdateReviewDTO,
  ): Promise<IReviewDocument> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Review with ID ${reviewId} not found`);
    }

    if (review.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You can only update your own review');
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.comment !== undefined) review.comment = data.comment;
    if (data.status !== undefined) review.status = data.status;

    const updated = await review.save();
    await this.recalculateBusinessRating(review.businessId.toString());
    return updated;
  }

  public async deleteReview(reviewId: string, userId: string, isAdmin = false): Promise<void> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Review with ID ${reviewId} not found`);
    }

    if (!isAdmin && review.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You can only delete your own review');
    }

    const businessId = review.businessId.toString();
    await ReviewModel.findByIdAndDelete(reviewId);
    await this.recalculateBusinessRating(businessId);
  }
}

export const reviewService = new ReviewService();
