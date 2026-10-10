import { Router } from 'express';
import { userController } from './user.controller.js';
import { validateRequest, authenticate, authorize } from '../../middlewares/index.js';
import { z } from 'zod';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

const mobileRegex = /^[6-9]\d{9}$/;

const createUserSchema = z.object({
  body: z.object({
    mobileNumber: z.string().regex(mobileRegex, 'Invalid 10-digit mobile number'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.nativeEnum(USER_ROLES).optional(),
  }),
});

router.get('/', authenticate, authorize(USER_ROLES.SUPER_ADMIN), userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.SUPER_ADMIN),
  validateRequest(createUserSchema),
  userController.createUser,
);

export const userRoutes = router;
