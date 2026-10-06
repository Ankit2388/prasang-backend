import { z } from 'zod';

const businessHoursItemSchema = z.object({
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  isOpen: z.boolean(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
});

const businessContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email('Invalid email address format').optional().or(z.literal('')),
  website: z.string().optional(),
});

const businessCapacitySchema = z.object({
  minGuests: z.number().min(0).optional(),
  maxGuests: z.number().min(0).optional(),
});

const businessLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const createBusinessSchema = z.object({
  body: z.object({
    vendorId: z.string().optional(), // Will be populated from logged-in vendor if omitted
    businessName: z.string().min(2, 'Business name must be at least 2 characters long'),
    description: z.string().optional(),
    cuisineTypes: z.array(z.string()).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    location: businessLocationSchema.optional(),
    contactInformation: businessContactSchema.optional(),
    capacity: businessCapacitySchema.optional(),
    businessHours: z.array(businessHoursItemSchema).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
    coverImage: z.string().optional(),
    logo: z.string().optional(),
  }),
});

export const updateBusinessSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).optional(),
    description: z.string().optional(),
    cuisineTypes: z.array(z.string()).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    location: businessLocationSchema.optional(),
    contactInformation: businessContactSchema.optional(),
    capacity: businessCapacitySchema.optional(),
    businessHours: z.array(businessHoursItemSchema).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
    coverImage: z.string().optional(),
    logo: z.string().optional(),
  }),
});

export const updateBusinessStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  }),
});

export const businessFilterQuerySchema = z.object({
  query: z.object({
    city: z.string().optional(),
    cuisine: z.string().optional(),
    search: z.string().optional(),
    minCapacity: z.string().optional(),
    maxCapacity: z.string().optional(),
    minRating: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
