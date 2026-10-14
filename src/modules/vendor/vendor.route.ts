import { Router } from 'express';
import { vendorController } from './vendor.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  authorize,
} from '../../middlewares/auth.middleware.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

// Public / Guest Flow: Browse caterers/vendors (No login required, but attaches user if token present)
router.get('/public', optionalAuthenticate, vendorController.getPublicVendors);
router.get('/public/:id', optionalAuthenticate, vendorController.getVendorById);

// End User Protected Flow: Action requiring authentication (Estimation Request)
router.post('/estimation-request', authenticate, vendorController.requestEstimation);

// Vendor Application Restricted Access Flow: Requires Login & VENDOR/SUPER_ADMIN Role
router.get(
  '/dashboard',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  vendorController.getVendorDashboard,
);

export const vendorRoutes = router;
