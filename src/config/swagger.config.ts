import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-ui-express';
import { env } from './env.config.js';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Prasang Event & Catering Management Platform API',
    version: '1.0.0',
    description: `Production-ready RESTful API infrastructure for **Prasang**, an end-to-end event and catering management platform connecting event organizers, caterers/vendors, menu planners, and end customers.

### Key Architectural Highlights
- **Framework**: Express.js with TypeScript & Node.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Domain Architecture**: Clean entity separation (User -> Vendor -> Business -> Menu -> MenuItem, Review)
- **Authentication**: Pluggable Dual-Strategy ("password" for development & "otp" for production) with JWT Access & Refresh Token rotation
- **Authorization**: Role-Based Access Control ("SUPER_ADMIN", "VENDOR", "USER")

### How to Authenticate in Swagger
1. Login via "/api/v1/auth/login/user", "/api/v1/auth/login/vendor", or "/api/v1/auth/login/admin" (or register a new user/vendor).
2. Copy the "accessToken" string from the response JSON payload.
3. Click the **Authorize** button at the top right of this page.
4. Paste the token into the Value field for **bearerAuth** (do not include the word "Bearer ", Swagger automatically prepends it).
5. Click **Authorize** and **Close**. All protected endpoints will now send the Bearer header automatically!`,
    contact: {
      name: 'Prasang Engineering Team',
      email: 'support@prasang.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Current Active Environment Server',
    },
    {
      url: '/',
      description: 'Relative Host Server (Current Domain/Port)',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'System health checks, uptime monitoring, and server info',
    },
    {
      name: 'Authentication',
      description: 'User registration, login, OTP lifecycle, JWT token refresh & session management',
    },
    {
      name: 'Users',
      description: 'User profile management, user lookup, and super admin user creation',
    },
    {
      name: 'Vendors',
      description: 'Vendor account profile, caterer discovery, estimation requests, and vendor portal metrics',
    },
    {
      name: 'Businesses',
      description: 'Catering business profile management, search, filtering by city/cuisine, and admin approval',
    },
    {
      name: 'Menus',
      description: 'Catering menu packages and menu item management',
    },
    {
      name: 'Reviews',
      description: 'Customer reviews, star ratings, and feedback management',
    },
    {
      name: 'Admin',
      description: 'Super Admin platform metrics, user analytics, and system monitoring',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT Access Token authentication. Submit token string obtained from login or registration.',
      },
    },
    schemas: {
      // Standard Response Envelopes
      ApiResponseSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object', nullable: true },
        },
      },
      ApiErrorItem: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'body.mobileNumber' },
          message: {
            type: 'string',
            example: 'Invalid mobile number. Must be a valid 10-digit Indian mobile number',
          },
        },
      },
      ApiResponseError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation Error' },
          errors: {
            type: 'array',
            items: { $ref: '#/components/schemas/ApiErrorItem' },
          },
        },
      },
      // Entities
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7d0a21b34c891e4a12345' },
          mobileNumber: { type: 'string', example: '9876543210' },
          firstName: { type: 'string', example: 'Ankit' },
          lastName: { type: 'string', nullable: true, example: 'Prajapati' },
          email: { type: 'string', nullable: true, example: 'ankit@example.com' },
          role: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'VENDOR', 'USER'],
            example: 'USER',
          },
          isActive: { type: 'boolean', example: true },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Vendor: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
          userId: {
            oneOf: [
              { type: 'string', example: '66f7d5b11b34c891e4a67890' },
              { $ref: '#/components/schemas/User' },
            ],
          },
          firstName: { type: 'string', example: 'Rajesh' },
          lastName: { type: 'string', nullable: true, example: 'Sharma' },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            example: 'ACTIVE',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7d8c31b34c891e4a77777' },
          vendorId: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
          businessName: { type: 'string', example: 'Royal Caterers & Event Planners' },
          description: { type: 'string', example: 'Premium catering services for weddings and corporate events.' },
          cuisineTypes: {
            type: 'array',
            items: { type: 'string' },
            example: ['North Indian', 'Gujarati', 'Chinese', 'Desserts'],
          },
          address: { type: 'string', example: '102 SG Highway, Ahmedabad' },
          city: { type: 'string', example: 'Ahmedabad' },
          state: { type: 'string', example: 'Gujarat' },
          pincode: { type: 'string', example: '380015' },
          capacity: {
            type: 'object',
            properties: {
              minGuests: { type: 'integer', example: 50 },
              maxGuests: { type: 'integer', example: 2000 },
            },
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
            example: 'APPROVED',
          },
          averageRating: { type: 'number', example: 4.8 },
          totalReviews: { type: 'integer', example: 24 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Menu: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7d9d41b34c891e4a88888' },
          businessId: { type: 'string', example: '66f7d8c31b34c891e4a77777' },
          name: { type: 'string', example: 'Royal Wedding Banquet Menu' },
          description: { type: 'string', example: 'Comprehensive 5-course meal package' },
          category: { type: 'string', example: 'Wedding' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7dae51b34c891e4a99999' },
          menuId: { type: 'string', example: '66f7d9d41b34c891e4a88888' },
          businessId: { type: 'string', example: '66f7d8c31b34c891e4a77777' },
          name: { type: 'string', example: 'Paneer Pasanda' },
          description: { type: 'string', example: 'Stuffed paneer in rich creamy gravy' },
          category: { type: 'string', example: 'Main Course' },
          price: { type: 'number', example: 350 },
          isVegetarian: { type: 'boolean', example: true },
          isAvailable: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7dbf61b34c891e4a00000' },
          businessId: { type: 'string', example: '66f7d8c31b34c891e4a77777' },
          userId: { type: 'string', example: '66f7d0a21b34c891e4a12345' },
          rating: { type: 'integer', example: 5 },
          comment: { type: 'string', example: 'Exceptional food quality and outstanding live counters!' },
          status: { type: 'string', enum: ['PUBLISHED', 'FLAGGED', 'HIDDEN'], example: 'PUBLISHED' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
    },
  },
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Check System Health',
        responses: { '200': { description: 'System healthy' } },
      },
    },
    '/api/v1/auth/register/user': {
      post: {
        tags: ['Authentication'],
        summary: 'Register End User Account',
        responses: { '201': { description: 'User registered' } },
      },
    },
    '/api/v1/auth/register/vendor': {
      post: {
        tags: ['Authentication'],
        summary: 'Register Vendor & Business Profile',
        responses: { '201': { description: 'Vendor & Business created' } },
      },
    },
    '/api/v1/businesses': {
      get: {
        tags: ['Businesses'],
        summary: 'Browse & Filter Catering Businesses',
        parameters: [
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'cuisine', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'minCapacity', in: 'query', schema: { type: 'integer' } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
        ],
        responses: { '200': { description: 'Approved businesses retrieved' } },
      },
    },
    '/api/v1/businesses/{id}': {
      get: {
        tags: ['Businesses'],
        summary: 'Get Business Details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business details retrieved' } },
      },
    },
    '/api/v1/menus/business/{businessId}': {
      get: {
        tags: ['Menus'],
        summary: 'Get Menus for a Business',
        parameters: [{ name: 'businessId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business menus retrieved' } },
      },
    },
    '/api/v1/reviews/business/{businessId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get Customer Reviews for a Business',
        parameters: [{ name: 'businessId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business reviews retrieved' } },
      },
    },
    '/api/v1/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Submit Customer Review & Star Rating',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Review submitted' } },
      },
    },
  },
};

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.route.ts', './dist/modules/**/*.route.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const customSwaggerUiOptions: SwaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Prasang API Documentation',
};

export const swaggerUiOptions = customSwaggerUiOptions;

