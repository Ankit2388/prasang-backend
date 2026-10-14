import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    businessId: z.string().min(1, 'Business ID is required'),
    rating: z
      .number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    comment: z.string().optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .min(1)
      .max(5)
      .optional(),
    comment: z.string().optional(),
    status: z.enum(['PUBLISHED', 'FLAGGED', 'HIDDEN']).optional(),
  }),
});

export const updateReviewStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PUBLISHED', 'FLAGGED', 'HIDDEN']),
  }),
});
