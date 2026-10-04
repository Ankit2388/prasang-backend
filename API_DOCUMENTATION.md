# 📚 Prasang Backend (`prasang-server`) - Complete Architecture & API Documentation

> Production-ready, highly scalable, and maintainable RESTful API infrastructure for the **Prasang Event & Catering Management Platform**, built strictly with **TypeScript**, **Node.js**, **Express.js**, and **MongoDB Atlas (Mongoose)**.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
   - [1.1 Project Name & Purpose](#11-project-name--purpose)
   - [1.2 Core Business Modules](#12-core-business-modules)
   - [1.3 Technology Stack & Dependencies](#13-technology-stack--dependencies)
   - [1.4 Backend Architecture & Design Patterns](#14-backend-architecture--design-patterns)
   - [1.5 Database & Data Models](#15-database--data-models)
   - [1.6 Authentication & Authorization Strategy](#16-authentication--authorization-strategy)
   - [1.7 User Roles & Access Hierarchy](#17-user-roles--access-hierarchy)
   - [1.8 Standardized Response & Operational Error Envelopes](#18-standardized-response--operational-error-envelopes)
   - [1.9 Environment & Configuration Requirements](#19-environment--configuration-requirements)
2. [API Reference Documentation](#2-api-reference-documentation)
   - [2.1 Server & System Health Module](#21-server--system-health-module)
   - [2.2 Authentication & OTP Module](#22-authentication--otp-module)
   - [2.3 User Management Module](#23-user-management-module)
   - [2.4 Vendor & Catering Module](#24-vendor--catering-module)
   - [2.5 Super Admin Module](#25-super-admin-module)
3. [Complete API Summary Matrix](#3-complete-api-summary-matrix)

---

## 1. Project Overview

### 1.1 Project Name & Purpose

* **Project Name**: Prasang Backend (`prasang-server`)
* **Project Purpose**: **Prasang** is an end-to-end event and catering management platform designed to connect event organizers, vendors/caterers, menu planners, and end customers seamlessly. 
* **Backend Responsibilities**: `prasang-server` serves as the core RESTful micro-service infrastructure powering user authentication, vendor onboardings & profiles, anonymous guest browsing, event estimation requests, menu management, and administrative monitoring.

---

### 1.2 Core Business Modules

The backend is structured cleanly using **Domain-Driven Modular Architecture**:

1. **System Health & Server Info (`health`)**: Real-time health monitoring, database readiness checks, process uptime, and memory usage analytics.
2. **Authentication & Identity (`auth`)**: Dual-strategy authentication (`password` for dev & `otp` for production), mobile-based auth, JWT access/refresh token rotation, role assignment, and OTP lifecycle management.
3. **User Domain (`user`)**: Core user account management, role escalation, and user lookup APIs.
4. **Vendor / Catering Domain (`vendor`)**: Public vendor discovery, guest browsing support, estimation request submission, and vendor dashboard analytics.
5. **Super Admin Domain (`admin`)**: Platform-wide metrics, overall user & vendor statistics, and platform monitoring.

---

### 1.3 Technology Stack & Dependencies

#### Core Frameworks & Runtime
* **Runtime**: Node.js (`>= 18.0.0`)
* **Web Framework**: Express.js (`^4.19.2`)
* **Language**: TypeScript (`^5.5.2`) with strict type checks (`noImplicitAny`, `strictNullChecks`).

#### Security & Middleware
* **Helmet** (`^7.1.0`): HTTP security headers enforcement.
* **CORS** (`^2.8.5`): Cross-Origin Resource Sharing configuration.
* **bcryptjs** (`^2.4.3`): Password hashing algorithm with auto-generated salts.
* **jsonwebtoken** (`^9.0.2`): Signed JWT tokens for Access and Refresh session states.

#### Database & Validation
* **Mongoose** (`^8.4.3`): MongoDB ODM with schema validation, indexes, virtuals, and JSON transforms.
* **Zod** (`^3.23.8`): Fail-fast environment variable validation and HTTP request body/query/path parameter validation.

#### Utility & Logging
* **Winston** (`^3.13.0`): Structured logging framework (info, warn, error, debug).
* **Morgan** (`^1.10.0`): HTTP request logging middleware linked to Winston logger stream.
* **HTTP Status Codes** (`^2.3.0`): Standardized status code constants.

#### Dev Tooling
* **tsx**: High-performance TypeScript execution & watcher for development.
* **tsc & tsc-alias**: TypeScript compilation and module alias resolution (`@/*` -> `src/*`).

---

### 1.4 Backend Architecture & Design Patterns

`prasang-server` uses a **Domain-Driven Modular Architecture** combined with a layered **Controller-Service-Model** pattern:

```
                  ┌─────────────────────────────────────────┐
                  │           Client Request                │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Express App & Global Middlewares     │
                  │ (Helmet, CORS, Morgan, Error Catcher)   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │     API Router Aggregator (/api/v1)     │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌───────────────────┐        ┌───────────────────┐         ┌───────────────────┐
│   Auth Module     │        │    User Module    │         │   Vendor Module   │
│ ┌───────────────┐ │        │ ┌───────────────┐ │         │ ┌───────────────┐ │
│ │ auth.route.ts │ │        │ │ user.route.ts │ │         │ │vendor.route.ts│ │
│ └───────┬───────┘ │        │ └───────┬───────┘ │         │ └───────┬───────┘ │
│         │ (Zod)   │        │         │ (Zod)   │         │         │         │
│         ▼         │        │         ▼         │         │         ▼         │
│ ┌───────────────┐ │        │ ┌───────────────┐ │         │ ┌───────────────┐ │
│ │auth.controller│ │        │ │user.controller│ │         │ │vendor.cntrller│ │
│ └───────┬───────┘ │        │ └───────┬───────┘ │         │ └───────┬───────┘ │
│         │         │        │         │         │         │         │         │
│         ▼         │        │         ▼         │         │         ▼         │
│ ┌───────────────┐ │        │ ┌───────────────┐ │         │ ┌───────────────┐ │
│ │ auth.service  │ │        │ │ user.service  │ │         │ │ vendor.service│ │
│ └───────┬───────┘ │        │ └───────┬───────┘ │         │ └───────┬───────┘ │
│         │         │        │         │         │         │         │         │
│         ▼         │        │         ▼         │         │         ▼         │
│ ┌───────────────┐ │        │ ┌───────────────┐ │         │ ┌───────────────┐ │
│ │  otp.model.ts │ │        │ │ user.model.ts │ │         │ │vendor.model.ts│ │
│ └───────────────┘ │        │ └───────────────┘ │         │ └───────────────┘ │
└───────────────────┘        └───────────────────┘         └───────────────────┘
```

---

### 1.5 Database & Data Models

The system connects to **MongoDB Atlas** using **Mongoose ODM**. Connection is managed in `src/config/database.config.ts`.

#### 1. User Model (`User`)
* **Collection**: `users`
* **Schema**:
  - `mobileNumber` (`String`, required, unique, indexed): 10-digit Indian mobile number.
  - `name` (`String`, required, trimmed): User full name.
  - `email` (`String`, unique, sparse, lowercase): Optional user email address.
  - `password` (`String`, selected: `false`): Hashed password using bcrypt (only retrieved when explicitly requested with `.select('+password')`).
  - `role` (`String`, enum: `['SUPER_ADMIN', 'VENDOR', 'USER']`, default: `'USER'`, indexed).
  - `isActive` (`Boolean`, default: `true`).
  - `lastLoginAt` (`Date`).
  - Timestamps (`createdAt`, `updatedAt`).

#### 2. Vendor Model (`Vendor`)
* **Collection**: `vendors`
* **Schema**:
  - `userId` (`ObjectId` ref `'User'`, required, unique, indexed): Links to the owner user account.
  - `businessName` (`String`, required, trimmed).
  - `ownerName` (`String`, required, trimmed).
  - `city` (`String`, optional).
  - `address` (`String`, optional).
  - `cuisineTypes` (`[String]`, default: `[]`).
  - `status` (`String`, enum: `['PENDING', 'APPROVED', 'REJECTED']`, default: `'APPROVED'`, indexed).
  - Timestamps (`createdAt`, `updatedAt`).

#### 3. OTP Model (`Otp`)
* **Collection**: `otps`
* **Schema**:
  - `mobileNumber` (`String`, required, indexed).
  - `otp` (`String`, required).
  - `purpose` (`String`, enum: `['LOGIN', 'REGISTRATION', 'PASSWORD_RESET']`, default: `'LOGIN'`).
  - `expiresAt` (`Date`, required, TTL index `expires: 0` for auto-deletion upon expiration).
  - `isVerified` (`Boolean`, default: `false`).
  - Timestamps (`createdAt`, `updatedAt`).

---

### 1.6 Authentication & Authorization Strategy

The backend implements a flexible **Pluggable Authentication Strategy**:

1. **Authentication Modes (`env.AUTH_MODE`)**:
   - `password` (Development Default): Authenticates users/vendors via mobile number + password.
   - `otp` (Production Ready): Authenticates users/vendors via mobile number + 6-digit OTP code. In OTP mode, new users are automatically registered upon first successful OTP verification if their profile doesn't exist.
2. **OTP Providers (`OtpProviderFactory`)**:
   - `DevelopmentOtpProvider`: Uses mock default OTP (`DEFAULT_DEV_OTP`, e.g. `'123456'`) and logs OTP codes cleanly in console without sending real SMS.
   - `ProductionOtpProvider`: Generates random 6-digit cryptographic OTPs and integrates with SMS Gateway providers.
3. **Token Management**:
   - **Access Token**: Short-lived JWT (`JWT_EXPIRES_IN`, default `1d`), contains `id`, `mobileNumber`, `name`, `email`, and `role`.
   - **Refresh Token**: Long-lived JWT (`JWT_REFRESH_EXPIRES_IN`, default `7d`), contains user `id`. Used at `/api/v1/auth/refresh-token` to issue new token pairs.
4. **Middlewares**:
   - `authenticate`: Enforces valid Bearer JWT in `Authorization` header. Attaches authenticated user payload to `req.user`.
   - `optionalAuthenticate`: Allows unauthenticated guest access (`req.isAnonymous = true`), but automatically attaches `req.user` (`req.isAnonymous = false`) if valid Bearer token is passed.
   - `authorize(...roles)`: Verifies `req.user.role` against required roles array.

---

### 1.7 User Roles & Access Hierarchy

The system defines 3 distinct roles in `src/constants/roles.ts`:

| Role Name | Access Level | Description |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Full Platform Access | Full control over users, vendor accounts, system analytics, and administrative management. |
| `VENDOR` | Vendor Portal Access | Access to vendor dashboard, profile management, menu offerings, and incoming client estimations. |
| `USER` | Customer Access | Registered end user capable of submitting estimation requests and browsing vendors. |
| *(Guest / Anonymous)* | Public Access | Unauthenticated customer able to browse public vendor lists and view vendor profiles. |

---

### 1.8 Standardized Response & Operational Error Envelopes

All HTTP responses conform to standard JSON envelopes created by `ApiResponse` and `ApiError`:

#### 1. Success Response Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {}
}
```

#### 2. Paginated / Meta Success Envelope (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource list retrieved",
  "data": [],
  "meta": {
    "isAnonymous": false,
    "user": {
      "name": "Ankit Prajapati",
      "role": "USER"
    }
  }
}
```

#### 3. Operational Error Response Envelope (`4xx` / `5xx`)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "body.mobileNumber",
      "message": "Invalid mobile number. Must be a valid 10-digit Indian mobile number"
    }
  ]
}
```

---

### 1.9 Environment & Configuration Requirements

Environment variables are validated at startup using **Zod** schema in `src/config/env.config.ts`:

| Environment Variable | Type | Default | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | `enum` | `development` | No | Active environment (`development`, `production`, `test`, `staging`) |
| `PORT` | `number` | `5001` | No | HTTP server port |
| `API_PREFIX` | `string` | `/api/v1` | No | Base routing path prefix |
| `CORS_ORIGIN` | `string` | `*` | No | Allowed CORS origin domain |
| `LOG_LEVEL` | `enum` | `info` | No | Winston logger level (`debug`, `info`, `warn`, `error`) |
| `MONGODB_URI` | `string` | — | **Yes** | MongoDB Atlas connection SRV string |
| `AUTH_MODE` | `enum` | `password` | No | Authentication mode (`password` or `otp`) |
| `JWT_SECRET` | `string` | *(Dev Secret)* | No | Secret key for signing Access Tokens |
| `JWT_EXPIRES_IN` | `string` | `1d` | No | Expiration duration for Access Tokens |
| `JWT_REFRESH_SECRET` | `string` | *(Dev Secret)* | No | Secret key for signing Refresh Tokens |
| `JWT_REFRESH_EXPIRES_IN` | `string` | `7d` | No | Expiration duration for Refresh Tokens |
| `OTP_EXPIRES_IN_MINUTES` | `number` | `5` | No | Validity duration of generated OTPs in minutes |
| `DEFAULT_DEV_OTP` | `string` | `123456` | No | Static default OTP code for development environment |

---

## 2. API Reference Documentation

---

### 2.1 Server & System Health Module

#### 1. Server Welcome Info
* **API Name**: Get Server Info
* **API Endpoint**: `/`
* **HTTP Method**: `GET`
* **Description**: Returns root server metadata, application title, version, and documentation pointer.
* **Authentication Required**: No
* **Required Role**: None
* **Request Parameters**: None

##### Response Example (`200 OK`):
```json
{
  "name": "prasang-server",
  "version": "1.0.0",
  "description": "Prasang API Services Infrastructure",
  "documentation": "/api/v1/health"
}
```

---

#### 2. API v1 Root Welcome
* **API Name**: Get API v1 Welcome & Endpoints Index
* **API Endpoint**: `/api/v1`
* **HTTP Method**: `GET`
* **Description**: Lists main mounted API v1 module resource paths.
* **Authentication Required**: No
* **Required Role**: None
* **Request Parameters**: None

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "message": "Welcome to Prasang API v1",
  "endpoints": {
    "health": "/api/v1/health",
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "vendors": "/api/v1/vendors",
    "admin": "/api/v1/admin"
  }
}
```

---

#### 3. System Health Check
* **API Name**: Check System Health
* **API Endpoint**: `/api/v1/health`
* **HTTP Method**: `GET`
* **Description**: Inspects system status, process uptime, environment, memory usage, and MongoDB database connection state.
* **Authentication Required**: No
* **Required Role**: None
* **Request Parameters**: None

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "System is healthy and operational",
  "data": {
    "status": "UP",
    "timestamp": "2026-10-04T12:00:00.000Z",
    "uptimeSeconds": 1420,
    "environment": "development",
    "database": {
      "connected": true,
      "readyState": 1,
      "stateLabel": "connected"
    },
    "memoryUsage": {
      "rss": 48529408,
      "heapTotal": 29884416,
      "heapUsed": 21543824,
      "external": 1423851
    }
  }
}
```

---

### 2.2 Authentication & OTP Module

---

#### 4. Register End User
* **API Name**: Register End User Account
* **API Endpoint**: `/api/v1/auth/register/user`
* **HTTP Method**: `POST`
* **Description**: Registers a new customer account with `USER` role. Generates initial JWT access & refresh token pair.
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `mobileNumber` | `string` | **Yes** | Regex `/^[6-9]\d{9}$/` | Valid 10-digit Indian mobile number |
| `name` | `string` | **Yes** | Min length: 2 | Full name of the user |
| `password` | `string` | Optional | Min length: 6 | Password (Required if `AUTH_MODE=password`) |
| `email` | `string` | Optional | Valid email format | User email address |

```json
{
  "mobileNumber": "9876543210",
  "name": "Ankit Prajapati",
  "password": "Password@123",
  "email": "ankit@example.com"
}
```

##### Response Example (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "66f7d0a21b34c891e4a12345",
      "mobileNumber": "9876543210",
      "name": "Ankit Prajapati",
      "email": "ankit@example.com",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-10-04T12:10:00.000Z",
      "updatedAt": "2026-10-04T12:10:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

##### Possible Error Responses:
* `400 Bad Request`: Mobile number format invalid or password missing in password auth mode.
* `409 Conflict`: Mobile number or email address is already registered.

---

#### 5. Login End User
* **API Name**: Login End User Account
* **API Endpoint**: `/api/v1/auth/login/user`
* **HTTP Method**: `POST`
* **Description**: Authenticates an existing user account using password or OTP depending on system `AUTH_MODE`.
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
```json
{
  "mobileNumber": "9876543210",
  "password": "Password@123"
}
```
*(Or in OTP Mode: `{ "mobileNumber": "9876543210", "otp": "123456" }`)*

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "66f7d0a21b34c891e4a12345",
      "mobileNumber": "9876543210",
      "name": "Ankit Prajapati",
      "email": "ankit@example.com",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-10-04T12:10:00.000Z",
      "updatedAt": "2026-10-04T12:15:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

##### Possible Error Responses:
* `401 Unauthorized`: Invalid credentials / incorrect password or invalid/expired OTP.
* `403 Forbidden`: Account is deactivated.

---

#### 6. Register Vendor Account & Profile
* **API Name**: Register Vendor User Account & Business Profile
* **API Endpoint**: `/api/v1/auth/register/vendor`
* **HTTP Method**: `POST`
* **Description**: Creates a user account with `VENDOR` role and simultaneously creates an associated `Vendor` profile.
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `mobileNumber` | `string` | **Yes** | Indian 10-digit format | Vendor mobile number |
| `name` | `string` | **Yes** | Min length: 2 | Account owner name |
| `businessName` | `string` | **Yes** | Min length: 2 | Catering/Vendor business name |
| `password` | `string` | Optional | Min length: 6 | Account password |
| `email` | `string` | Optional | Email format | Business email address |
| `ownerName` | `string` | Optional | Min length: 2 | Owner contact name (Defaults to `name`) |
| `city` | `string` | Optional | — | Operating city |
| `address` | `string` | Optional | — | Physical business address |
| `cuisineTypes` | `array[string]` | Optional | — | Array of cuisine specializations |

```json
{
  "mobileNumber": "9812345678",
  "name": "Rajesh Sharma",
  "password": "VendorPassword@123",
  "email": "info@royalcaters.com",
  "businessName": "Royal Caterers & Event Planners",
  "city": "Ahmedabad",
  "address": "102 SG Highway, Ahmedabad",
  "cuisineTypes": ["North Indian", "Gujarati", "Chinese", "Desserts"]
}
```

##### Response Example (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Vendor account & profile registered successfully",
  "data": {
    "user": {
      "id": "66f7d5b11b34c891e4a67890",
      "mobileNumber": "9812345678",
      "name": "Rajesh Sharma",
      "email": "info@royalcaters.com",
      "role": "VENDOR",
      "isActive": true,
      "createdAt": "2026-10-04T12:20:00.000Z",
      "updatedAt": "2026-10-04T12:20:00.000Z"
    },
    "vendor": {
      "id": "66f7d5b21b34c891e4a67891",
      "userId": "66f7d5b11b34c891e4a67890",
      "businessName": "Royal Caterers & Event Planners",
      "ownerName": "Rajesh Sharma",
      "city": "Ahmedabad",
      "address": "102 SG Highway, Ahmedabad",
      "cuisineTypes": ["North Indian", "Gujarati", "Chinese", "Desserts"],
      "status": "APPROVED",
      "createdAt": "2026-10-04T12:20:00.000Z",
      "updatedAt": "2026-10-04T12:20:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

#### 7. Login Vendor Account
* **API Name**: Login Vendor Account
* **API Endpoint**: `/api/v1/auth/login/vendor`
* **HTTP Method**: `POST`
* **Description**: Authenticates vendor credentials. Verifies that user account role is `VENDOR` or `SUPER_ADMIN`.
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
```json
{
  "mobileNumber": "9812345678",
  "password": "VendorPassword@123"
}
```

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vendor logged in successfully",
  "data": {
    "user": {
      "id": "66f7d5b11b34c891e4a67890",
      "mobileNumber": "9812345678",
      "name": "Rajesh Sharma",
      "email": "info@royalcaters.com",
      "role": "VENDOR",
      "isActive": true
    },
    "vendor": {
      "id": "66f7d5b21b34c891e4a67891",
      "businessName": "Royal Caterers & Event Planners",
      "ownerName": "Rajesh Sharma",
      "city": "Ahmedabad",
      "cuisineTypes": ["North Indian", "Gujarati", "Chinese", "Desserts"],
      "status": "APPROVED"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

##### Possible Error Responses:
* `401 Unauthorized`: Invalid mobile number or password.
* `403 Forbidden`: Mobile number belongs to a regular `USER` without a vendor profile, or vendor account is deactivated.

---

#### 8. Login Super Admin
* **API Name**: Authenticate Super Admin Account
* **API Endpoint**: `/api/v1/auth/login/admin`
* **HTTP Method**: `POST`
* **Description**: Authenticates super admin credentials. Verifies strict `SUPER_ADMIN` role authorization.
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
```json
{
  "mobileNumber": "9999999999",
  "password": "SuperAdminSecretPassword"
}
```

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Super Admin authenticated successfully",
  "data": {
    "user": {
      "id": "66f7c0011b34c891e4a00001",
      "mobileNumber": "9999999999",
      "name": "System Administrator",
      "email": "admin@prasang.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

#### 9. Send OTP
* **API Name**: Generate & Send OTP Code
* **API Endpoint**: `/api/v1/auth/send-otp`
* **HTTP Method**: `POST`
* **Description**: Generates an OTP code valid for `OTP_EXPIRES_IN_MINUTES` (5 mins) and sends via SMS (or returns in payload during development mode).
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
```json
{
  "mobileNumber": "9876543210",
  "purpose": "LOGIN"
}
```
*Note*: `purpose` can be `LOGIN`, `REGISTRATION`, or `PASSWORD_RESET` (Default: `LOGIN`).

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent successfully. (Dev mode OTP: 123456)",
  "data": {
    "mobileNumber": "9876543210",
    "expiresAt": "2026-10-04T12:35:00.000Z",
    "otp": "123456",
    "message": "OTP sent successfully. (Dev mode OTP: 123456)"
  }
}
```

---

#### 10. Verify OTP
* **API Name**: Verify OTP Code
* **API Endpoint**: `/api/v1/auth/verify-otp`
* **HTTP Method**: `POST`
* **Description**: Validates an OTP code submitted by a user for a specific purpose.
* **Authentication Required**: No
* **Required Role**: None

##### Request Body:
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456",
  "purpose": "LOGIN"
}
```

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "verified": true,
    "message": "OTP verified successfully"
  }
}
```

##### Possible Error Responses:
* `401 Unauthorized`: Invalid or expired OTP.

---

#### 11. Refresh Access Token
* **API Name**: Refresh Access & Refresh Tokens
* **API Endpoint**: `/api/v1/auth/refresh-token`
* **HTTP Method**: `POST`
* **Description**: Validates a Refresh JWT token and generates a new pair of Access and Refresh tokens.
* **Authentication Required**: No (Token supplied in body)
* **Required Role**: None

##### Request Body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Possible Error Responses:
* `401 Unauthorized`: Refresh token expired, tampered, or user account inactive.

---

#### 12. User Logout
* **API Name**: User Logout
* **API Endpoint**: `/api/v1/auth/logout`
* **HTTP Method**: `POST`
* **Description**: Invalidates the active session on the client side.
* **Authentication Required**: No
* **Required Role**: None

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged out successfully"
}
```

---

#### 13. Get Current Authenticated User Profile
* **API Name**: Get Current User Profile (`me`)
* **API Endpoint**: `/api/v1/auth/me`
* **HTTP Method**: `GET`
* **Description**: Fetches current authenticated user data from `req.user.id`. Includes linked vendor profile if role is `VENDOR`.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: Any authenticated role

##### Request Headers:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user profile fetched successfully",
  "data": {
    "user": {
      "id": "66f7d5b11b34c891e4a67890",
      "mobileNumber": "9812345678",
      "name": "Rajesh Sharma",
      "email": "info@royalcaters.com",
      "role": "VENDOR",
      "isActive": true,
      "createdAt": "2026-10-04T12:20:00.000Z",
      "updatedAt": "2026-10-04T12:20:00.000Z"
    },
    "vendor": {
      "id": "66f7d5b21b34c891e4a67891",
      "userId": "66f7d5b11b34c891e4a67890",
      "businessName": "Royal Caterers & Event Planners",
      "ownerName": "Rajesh Sharma",
      "city": "Ahmedabad",
      "cuisineTypes": ["North Indian", "Gujarati", "Chinese", "Desserts"],
      "status": "APPROVED"
    }
  }
}
```

---

### 2.3 User Management Module

---

#### 14. Get All Users (Admin Only)
* **API Name**: List All Registered Users
* **API Endpoint**: `/api/v1/users`
* **HTTP Method**: `GET`
* **Description**: Returns a complete list of registered users sorted by newest first.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: `SUPER_ADMIN`

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "66f7d0a21b34c891e4a12345",
      "mobileNumber": "9876543210",
      "name": "Ankit Prajapati",
      "email": "ankit@example.com",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-10-04T12:10:00.000Z"
    }
  ]
}
```

##### Possible Error Responses:
* `401 Unauthorized`: Missing or invalid Bearer token.
* `403 Forbidden`: User role is not `SUPER_ADMIN`.

---

#### 15. Get User by ID
* **API Name**: Get User Details by ID
* **API Endpoint**: `/api/v1/users/:id`
* **HTTP Method**: `GET`
* **Description**: Returns detailed information for a specific user ID.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: Any authenticated user
* **Path Parameters**:
  - `id` (`string`, required): Valid MongoDB ObjectId string.

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "66f7d0a21b34c891e4a12345",
    "mobileNumber": "9876543210",
    "name": "Ankit Prajapati",
    "email": "ankit@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2026-10-04T12:10:00.000Z",
    "updatedAt": "2026-10-04T12:10:00.000Z"
  }
}
```

##### Possible Error Responses:
* `404 Not Found`: User with specified ID does not exist.

---

#### 16. Create User Manually (Admin Action)
* **API Name**: Create User Account Manually
* **API Endpoint**: `/api/v1/users`
* **HTTP Method**: `POST`
* **Description**: Allows a Super Admin to manually provision user accounts with specific roles.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: `SUPER_ADMIN`

##### Request Body:
```json
{
  "mobileNumber": "9765432109",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "VENDOR"
}
```

##### Response Example (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": "66f7e1121b34c891e4a99999",
    "mobileNumber": "9765432109",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "VENDOR",
    "isActive": true,
    "createdAt": "2026-10-04T12:50:00.000Z"
  }
}
```

---

### 2.4 Vendor & Catering Module

---

#### 17. Public / Guest Browsing Vendors List
* **API Name**: Browse Approved Vendors (Guest / Public Flow)
* **API Endpoint**: `/api/v1/vendors/public`
* **HTTP Method**: `GET`
* **Description**: Returns all caterers/vendors with `status: 'APPROVED'`. Supports guest browsing without requiring login. If a Bearer token is provided, context is attached via `optionalAuthenticate`.
* **Authentication Required**: **Optional** (`optionalAuthenticate`)
* **Required Role**: None (Guests permitted)

##### Response Example (`200 OK` - Guest Flow):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vendors retrieved for guest/anonymous user",
  "data": [
    {
      "id": "66f7d5b21b34c891e4a67891",
      "businessName": "Royal Caterers & Event Planners",
      "ownerName": "Rajesh Sharma",
      "city": "Ahmedabad",
      "address": "102 SG Highway, Ahmedabad",
      "cuisineTypes": ["North Indian", "Gujarati", "Chinese"],
      "status": "APPROVED",
      "userId": {
        "id": "66f7d5b11b34c891e4a67890",
        "name": "Rajesh Sharma",
        "mobileNumber": "9812345678",
        "email": "info@royalcaters.com"
      }
    }
  ],
  "meta": {
    "isAnonymous": true,
    "user": null
  }
}
```

---

#### 18. Public / Guest Get Vendor Profile by ID
* **API Name**: Get Vendor Profile Details
* **API Endpoint**: `/api/v1/vendors/public/:id`
* **HTTP Method**: `GET`
* **Description**: Retrieves detailed profile of a vendor by Vendor ID.
* **Authentication Required**: **Optional** (`optionalAuthenticate`)
* **Path Parameters**:
  - `id` (`string`, required): Vendor MongoDB ObjectId.

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vendor profile retrieved",
  "data": {
    "id": "66f7d5b21b34c891e4a67891",
    "businessName": "Royal Caterers & Event Planners",
    "ownerName": "Rajesh Sharma",
    "city": "Ahmedabad",
    "address": "102 SG Highway, Ahmedabad",
    "cuisineTypes": ["North Indian", "Gujarati", "Chinese"],
    "status": "APPROVED"
  }
}
```

---

#### 19. Submit Estimation Request
* **API Name**: Request Event Catering Estimation / Quote
* **API Endpoint**: `/api/v1/vendors/estimation-request`
* **HTTP Method**: `POST`
* **Description**: Allows an authenticated customer to request a catering price estimation from a vendor. Supports preserving context if initiated during anonymous guest browsing.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: Any authenticated user (`USER`, `VENDOR`, `SUPER_ADMIN`)

##### Request Body:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vendorId` | `string` | **Yes** | Target vendor ID |
| `guestCount` | `number` | **Yes** | Expected guest count for the event |
| `eventDate` | `string` | **Yes** | Date of the planned event (`YYYY-MM-DD`) |
| `preservedActionContext` | `object` | Optional | Custom state context preserved across guest login transition |

```json
{
  "vendorId": "66f7d5b21b34c891e4a67891",
  "guestCount": 250,
  "eventDate": "2026-12-15",
  "preservedActionContext": {
    "selectedMenuPackage": "Royal Grand Buffet",
    "draftNote": "Need live jalebi counter"
  }
}
```

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Estimation request submitted successfully!",
  "data": {
    "requestId": "est_1728045600000",
    "requestedBy": {
      "id": "66f7d0a21b34c891e4a12345",
      "mobileNumber": "9876543210",
      "name": "Ankit Prajapati",
      "role": "USER"
    },
    "vendorId": "66f7d5b21b34c891e4a67891",
    "guestCount": 250,
    "eventDate": "2026-12-15",
    "contextPreserved": {
      "selectedMenuPackage": "Royal Grand Buffet",
      "draftNote": "Need live jalebi counter"
    },
    "status": "PENDING_VENDOR_REVIEW"
  }
}
```

---

#### 20. Get Vendor Dashboard Metrics
* **API Name**: Get Vendor Dashboard & Analytics
* **API Endpoint**: `/api/v1/vendors/dashboard`
* **HTTP Method**: `GET`
* **Description**: Returns vendor portal metrics including quotations, pending estimations, confirmed bookings, and vendor profile data.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: `VENDOR` or `SUPER_ADMIN`

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vendor Dashboard access granted",
  "data": {
    "user": {
      "id": "66f7d5b11b34c891e4a67890",
      "name": "Rajesh Sharma",
      "role": "VENDOR"
    },
    "vendor": {
      "id": "66f7d5b21b34c891e4a67891",
      "businessName": "Royal Caterers & Event Planners",
      "status": "APPROVED"
    },
    "dashboardStats": {
      "totalQuotations": 12,
      "pendingEstimations": 4,
      "confirmedBookings": 8,
      "rating": 4.8
    }
  }
}
```

---

### 2.5 Super Admin Module

---

#### 21. Get Super Admin System Overview
* **API Name**: Get Super Admin System Metrics
* **API Endpoint**: `/api/v1/admin/overview`
* **HTTP Method**: `GET`
* **Description**: Fetches overall system metrics, user counts, active vendor counts, and recent user signups.
* **Authentication Required**: **Yes** (`Bearer <accessToken>`)
* **Required Role**: `SUPER_ADMIN`

##### Response Example (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Super Admin overview fetched successfully",
  "data": {
    "adminUser": {
      "id": "66f7c0011b34c891e4a00001",
      "name": "System Administrator",
      "role": "SUPER_ADMIN"
    },
    "totalUsers": 142,
    "totalVendors": 28,
    "recentUsers": [
      {
        "id": "66f7d0a21b34c891e4a12345",
        "name": "Ankit Prajapati",
        "mobileNumber": "9876543210",
        "role": "USER",
        "createdAt": "2026-10-04T12:10:00.000Z"
      }
    ]
  }
}
```

##### Possible Error Responses:
* `401 Unauthorized`: Missing authentication token.
* `403 Forbidden`: Access denied if caller does not possess `SUPER_ADMIN` role.

---

## 3. Complete API Summary Matrix

The following table summarizes **100% of all 21 implemented APIs** across `prasang-server`:

| # | API Name | Method | Endpoint URL | Authentication | Required Role |
| :-: | :--- | :-: | :--- | :-: | :--- |
| **1** | Get Server Info | `GET` | `/` | No | None |
| **2** | Get API v1 Welcome | `GET` | `/api/v1` | No | None |
| **3** | Check System Health | `GET` | `/api/v1/health` | No | None |
| **4** | Register End User | `POST` | `/api/v1/auth/register/user` | No | None |
| **5** | Login End User | `POST` | `/api/v1/auth/login/user` | No | None |
| **6** | Register Vendor Account & Profile | `POST` | `/api/v1/auth/register/vendor` | No | None |
| **7** | Login Vendor Account | `POST` | `/api/v1/auth/login/vendor` | No | None |
| **8** | Login Super Admin | `POST` | `/api/v1/auth/login/admin` | No | None |
| **9** | Send OTP | `POST` | `/api/v1/auth/send-otp` | No | None |
| **10** | Verify OTP | `POST` | `/api/v1/auth/verify-otp` | No | None |
| **11** | Refresh Access Token | `POST` | `/api/v1/auth/refresh-token` | No | None |
| **12** | User Logout | `POST` | `/api/v1/auth/logout` | No | None |
| **13** | Get Current User Profile (`me`) | `GET` | `/api/v1/auth/me` | **Yes** | Any Authenticated Role |
| **14** | List All Users | `GET` | `/api/v1/users` | **Yes** | `SUPER_ADMIN` |
| **15** | Get User Details by ID | `GET` | `/api/v1/users/:id` | **Yes** | Any Authenticated Role |
| **16** | Create User Manually | `POST` | `/api/v1/users` | **Yes** | `SUPER_ADMIN` |
| **17** | Browse Approved Vendors (Public Flow) | `GET` | `/api/v1/vendors/public` | Optional | None (Guests allowed) |
| **18** | Get Vendor Profile Details | `GET` | `/api/v1/vendors/public/:id` | Optional | None (Guests allowed) |
| **19** | Request Event Catering Estimation | `POST` | `/api/v1/vendors/estimation-request` | **Yes** | Any Authenticated Role |
| **20** | Get Vendor Dashboard & Metrics | `GET` | `/api/v1/vendors/dashboard` | **Yes** | `VENDOR`, `SUPER_ADMIN` |
| **21** | Get Super Admin System Metrics | `GET` | `/api/v1/admin/overview` | **Yes** | `SUPER_ADMIN` |

---

*Documentation compiled and verified against codebase implementation.*
