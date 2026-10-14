import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { authenticate, optionalAuthenticate, authorize, validateRequest } from '../../middlewares/index.js';
import { USER_ROLES } from '../../constants/roles.js';
import {
  createReviewSchema,
  updateReviewSchema,
  updateReviewStatusSchema,
} from './review.validation.js';

const router = Router();

router.post('/', authenticate, validateRequest(createReviewSchema), reviewController.createReview);
router.get('/business/:businessId', optionalAuthenticate, reviewController.getReviewsByBusinessId);
router.get('/:id', optionalAuthenticate, reviewController.getReviewById);

router.put('/:id', authenticate, validateRequest(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

router.patch(
  '/:id/status',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  validateRequest(updateReviewStatusSchema),
  reviewController.moderateReviewStatus,
);

export const reviewRoutes = router;
