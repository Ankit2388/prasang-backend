import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

// Protect all admin endpoints with authentication & SUPER_ADMIN role authorization
router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/overview', adminController.getSystemOverview);

export const adminRoutes = router;
