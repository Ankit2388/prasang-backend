import { Router } from 'express';
import { healthRoutes } from '../../modules/health/health.route.js';
import { userRoutes } from '../../modules/user/user.route.js';

const router = Router();

// Root API v1 endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Prasang API v1',
    endpoints: {
      health: '/api/v1/health',
      users: '/api/v1/users',
    },
  });
});

// Mount module routes under v1 router
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export const v1Router = router;
