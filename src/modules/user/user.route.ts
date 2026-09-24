import { Router } from 'express';
import { userController } from './user.controller.js';
import { validateRequest } from '../../middlewares/index.js';
import { z } from 'zod';

const router = Router();

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['user', 'caterer', 'admin']).optional(),
  }),
});

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateRequest(createUserSchema), userController.createUser);

export const userRoutes = router;
