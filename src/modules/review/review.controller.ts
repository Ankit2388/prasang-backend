import { Request, Response } from 'express';
import { reviewService } from './review.service.js';
import { ReviewStatus } from './review.interface.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';
import { AuthenticatedRequest } from '../../types/index.js';

export class ReviewController {
  public createReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const review = await reviewService.createReview({
        ...req.body,
        userId,
      });

      ApiResponse.success(res, 'Review submitted successfully', review, 201);
    },
  );

  public getReviewsByBusinessId = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await reviewService.getReviewsByBusinessId(req.params.businessId, {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        status: req.query.status as ReviewStatus | undefined,
      });

      ApiResponse.success(res, 'Reviews retrieved successfully', result);
    },
  );


  public getReviewById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const review = await reviewService.getReviewById(req.params.id);
    ApiResponse.success(res, 'Review retrieved successfully', review);
  });

  public updateReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      const updated = await reviewService.updateReview(
        req.params.id,
        userId,
        req.body,
        isSuperAdmin,
      );

      ApiResponse.success(res, 'Review updated successfully', updated);
    },
  );

  public deleteReview = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      await reviewService.deleteReview(req.params.id, userId, isSuperAdmin);
      ApiResponse.success(res, 'Review deleted successfully');
    },
  );

  public moderateReviewStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { status } = req.body;
      const updated = await reviewService.moderateReviewStatus(req.params.id, status);
      ApiResponse.success(res, `Review status updated to ${status}`, updated);
    },
  );
}

export const reviewController = new ReviewController();
