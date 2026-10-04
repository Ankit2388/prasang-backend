import { Router } from 'express';
import { z } from 'zod';
import { businessController } from './business.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  authorize,
  validateRequest,
} from '../../middlewares/index.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

// Zod schemas
const updateBusinessSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).optional(),
    description: z.string().optional(),
    cuisineTypes: z.array(z.string()).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    contactInformation: z
      .object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
      })
      .optional(),
    capacity: z
      .object({
        minGuests: z.number().min(1).optional(),
        maxGuests: z.number().min(1).optional(),
      })
      .optional(),
    businessHours: z
      .array(
        z.object({
          day: z.enum([
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY',
          ]),
          isOpen: z.boolean(),
          openingTime: z.string().optional(),
          closingTime: z.string().optional(),
        }),
      )
      .optional(),
    coverImage: z.string().url().optional(),
    logo: z.string().url().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  }),
});

// Public / Guest Flow
router.get('/', optionalAuthenticate, businessController.getAllApprovedBusinesses);
router.get('/my-business', authenticate, authorize(USER_ROLES.VENDOR), businessController.getMyBusiness);
router.get('/:id', optionalAuthenticate, businessController.getBusinessById);

// Vendor updates own business profile
router.put(
  '/my-business',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validateRequest(updateBusinessSchema),
  businessController.updateMyBusiness,
);

// Super Admin approval flow
router.patch(
  '/:id/status',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  validateRequest(updateStatusSchema),
  businessController.updateApprovalStatus,
);

export const businessRoutes = router;
