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
      description: 'Vendor account identity, estimation requests, and vendor portal dashboard',
    },
    {
      name: 'Businesses',
      description: 'Business operating profile, catalog search, guest capacity filtering, and approval moderation',
    },
    {
      name: 'Menus',
      description: 'Business menu groupings and catalog menu configuration',
    },
    {
      name: 'MenuItems',
      description: 'Individual dish / menu item management and availability toggling',
    },
    {
      name: 'Reviews',
      description: 'Customer ratings, feedback, and content moderation',
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
      PaginatedMeta: {
        type: 'object',
        properties: {
          isAnonymous: { type: 'boolean', example: false },
          user: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string', example: 'Ankit Prajapati' },
              role: { type: 'string', example: 'USER' },
            },
          },
        },
      },

      // Entities
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66f7d0a21b34c891e4a12345' },
          mobileNumber: { type: 'string', example: '9876543210' },
          name: { type: 'string', example: 'Ankit Prajapati' },
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
          ownerName: { type: 'string', example: 'Rajesh Sharma' },
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            example: 'APPROVED',
          },
          business: {
            $ref: '#/components/schemas/Business',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          vendorId: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
          businessName: { type: 'string', example: 'Royal Caterers & Event Planners' },
          description: { type: 'string', example: 'Premium catering services for weddings and corporate events.' },
          cuisineTypes: {
            type: 'array',
            items: { type: 'string' },
            example: ['North Indian', 'Gujarati', 'Chinese', 'Desserts'],
          },
          address: { type: 'string', example: '102 SG Highway, Bodakdev' },
          city: { type: 'string', example: 'Ahmedabad' },
          state: { type: 'string', example: 'Gujarat' },
          pincode: { type: 'string', example: '380054' },
          location: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'Point' },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                example: [72.5714, 23.0225],
              },
            },
          },
          contactInformation: {
            type: 'object',
            properties: {
              phone: { type: 'string', example: '9876543210' },
              email: { type: 'string', example: 'info@royalcaterers.com' },
              website: { type: 'string', example: 'https://royalcaterers.com' },
            },
          },
          capacity: {
            type: 'object',
            properties: {
              minGuests: { type: 'number', example: 50 },
              maxGuests: { type: 'number', example: 2000 },
            },
          },
          businessHours: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'string', example: 'MONDAY' },
                isOpen: { type: 'boolean', example: true },
                openingTime: { type: 'string', example: '09:00' },
                closingTime: { type: 'string', example: '22:00' },
              },
            },
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
            example: 'APPROVED',
          },
          averageRating: { type: 'number', example: 4.8 },
          totalReviews: { type: 'number', example: 25 },
          coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
          logo: { type: 'string', example: 'https://example.com/logo.jpg' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Menu: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6701b3d45c67e890f1a23456' },
          businessId: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          name: { type: 'string', example: 'Royal Wedding Dinner Buffet' },
          description: { type: 'string', example: 'Complete multi-course royal banquet menu' },
          category: { type: 'string', example: 'Wedding Packages' },
          isActive: { type: 'boolean', example: true },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/MenuItem' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6701c4e56d78f901a2b34567' },
          menuId: { type: 'string', example: '6701b3d45c67e890f1a23456' },
          businessId: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          name: { type: 'string', example: 'Paneer Butter Masala' },
          description: { type: 'string', example: 'Cottage cheese cubes in rich tomato gravy' },
          category: { type: 'string', example: 'Main Course' },
          price: { type: 'number', example: 350 },
          image: { type: 'string', example: 'https://example.com/paneer.jpg' },
          isVegetarian: { type: 'boolean', example: true },
          isAvailable: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6701d5f67e89a012b3c45678' },
          businessId: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          userId: {
            oneOf: [
              { type: 'string', example: '66f7d0a21b34c891e4a12345' },
              { $ref: '#/components/schemas/User' },
            ],
          },
          rating: { type: 'number', example: 5 },
          comment: { type: 'string', example: 'Excellent food quality and prompt service for 500 guests!' },
          status: {
            type: 'string',
            enum: ['PUBLISHED', 'FLAGGED', 'HIDDEN'],
            example: 'PUBLISHED',
          },
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

      // Request Payloads
      RegisterUserRequest: {
        type: 'object',
        required: ['mobileNumber', 'name'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            description: 'Valid 10-digit Indian mobile number',
            example: '9876543210',
          },
          name: {
            type: 'string',
            minLength: 2,
            description: 'Full name of the user',
            example: 'Ankit Prajapati',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Account password (Required when AUTH_MODE=password)',
            example: 'Password@123',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Optional email address',
            example: 'ankit@example.com',
          },
        },
      },
      LoginUserRequest: {
        type: 'object',
        required: ['mobileNumber'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            description: 'Valid 10-digit Indian mobile number',
            example: '9876543210',
          },
          password: {
            type: 'string',
            description: 'Account password (Used when AUTH_MODE=password)',
            example: 'Password@123',
          },
          otp: {
            type: 'string',
            description: '6-digit OTP code (Used when AUTH_MODE=otp)',
            example: '123456',
          },
        },
      },
      RegisterVendorRequest: {
        type: 'object',
        required: ['mobileNumber', 'name', 'businessName'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            description: 'Valid 10-digit Indian mobile number',
            example: '9812345678',
          },
          name: {
            type: 'string',
            minLength: 2,
            description: 'Vendor account owner name',
            example: 'Rajesh Sharma',
          },
          businessName: {
            type: 'string',
            minLength: 2,
            description: 'Catering / Vendor business name',
            example: 'Royal Caterers & Event Planners',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Account password',
            example: 'VendorPassword@123',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Business email address',
            example: 'info@royalcaters.com',
          },
          ownerName: {
            type: 'string',
            description: 'Owner contact name (Defaults to name)',
            example: 'Rajesh Sharma',
          },
          city: {
            type: 'string',
            description: 'Operating city',
            example: 'Ahmedabad',
          },
          address: {
            type: 'string',
            description: 'Physical business address',
            example: '102 SG Highway, Ahmedabad',
          },
          cuisineTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of cuisine specializations',
            example: ['North Indian', 'Gujarati', 'Chinese', 'Desserts'],
          },
        },
      },
      LoginVendorRequest: {
        type: 'object',
        required: ['mobileNumber'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9812345678',
          },
          password: {
            type: 'string',
            example: 'VendorPassword@123',
          },
          otp: {
            type: 'string',
            example: '123456',
          },
        },
      },
      LoginAdminRequest: {
        type: 'object',
        required: ['mobileNumber', 'password'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9999999999',
          },
          password: {
            type: 'string',
            minLength: 1,
            example: 'SuperAdminSecretPassword',
          },
        },
      },
      SendOtpRequest: {
        type: 'object',
        required: ['mobileNumber'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9876543210',
          },
          purpose: {
            type: 'string',
            enum: ['LOGIN', 'REGISTRATION', 'PASSWORD_RESET'],
            default: 'LOGIN',
            example: 'LOGIN',
          },
        },
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['mobileNumber', 'otp'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9876543210',
          },
          otp: {
            type: 'string',
            minLength: 4,
            example: '123456',
          },
          purpose: {
            type: 'string',
            enum: ['LOGIN', 'REGISTRATION', 'PASSWORD_RESET'],
            default: 'LOGIN',
            example: 'LOGIN',
          },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      CreateUserAdminRequest: {
        type: 'object',
        required: ['mobileNumber', 'name'],
        properties: {
          mobileNumber: {
            type: 'string',
            pattern: '^[6-9]\\d{9}$',
            example: '9765432109',
          },
          name: {
            type: 'string',
            minLength: 2,
            example: 'John Doe',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'Password123',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          role: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'VENDOR', 'USER'],
            example: 'VENDOR',
          },
        },
      },
      EstimationRequest: {
        type: 'object',
        required: ['vendorId', 'guestCount', 'eventDate'],
        properties: {
          vendorId: {
            type: 'string',
            description: 'Target vendor MongoDB ObjectId',
            example: '66f7d5b21b34c891e4a67891',
          },
          guestCount: {
            type: 'integer',
            minimum: 1,
            description: 'Expected guest count for the event',
            example: 250,
          },
          eventDate: {
            type: 'string',
            format: 'date',
            description: 'Date of planned event (YYYY-MM-DD)',
            example: '2026-12-15',
          },
          preservedActionContext: {
            type: 'object',
            description: 'Custom state context preserved across guest login transition',
            example: {
              selectedMenuPackage: 'Royal Grand Buffet',
              draftNote: 'Need live jalebi counter',
            },
          },
        },
      },

      CreateBusinessRequest: {
        type: 'object',
        required: ['businessName'],
        properties: {
          vendorId: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
          businessName: { type: 'string', example: 'Royal Caterers & Event Planners' },
          description: { type: 'string', example: 'Premium catering services for weddings and corporate events.' },
          cuisineTypes: { type: 'array', items: { type: 'string' }, example: ['North Indian', 'Gujarati', 'Chinese'] },
          address: { type: 'string', example: '102 SG Highway, Bodakdev' },
          city: { type: 'string', example: 'Ahmedabad' },
          state: { type: 'string', example: 'Gujarat' },
          pincode: { type: 'string', example: '380054' },
          contactInformation: {
            type: 'object',
            properties: {
              phone: { type: 'string', example: '9876543210' },
              email: { type: 'string', example: 'info@royalcaterers.com' },
              website: { type: 'string', example: 'https://royalcaterers.com' },
            },
          },
          capacity: {
            type: 'object',
            properties: {
              minGuests: { type: 'number', example: 50 },
              maxGuests: { type: 'number', example: 2000 },
            },
          },
          coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
          logo: { type: 'string', example: 'https://example.com/logo.jpg' },
        },
      },
      UpdateBusinessRequest: {
        type: 'object',
        properties: {
          businessName: { type: 'string', example: 'Royal Caterers & Fine Dining' },
          description: { type: 'string', example: 'Updated business description.' },
          cuisineTypes: { type: 'array', items: { type: 'string' }, example: ['North Indian', 'Gujarati', 'Mexican'] },
          address: { type: 'string', example: '204 SG Highway, Bodakdev' },
          city: { type: 'string', example: 'Ahmedabad' },
          state: { type: 'string', example: 'Gujarat' },
          pincode: { type: 'string', example: '380054' },
          capacity: {
            type: 'object',
            properties: {
              minGuests: { type: 'number', example: 100 },
              maxGuests: { type: 'number', example: 2500 },
            },
          },
          coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
          logo: { type: 'string', example: 'https://example.com/logo.jpg' },
        },
      },
      UpdateBusinessStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
            example: 'APPROVED',
          },
        },
      },
      CreateMenuRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          businessId: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          name: { type: 'string', example: 'Royal Wedding Dinner Buffet' },
          description: { type: 'string', example: 'Complete multi-course royal banquet menu' },
          category: { type: 'string', example: 'Wedding Packages' },
          isActive: { type: 'boolean', example: true },
        },
      },
      UpdateMenuRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Updated Wedding Buffet' },
          description: { type: 'string', example: 'Updated menu description' },
          category: { type: 'string', example: 'Premium Packages' },
          isActive: { type: 'boolean', example: true },
        },
      },
      CreateMenuItemRequest: {
        type: 'object',
        required: ['menuId', 'name', 'category', 'price'],
        properties: {
          menuId: { type: 'string', example: '6701b3d45c67e890f1a23456' },
          businessId: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          name: { type: 'string', example: 'Paneer Butter Masala' },
          description: { type: 'string', example: 'Cottage cheese cubes in rich tomato gravy' },
          category: { type: 'string', example: 'Main Course' },
          price: { type: 'number', example: 350 },
          image: { type: 'string', example: 'https://example.com/paneer.jpg' },
          isVegetarian: { type: 'boolean', example: true },
          isAvailable: { type: 'boolean', example: true },
        },
      },
      UpdateMenuItemRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Paneer Tikka Masala' },
          description: { type: 'string', example: 'Updated description' },
          category: { type: 'string', example: 'Main Course' },
          price: { type: 'number', example: 380 },
          image: { type: 'string', example: 'https://example.com/paneer.jpg' },
          isVegetarian: { type: 'boolean', example: true },
          isAvailable: { type: 'boolean', example: true },
        },
      },
      CreateReviewRequest: {
        type: 'object',
        required: ['businessId', 'rating'],
        properties: {
          businessId: { type: 'string', example: '6701a2c34b56d789e0f12345' },
          rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Excellent food quality and prompt service for 500 guests!' },
        },
      },
      UpdateReviewRequest: {
        type: 'object',
        properties: {
          rating: { type: 'number', minimum: 1, maximum: 5, example: 4 },
          comment: { type: 'string', example: 'Updated review comment.' },
        },
      },
      UpdateReviewStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PUBLISHED', 'FLAGGED', 'HIDDEN'],
            example: 'FLAGGED',
          },
        },
      },

    },
  },
  paths: {
    // ------------------------------------------------------------------------
    // HEALTH MODULE
    // ------------------------------------------------------------------------
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Get Server Welcome Info',
        description: 'Returns root server metadata, application title, version, and documentation pointer.',
        responses: {
          '200': {
            description: 'Server info retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'prasang-server' },
                    version: { type: 'string', example: '1.0.0' },
                    description: { type: 'string', example: 'Prasang API Services Infrastructure' },
                    documentation: { type: 'string', example: '/api-docs' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1': {
      get: {
        tags: ['Health'],
        summary: 'Get API v1 Welcome & Endpoints Index',
        description: 'Lists main mounted API v1 module resource paths.',
        responses: {
          '200': {
            description: 'API v1 index retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Welcome to Prasang API v1' },
                    endpoints: {
                      type: 'object',
                      properties: {
                        health: { type: 'string', example: '/api/v1/health' },
                        auth: { type: 'string', example: '/api/v1/auth' },
                        users: { type: 'string', example: '/api/v1/users' },
                        vendors: { type: 'string', example: '/api/v1/vendors' },
                        admin: { type: 'string', example: '/api/v1/admin' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Check System Health',
        description:
          'Inspects system status, process uptime, active environment, memory usage, and MongoDB database connection state.',
        responses: {
          '200': {
            description: 'System health check completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'System is healthy and operational' },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'UP' },
                        timestamp: { type: 'string', format: 'date-time' },
                        uptimeSeconds: { type: 'number', example: 1420 },
                        environment: { type: 'string', example: 'development' },
                        database: {
                          type: 'object',
                          properties: {
                            connected: { type: 'boolean', example: true },
                            readyState: { type: 'integer', example: 1 },
                            stateLabel: { type: 'string', example: 'connected' },
                          },
                        },
                        memoryUsage: {
                          type: 'object',
                          properties: {
                            rss: { type: 'number', example: 48529408 },
                            heapTotal: { type: 'number', example: 29884416 },
                            heapUsed: { type: 'number', example: 21543824 },
                            external: { type: 'number', example: 1423851 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ------------------------------------------------------------------------
    // AUTHENTICATION MODULE
    // ------------------------------------------------------------------------
    '/api/v1/auth/register/user': {
      post: {
        tags: ['Authentication'],
        summary: 'Register End User Account',
        description:
          'Registers a new customer account with "USER" role. Generates initial JWT access & refresh token pair.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterUserRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation Error (Invalid mobile number format or missing password)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '409': {
            description: 'Conflict (Mobile number or email already registered)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login/user': {
      post: {
        tags: ['Authentication'],
        summary: 'Login End User Account',
        description:
          'Authenticates an existing user account using password or OTP depending on system AUTH_MODE.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginUserRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User logged in successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'User logged in successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Invalid credentials / incorrect password or invalid OTP)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (Account deactivated)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register/vendor': {
      post: {
        tags: ['Authentication'],
        summary: 'Register Vendor User Account & Business Profile',
        description:
          'Creates a user account with "VENDOR" role and simultaneously creates an associated Vendor profile.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterVendorRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Vendor account & profile registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 201 },
                    message: {
                      type: 'string',
                      example: 'Vendor account & profile registered successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        vendor: { $ref: '#/components/schemas/Vendor' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '409': {
            description: 'Conflict (Mobile number or email already registered)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login/vendor': {
      post: {
        tags: ['Authentication'],
        summary: 'Login Vendor Account',
        description:
          'Authenticates vendor credentials. Verifies that user account role is "VENDOR" or "SUPER_ADMIN".',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginVendorRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Vendor logged in successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Vendor logged in successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        vendor: { $ref: '#/components/schemas/Vendor' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Invalid credentials)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (Account deactivated or user does not possess vendor profile)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login/admin': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate Super Admin Account',
        description:
          'Authenticates super admin credentials. Verifies strict "SUPER_ADMIN" role authorization.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginAdminRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Super Admin authenticated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Super Admin authenticated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Invalid credentials)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (User role is not SUPER_ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/send-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Generate & Send OTP Code',
        description:
          'Generates an OTP code valid for OTP_EXPIRES_IN_MINUTES (5 mins) and sends via SMS (or returns in payload during development mode).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendOtpRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'OTP sent successfully. (Dev mode OTP: 123456)',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        mobileNumber: { type: 'string', example: '9876543210' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        otp: { type: 'string', example: '123456' },
                        message: {
                          type: 'string',
                          example: 'OTP sent successfully. (Dev mode OTP: 123456)',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/verify-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify OTP Code',
        description: 'Validates an OTP code submitted by a user for a specific purpose.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'OTP verified successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        verified: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'OTP verified successfully' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Invalid or expired OTP)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh Access & Refresh Tokens',
        description:
          'Validates a Refresh JWT token and generates a new pair of Access and Refresh tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Access token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Access token refreshed successfully',
                    },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Refresh token expired, tampered, or user inactive)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User Logout',
        description: 'Invalidates the active session on the client side.',
        responses: {
          '200': {
            description: 'User logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'User logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated User Profile',
        description:
          'Fetches current authenticated user data from req.user.id. Includes linked vendor profile if role is "VENDOR".\n\nAuthentication: Required (Bearer token)\nRequired Role: Any authenticated role ("USER", "VENDOR", "SUPER_ADMIN")',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Current user profile fetched successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        vendor: {
                          $ref: '#/components/schemas/Vendor',
                          nullable: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Missing or invalid Bearer token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },

    // ------------------------------------------------------------------------
    // USER MANAGEMENT MODULE
    // ------------------------------------------------------------------------
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List All Registered Users',
        description:
          'Returns a complete list of registered users sorted by newest first.\n\nAuthentication: Required (Bearer token)\nRequired Role: "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Users retrieved successfully' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Missing or invalid Bearer token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (User role is not SUPER_ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create User Account Manually (Admin Action)',
        description:
          'Allows a Super Admin to manually provision user accounts with specific roles.\n\nAuthentication: Required (Bearer token)\nRequired Role: "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserAdminRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'User created successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (User role is not SUPER_ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '409': {
            description: 'Conflict (Mobile number or email already exists)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get User Details by ID',
        description:
          'Returns detailed information for a specific user ID.\n\nAuthentication: Required (Bearer token)\nRequired Role: Any authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Valid MongoDB ObjectId string of the user',
            schema: { type: 'string', example: '66f7d0a21b34c891e4a12345' },
          },
        ],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'User retrieved successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Missing or invalid Bearer token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '404': {
            description: 'Not Found (User with specified ID does not exist)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },

    // ------------------------------------------------------------------------
    // VENDOR & CATERING MODULE
    // ------------------------------------------------------------------------
    '/api/v1/vendors/public': {
      get: {
        tags: ['Vendors'],
        summary: 'Browse Approved Vendors (Public / Guest Flow)',
        description:
          'Returns all caterers/vendors with status: "APPROVED". Supports guest browsing without requiring login. If a Bearer token is provided, context is attached via optionalAuthenticate.\n\nAuthentication: Optional\nRequired Role: None (Guests allowed)',
        security: [{ bearerAuth: [] }, {}],
        responses: {
          '200': {
            description: 'Approved vendor list retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Vendors retrieved for guest/anonymous user',
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Vendor' },
                    },
                    meta: { $ref: '#/components/schemas/PaginatedMeta' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/vendors/public/{id}': {
      get: {
        tags: ['Vendors'],
        summary: 'Get Vendor Profile Details',
        description:
          'Retrieves detailed profile of a vendor by Vendor ID.\n\nAuthentication: Optional\nRequired Role: None (Guests allowed)',
        security: [{ bearerAuth: [] }, {}],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Vendor MongoDB ObjectId',
            schema: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
          },
        ],
        responses: {
          '200': {
            description: 'Vendor profile retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Vendor profile retrieved' },
                    data: { $ref: '#/components/schemas/Vendor' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Vendor not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/vendors/estimation-request': {
      post: {
        tags: ['Vendors'],
        summary: 'Request Event Catering Estimation / Quote',
        description:
          'Allows an authenticated customer to request a catering price estimation from a vendor. Supports preserving context if initiated during anonymous guest browsing.\n\nAuthentication: Required (Bearer token)\nRequired Role: Any authenticated role ("USER", "VENDOR", "SUPER_ADMIN")',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EstimationRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Estimation request submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Estimation request submitted successfully!',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        requestId: { type: 'string', example: 'est_1728045600000' },
                        requestedBy: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '66f7d0a21b34c891e4a12345' },
                            mobileNumber: { type: 'string', example: '9876543210' },
                            name: { type: 'string', example: 'Ankit Prajapati' },
                            role: { type: 'string', example: 'USER' },
                          },
                        },
                        vendorId: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
                        guestCount: { type: 'number', example: 250 },
                        eventDate: { type: 'string', example: '2026-12-15' },
                        contextPreserved: { type: 'object', nullable: true },
                        status: { type: 'string', example: 'PENDING_VENDOR_REVIEW' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation Error (Missing required fields or invalid date format)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Missing or invalid Bearer token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
    '/api/v1/vendors/dashboard': {
      get: {
        tags: ['Vendors'],
        summary: 'Get Vendor Dashboard & Analytics',
        description:
          'Returns vendor portal metrics including quotations, pending estimations, confirmed bookings, and vendor profile data.\n\nAuthentication: Required (Bearer token)\nRequired Role: "VENDOR" or "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Vendor dashboard analytics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Vendor Dashboard access granted' },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '66f7d5b11b34c891e4a67890' },
                            name: { type: 'string', example: 'Rajesh Sharma' },
                            role: { type: 'string', example: 'VENDOR' },
                          },
                        },
                        vendor: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '66f7d5b21b34c891e4a67891' },
                            businessName: {
                              type: 'string',
                              example: 'Royal Caterers & Event Planners',
                            },
                            status: { type: 'string', example: 'APPROVED' },
                          },
                        },
                        dashboardStats: {
                          type: 'object',
                          properties: {
                            totalQuotations: { type: 'number', example: 12 },
                            pendingEstimations: { type: 'number', example: 4 },
                            confirmedBookings: { type: 'number', example: 8 },
                            rating: { type: 'number', example: 4.8 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Missing or invalid Bearer token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (User role is not VENDOR or SUPER_ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },

    // ------------------------------------------------------------------------
    // BUSINESS MODULE
    // ------------------------------------------------------------------------
    '/api/v1/businesses': {
      get: {
        tags: ['Businesses'],
        summary: 'Search & List Businesses',
        description: 'Public endpoint to browse and search businesses with filtering (city, cuisine, capacity, min rating) and pagination.',
        parameters: [
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filter by city (case-insensitive)' },
          { name: 'cuisine', in: 'query', schema: { type: 'string' }, description: 'Filter by cuisine type' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'General keyword search' },
          { name: 'minCapacity', in: 'query', schema: { type: 'integer' }, description: 'Minimum guest capacity' },
          { name: 'maxCapacity', in: 'query', schema: { type: 'integer' }, description: 'Maximum guest capacity' },
          { name: 'minRating', in: 'query', schema: { type: 'number' }, description: 'Minimum average rating (1-5)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': {
            description: 'Businesses list retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Businesses retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        businesses: { type: 'array', items: { $ref: '#/components/schemas/Business' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 1 },
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            totalPages: { type: 'integer', example: 1 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Businesses'],
        summary: 'Create Business Profile',
        description: 'Vendor creates a business profile. (Enforces 1:1 vendor-to-business rule).\n\nAuthentication: Required (Bearer token)\nRequired Role: "VENDOR" or "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBusinessRequest' } } },
        },
        responses: {
          '201': {
            description: 'Business profile created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponseSuccess' } } },
          },
          '409': { description: 'Conflict (Vendor already has a business profile)' },
        },
      },
    },
    '/api/v1/businesses/my-business': {
      get: {
        tags: ['Businesses'],
        summary: 'Get Authenticated Vendor Business',
        description: 'Retrieves the business profile associated with the logged-in vendor.\n\nAuthentication: Required (Bearer token)\nRequired Role: "VENDOR" or "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Vendor business details retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponseSuccess' } } },
          },
          '404': { description: 'Not Found (No business registered for vendor)' },
        },
      },
    },
    '/api/v1/businesses/{id}': {
      get: {
        tags: ['Businesses'],
        summary: 'Get Business Details by ID',
        description: 'Public endpoint to view full details of a business including active menus and menu items.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Business detail retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponseSuccess' } } },
          },
          '404': { description: 'Business not found' },
        },
      },
      put: {
        tags: ['Businesses'],
        summary: 'Update Business Details',
        description: 'Vendor updates their business profile.\n\nAuthentication: Required (Bearer token)\nRequired Role: "VENDOR" or "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBusinessRequest' } } },
        },
        responses: {
          '200': { description: 'Business updated successfully' },
          '403': { description: 'Forbidden (Not owner of business)' },
        },
      },
    },
    '/api/v1/businesses/{id}/status': {
      patch: {
        tags: ['Businesses'],
        summary: 'Update Business Approval Status',
        description: 'Super Admin updates business status (APPROVED, REJECTED, SUSPENDED).\n\nAuthentication: Required (Bearer token)\nRequired Role: "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBusinessStatusRequest' } } },
        },
        responses: {
          '200': { description: 'Business status updated' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ------------------------------------------------------------------------
    // MENU & MENUITEM MODULE
    // ------------------------------------------------------------------------
    '/api/v1/menus': {
      post: {
        tags: ['Menus'],
        summary: 'Create Menu',
        description: 'Vendor creates a new menu category/group under their business.\n\nAuthentication: Required (Bearer token)\nRequired Role: "VENDOR" or "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMenuRequest' } } },
        },
        responses: {
          '201': { description: 'Menu created successfully' },
        },
      },
    },
    '/api/v1/menus/business/{businessId}': {
      get: {
        tags: ['Menus'],
        summary: 'Get Menus for a Business',
        description: 'Public endpoint to retrieve all active menus for a business with populated menu items.',
        parameters: [{ name: 'businessId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Menus retrieved' },
        },
      },
    },
    '/api/v1/menus/{id}': {
      get: {
        tags: ['Menus'],
        summary: 'Get Menu by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Menu details retrieved' } },
      },
      put: {
        tags: ['Menus'],
        summary: 'Update Menu',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMenuRequest' } } },
        },
        responses: { '200': { description: 'Menu updated' } },
      },
      delete: {
        tags: ['Menus'],
        summary: 'Delete Menu',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Menu deleted' } },
      },
    },
    '/api/v1/menu-items': {
      post: {
        tags: ['MenuItems'],
        summary: 'Create Menu Item',
        description: 'Vendor creates a menu item linked to a menu and business.\n\nAuthentication: Required (Bearer token)\nRequired Role: "VENDOR" or "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMenuItemRequest' } } },
        },
        responses: { '201': { description: 'Menu item created' } },
      },
    },
    '/api/v1/menu-items/menu/{menuId}': {
      get: {
        tags: ['MenuItems'],
        summary: 'Get Items by Menu ID',
        parameters: [{ name: 'menuId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Menu items retrieved' } },
      },
    },
    '/api/v1/menu-items/business/{businessId}': {
      get: {
        tags: ['MenuItems'],
        summary: 'Get Items by Business ID',
        parameters: [{ name: 'businessId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business menu items retrieved' } },
      },
    },
    '/api/v1/menu-items/{id}': {
      get: {
        tags: ['MenuItems'],
        summary: 'Get Menu Item by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Menu item details retrieved' } },
      },
      put: {
        tags: ['MenuItems'],
        summary: 'Update Menu Item',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMenuItemRequest' } } },
        },
        responses: { '200': { description: 'Menu item updated' } },
      },
      delete: {
        tags: ['MenuItems'],
        summary: 'Delete Menu Item',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Menu item deleted' } },
      },
    },

    // ------------------------------------------------------------------------
    // REVIEW / FEEDBACK MODULE
    // ------------------------------------------------------------------------
    '/api/v1/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Submit Review for Business',
        description: 'Customer submits rating and review for a business. Triggers rating auto-recalculation.\n\nAuthentication: Required (Bearer token)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReviewRequest' } } },
        },
        responses: { '201': { description: 'Review submitted successfully' } },
      },
    },
    '/api/v1/reviews/business/{businessId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get Paginated Reviews for Business',
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'Reviews list retrieved' } },
      },
    },
    '/api/v1/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get Review by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Review details retrieved' } },
      },
      put: {
        tags: ['Reviews'],
        summary: 'Update Review',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateReviewRequest' } } },
        },
        responses: { '200': { description: 'Review updated' } },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete Review',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Review deleted' } },
      },
    },
    '/api/v1/reviews/{id}/status': {
      patch: {
        tags: ['Reviews'],
        summary: 'Moderate Review Status',
        description: 'Super Admin updates review status (PUBLISHED, FLAGGED, HIDDEN).\n\nAuthentication: Required (Bearer token)\nRequired Role: "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateReviewStatusRequest' } } },
        },
        responses: { '200': { description: 'Review status moderated' } },
      },
    },

    // ------------------------------------------------------------------------
    // SUPER ADMIN MODULE
    // ------------------------------------------------------------------------

    '/api/v1/admin/overview': {
      get: {
        tags: ['Admin'],
        summary: 'Get Super Admin System Metrics',
        description:
          'Fetches overall system metrics, user counts, active vendor counts, and recent user signups.\n\nAuthentication: Required (Bearer token)\nRequired Role: "SUPER_ADMIN"',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Super Admin system metrics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer', example: 200 },
                    message: {
                      type: 'string',
                      example: 'Super Admin overview fetched successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        adminUser: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '66f7c0011b34c891e4a00001' },
                            name: { type: 'string', example: 'System Administrator' },
                            role: { type: 'string', example: 'SUPER_ADMIN' },
                          },
                        },
                        totalUsers: { type: 'number', example: 142 },
                        totalVendors: { type: 'number', example: 28 },
                        recentUsers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (Missing or invalid Bearer token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
          '403': {
            description: 'Forbidden (User role is not SUPER_ADMIN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponseError' },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.ts', './dist/modules/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const customSwaggerUiOptions: SwaggerOptions = {
  customSiteTitle: 'Prasang API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { font-family: sans-serif; color: #1e293b; font-weight: 700; }
    .swagger-ui .scheme-container { background: #f8fafc; box-shadow: none; border: 1px solid #e2e8f0; border-radius: 8px; }
    .swagger-ui .btn.authorize { background-color: #2563eb; color: #fff; border-color: #2563eb; border-radius: 6px; }
    .swagger-ui .btn.authorize svg { fill: #fff; }
  `,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    displayRequestDuration: true,
    persistAuthorization: true,
  },
};
