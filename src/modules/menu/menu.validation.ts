import { z } from 'zod';

export const createMenuSchema = z.object({
  body: z.object({
    businessId: z.string().optional(), // Can be derived from vendor's business if omitted
    name: z.string().min(1, 'Menu name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateMenuSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createMenuItemSchema = z.object({
  body: z.object({
    menuId: z.string().min(1, 'Menu ID is required'),
    businessId: z.string().optional(), // Can be derived from target Menu
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    category: z.string().min(1, 'Item category is required'),
    price: z.number().min(0, 'Price cannot be negative'),
    image: z.string().optional(),
    isVegetarian: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    image: z.string().optional(),
    isVegetarian: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }),
});
