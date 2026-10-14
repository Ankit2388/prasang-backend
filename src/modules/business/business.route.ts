import { Router } from 'express';
import { businessController } from './business.controller.js';
import { authenticate, optionalAuthenticate, authorize, validateRequest } from '../../middlewares/index.js';
import { USER_ROLES } from '../../constants/roles.js';
import {
  createBusinessSchema,
  updateBusinessSchema,
  updateBusinessStatusSchema,
  businessFilterQuerySchema,
} from './business.validation.js';

const router = Router();

router.get('/', optionalAuthenticate, validateRequest(businessFilterQuerySchema), businessController.getBusinesses);
router.get('/my-business', authenticate, authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN), businessController.getMyBusiness);
router.get('/:id', optionalAuthenticate, businessController.getBusinessById);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  validateRequest(createBusinessSchema),
  businessController.createBusiness,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  validateRequest(updateBusinessSchema),
  businessController.updateBusiness,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  validateRequest(updateBusinessStatusSchema),
  businessController.updateBusinessStatus,
);

export const businessRoutes = router;
