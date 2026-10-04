import { Router } from 'express';
import { z } from 'zod';
import { reviewController } from './review.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  validateRequest,
} from '../../middlewares/index.js';

const router = Router();

// Zod schemas
const createReviewSchema = z.object({
  body: z.object({
    businessId: z.string().min(1, 'Business ID is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().max(1000).optional(),
  }),
});

// Public endpoints
router.get('/business/:businessId', optionalAuthenticate, reviewController.getReviewsByBusiness);

// Protected user endpoints
router.post(
  '/',
  authenticate,
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

router.put(
  '/:reviewId',
  authenticate,
  validateRequest(updateReviewSchema),
  reviewController.updateReview,
);

router.delete(
  '/:reviewId',
  authenticate,
  reviewController.deleteReview,
);

export const reviewRoutes = router;
