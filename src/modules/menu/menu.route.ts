import { Router } from 'express';
import { z } from 'zod';
import { menuController } from './menu.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  authorize,
  validateRequest,
} from '../../middlewares/index.js';
import { USER_ROLES } from '../../constants/roles.js';

const router = Router();

// Zod schemas
const createMenuSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Menu name must be at least 2 characters'),
    description: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateMenuSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Menu item name must be at least 2 characters'),
    description: z.string().optional(),
    category: z.string().min(2, 'Category is required'),
    price: z.number().min(0, 'Price cannot be negative'),
    image: z.string().optional(),
    isVegetarian: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    image: z.string().optional(),
    isVegetarian: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

// Public endpoints
router.get('/business/:businessId', optionalAuthenticate, menuController.getMenusByBusiness);
router.get('/:menuId', optionalAuthenticate, menuController.getMenuWithItems);

// Protected Vendor endpoints for Menus
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validateRequest(createMenuSchema),
  menuController.createMenu,
);

router.put(
  '/:menuId',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validateRequest(updateMenuSchema),
  menuController.updateMenu,
);

router.delete(
  '/:menuId',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  menuController.deleteMenu,
);

// Protected Vendor endpoints for Menu Items
router.post(
  '/:menuId/items',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validateRequest(createMenuItemSchema),
  menuController.createMenuItem,
);

router.put(
  '/items/:itemId',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validateRequest(updateMenuItemSchema),
  menuController.updateMenuItem,
);

router.delete(
  '/items/:itemId',
  authenticate,
  authorize(USER_ROLES.VENDOR),
  menuController.deleteMenuItem,
);

export const menuRoutes = router;
