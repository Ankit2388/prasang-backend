import { Router } from 'express';
import { menuController } from './menu.controller.js';
import { authenticate, optionalAuthenticate, authorize, validateRequest } from '../../middlewares/index.js';
import { USER_ROLES } from '../../constants/roles.js';
import {
  createMenuSchema,
  updateMenuSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from './menu.validation.js';

// Router for Menu resources
const menuRouter = Router();

menuRouter.post(
  '/',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  validateRequest(createMenuSchema),
  menuController.createMenu,
);

menuRouter.get('/business/:businessId', optionalAuthenticate, menuController.getMenusByBusinessId);
menuRouter.get('/:id', optionalAuthenticate, menuController.getMenuById);

menuRouter.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  validateRequest(updateMenuSchema),
  menuController.updateMenu,
);

menuRouter.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  menuController.deleteMenu,
);

// Router for MenuItem resources
const menuItemRouter = Router();

menuItemRouter.post(
  '/',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  validateRequest(createMenuItemSchema),
  menuController.createMenuItem,
);

menuItemRouter.get('/menu/:menuId', optionalAuthenticate, menuController.getMenuItemsByMenuId);
menuItemRouter.get('/business/:businessId', optionalAuthenticate, menuController.getMenuItemsByBusinessId);
menuItemRouter.get('/:id', optionalAuthenticate, menuController.getMenuItemById);

menuItemRouter.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  validateRequest(updateMenuItemSchema),
  menuController.updateMenuItem,
);

menuItemRouter.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  menuController.deleteMenuItem,
);

export const menuRoutes = menuRouter;
export const menuItemRoutes = menuItemRouter;
