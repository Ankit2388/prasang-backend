import { Router } from 'express';
import { v1Router } from './v1/index.js';
import { env } from '../config/index.js';

const router = Router();

// Mount version 1 routes on configured prefix (default: /api/v1)
router.use(env.API_PREFIX, v1Router);

export const appRouter = router;
