import { Request, Response } from 'express';
import { reviewService } from './review.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class ReviewController {
  public createReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const { businessId, rating, comment } = req.body;

      const review = await reviewService.createReview({
        businessId,
        userId,
        rating,
        comment,
      });

      ApiResponse.success(res, 'Review submitted successfully', review, 201);
    },
  );

  public getReviewsByBusiness = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { businessId } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await reviewService.getReviewsByBusinessId(businessId, page, limit);
      ApiResponse.success(res, 'Reviews retrieved successfully', result.reviews, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    },
  );

  public updateReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { reviewId } = req.params;
      const userId = req.user!.id;

      const updated = await reviewService.updateReview(reviewId, userId, req.body);
      ApiResponse.success(res, 'Review updated successfully', updated);
    },
  );

  public deleteReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { reviewId } = req.params;
      const userId = req.user!.id;
      const isAdmin = req.user?.role === 'SUPER_ADMIN';

      await reviewService.deleteReview(reviewId, userId, isAdmin);
      ApiResponse.success(res, 'Review deleted successfully');
    },
  );
}

export const reviewController = new ReviewController();
