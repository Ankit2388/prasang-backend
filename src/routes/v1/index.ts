import { Router } from 'express';
import { healthRoutes } from '../../modules/health/health.route.js';
import { userRoutes } from '../../modules/user/user.route.js';
import { authRoutes } from '../../modules/auth/auth.route.js';
import { vendorRoutes } from '../../modules/vendor/vendor.route.js';
import { businessRoutes } from '../../modules/business/business.route.js';
import { menuRoutes, menuItemRoutes } from '../../modules/menu/menu.route.js';
import { reviewRoutes } from '../../modules/review/review.route.js';
import { adminRoutes } from '../../modules/admin/admin.route.js';

const router = Router();

// Root API v1 endpoint listing key resource endpoints
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Prasang API v1',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      vendors: '/api/v1/vendors',
      businesses: '/api/v1/businesses',
      menus: '/api/v1/menus',
      menuItems: '/api/v1/menu-items',
      reviews: '/api/v1/reviews',
      admin: '/api/v1/admin',
    },
  });
});

// Mount module routes under v1 router
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/businesses', businessRoutes);
router.use('/menus', menuRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

export const v1Router = router;

