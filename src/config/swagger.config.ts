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
      description: 'Public caterer discovery, guest browsing, estimation requests, and vendor portal metrics',
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
          businessName: { type: 'string', example: 'Royal Caterers & Event Planners' },
          ownerName: { type: 'string', example: 'Rajesh Sharma' },
          city: { type: 'string', nullable: true, example: 'Ahmedabad' },
          address: { type: 'string', nullable: true, example: '102 SG Highway, Ahmedabad' },
          cuisineTypes: {
            type: 'array',
            items: { type: 'string' },
            example: ['North Indian', 'Gujarati', 'Chinese', 'Desserts'],
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            example: 'APPROVED',
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
