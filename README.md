# 🚀 Prasang Backend (`prasang-server`)

> Production-ready, highly scalable, and maintainable Node.js & Express.js backend services infrastructure built strictly with **TypeScript**.

---

## 📋 Table of Contents

- [Overview & Purpose](#overview--purpose)
- [Prasang Backend Architecture](#prasang-backend-architecture)
- [Tech Stack & Key Dependencies](#tech-stack--key-dependencies)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Available Commands & Scripts](#available-commands--scripts)
- [Folder Structure](#folder-structure)
- [Design Patterns & Principles](#design-patterns--principles)
- [API Structure & Versioning](#api-structure--versioning)
- [Error & Response Handling](#error--response-handling)
- [Creating & Adding New Modules (Developer Guide)](#creating--adding-new-modules-developer-guide)
- [Database Configuration & Integration](#database-configuration--integration)
- [Authentication & Authorization Strategy](#authentication--authorization-strategy)
- [Coding Standards & Conventions](#coding-standards--conventions)
- [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
- [Troubleshooting & Common Issues](#troubleshooting--common-issues)
- [Deployment Guidelines](#deployment-guidelines)

---

## 🌟 Overview & Purpose

**Prasang** is an end-to-end event and catering management platform designed to connect event organizers, caterers, menu planners, and customers seamlessly.

The **Prasang Backend (`prasang-server`)** provides core RESTful API services power user authentication, caterer profiles, custom menu builders, quotations, event bookings, payment integrations, real-time notifications, and admin dashboards.

### Core Goals
- **Modular Scalability**: Built to scale easily as new business domains (caterers, menus, bookings, payments, notifications) are introduced without monolithic coupling or major restructuring.
- **Strict Type Safety**: 100% TypeScript with zero `.js` source files and strict compile checks.
- **Fail-Fast Configuration**: Validates environment configurations using `Zod` at startup.
- **Unified Standardized Responses**: Predictable JSON response envelopes for success and failure states.

---

## 📐 Prasang Backend Architecture

The backend follows a **Domain-Driven Modular Architecture** combined with a layered **Controller-Service-Model** pattern:

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
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌──────────────────────┐                      ┌──────────────────────┐
     │  User Domain Module  │                      │ Caterer Domain Module│
     │                      │                      │   (Future Module)    │
     │ ┌──────────────────┐ │                      │ ┌──────────────────┐ │
     │ │  user.route.ts   │ │                      │ │ caterer.route.ts │ │
     │ └────────┬─────────┘ │                      │ └────────┬─────────┘ │
     │          │ (Validation)                     │          │           │
     │          ▼           │                      │          ▼           │
     │ ┌──────────────────┐ │                      │ ┌──────────────────┐ │
     │ │user.controller.ts│ │                      │ │caterer.controller│ │
     │ └────────┬─────────┘ │                      │ └────────┬─────────┘ │
     │          │           │                      │          │           │
     │          ▼           │                      │          ▼           │
     │ ┌──────────────────┐ │                      │ ┌──────────────────┐ │
     │ │ user.service.ts  │ │                      │ │ caterer.service  │ │
     │ └────────┬─────────┘ │                      │ └────────┬─────────┘ │
     │          │           │                      │          │           │
     │          ▼           │                      │          ▼           │
     │ ┌──────────────────┐ │                      │ ┌──────────────────┐ │
     │ │ user.model/db.ts │ │                      │ │caterer.model/db.ts │
     │ └──────────────────┘ │                      │ └──────────────────┘ │
     └──────────────────────┘                      └──────────────────────┘
```

---

## 🛠️ Tech Stack & Key Dependencies

### Core Frameworks & Runtime
- **Node.js** `>= 18.0.0`
- **Express.js** `^4.19.2`
- **TypeScript** `^5.5.2`

### Utilities & Middleware
- **Zod** (`^3.23.8`): Schema validation for environment variables and HTTP requests.
- **Winston** (`^3.13.0`): Structured logging framework.
- **Morgan** (`^1.10.0`): HTTP request logging stream.
- **Helmet** (`^7.1.0`): Express security header enforcement.
- **CORS** (`^2.8.5`): Cross-Origin Resource Sharing.
- **Dotenv** (`^16.4.5`): Multi-environment `.env` loader.
- **HTTP Status Codes** (`^2.3.0`): Standardized status constants.

### Dev Tooling & Build System
- **tsx**: High-performance TypeScript execution & watcher for development.
- **tsc & tsc-alias**: TypeScript compilation and path alias resolution (`@/*`).
- **ESLint & Prettier**: Code linting and formatting enforcement.
- **rimraf**: Cross-platform directory cleaner.

---

## ⚡ Prerequisites

Make sure the following tools are installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- Git

---

## 📥 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prasang
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Verify the server is running by opening:
   - Root Welcome: `http://localhost:5001/`
   - Health Check: `http://localhost:5001/api/v1/health`

---

## 🔐 Environment Variables

Environment variables are defined in `.env.development` (or `.env.production`) and validated at application startup using **Zod** in [`src/config/env.config.ts`](file:///Users/ankitprajapati/Documents/WORK/prasang/src/config/env.config.ts). If any variable is missing or invalid, the server fails fast with a clear error report.

| Variable Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development \| production \| test \| staging` | `development` | Active application environment |
| `PORT` | `number` | `5001` | HTTP server port |
| `API_PREFIX` | `string` | `/api/v1` | Base API routing prefix |
| `CORS_ORIGIN` | `string` | `*` | Allowed CORS origins |
| `LOG_LEVEL` | `error \| warn \| info \| http \| debug` | `debug` | Winston logger verbosity |

---

## 💻 Available Commands & Scripts

Run the following npm scripts in your terminal:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode with live hot-reloading using `tsx`. |
| `npm run build` | Cleans `dist/`, compiles TypeScript with `tsc`, and resolves path aliases via `tsc-alias`. |
| `npm run start` | Runs the compiled JavaScript production server from `dist/server.js`. |
| `npm run type-check` | Runs the TypeScript compiler check (`tsc --noEmit`) to catch type errors without generating output. |
| `npm run lint` | Checks source code for ESLint rule violations. |
| `npm run lint:fix` | Automatically fixes auto-fixable ESLint violations. |
| `npm run format` | Formats all files in `src/` using Prettier. |
| `npm run format:check` | Verifies if all files conform to Prettier formatting rules. |

---

## 📁 Folder Structure

```
prasang/
├── .env.example                # Sample environment variable template
├── .env.development            # Local development environment configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier code formatting rules
├── .prettierignore             # Files ignored by Prettier
├── .gitignore                  # Git untracked pattern definitions
├── package.json                # Project manifest, dependencies, and npm scripts
├── tsconfig.json               # TypeScript compiler config & path mappings (@/*)
└── src/
    ├── server.ts               # HTTP listener, signal handlers (SIGTERM, uncaughtException)
    ├── app.ts                  # Express application setup & middleware stack
    ├── config/                 # Application environment and service configurations
    │   ├── env.config.ts       # Strongly-typed Zod environment validator
    │   ├── logger.config.ts    # Winston logger setup
    │   └── index.ts            # Centralized config exports
    ├── constants/              # System-wide constants & status codes
    │   ├── http-status.ts      # Standard HTTP Status codes re-export
    │   └── index.ts
    ├── middlewares/            # Express global middlewares
    │   ├── error.middleware.ts        # Centralized exception handler
    │   ├── not-found.middleware.ts    # 404 handler for unknown routes
    │   ├── request-logger.middleware.ts # Morgan request logger
    │   ├── validate.middleware.ts     # Zod request validation middleware
    │   └── index.ts
    ├── utils/                  # Generic helper utilities
    │   ├── api-error.ts        # Custom operational error class
    │   ├── api-response.ts     # Standardized JSON response envelope helper
    │   ├── async-handler.ts    # Async controller error wrapper
    │   └── index.ts
    ├── types/                  # Global TypeScript ambient definitions & Express request extensions
    │   └── index.ts
    ├── routes/                 # API routing structure & versioning aggregator
    │   ├── index.ts            # Mounts version prefix (/api/v1)
    │   └── v1/                 # API v1 routes aggregator
    │       └── index.ts
    └── modules/                # Feature Modules (Domain-driven modular organization)
        ├── health/             # System health status module
        │   ├── health.controller.ts
        │   ├── health.route.ts
        │   └── health.service.ts
        └── user/               # User domain module (Reference modular structure)
            ├── user.controller.ts
            ├── user.interface.ts
            ├── user.route.ts
            └── user.service.ts
```

---

## 🏛️ Design Patterns & Principles

1. **Separation of Concerns (SoC)**
   - **Routes**: Define HTTP endpoints, HTTP methods, and attach validation middlewares.
   - **Controllers**: Parse requests, invoke service methods, and return standardized `ApiResponse` objects. Controllers do *not* contain business logic or raw database queries.
   - **Services**: Contain pure business logic, data transformations, domain validation, and database interactions. Services are decoupled from Express `req` and `res` objects.
   - **Interfaces / DTOs**: Define TypeScript data contracts.

2. **Fail-Fast Initialization**: Environment variables are parsed at boot time before the HTTP server starts. Missing variables abort execution immediately.

3. **Operational Error Handling**: Operational errors (validation errors, resource conflicts, authorization failures) are thrown using the `ApiError` class and intercepted by global error middleware.

---

## 🌐 API Structure & Versioning

All endpoints are versioned with the `/api/v1` prefix by default.

### Standard Response Format

#### 1. Success Response Envelope (`2xx`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "usr_1",
    "name": "System Admin",
    "email": "admin@prasang.com",
    "role": "admin"
  }
}
```

#### 2. Error Response Envelope (`4xx` / `5xx`)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 🚨 Error & Response Handling

### Throwing Errors in Services or Controllers
To throw a custom operational error with a specific HTTP status code:
```ts
import { ApiError } from '@/utils/api-error.js';
import { StatusCodes } from '@/constants/index.js';

// Inside a service method
if (!caterer) {
  throw new ApiError(StatusCodes.NOT_FOUND, 'Caterer profile not found');
}
```

### Wrapping Async Controllers
Controllers are wrapped in `asyncHandler` to eliminate try-catch boilerplate:
```ts
import { Request, Response } from 'express';
import { asyncHandler, ApiResponse } from '@/utils/index.js';

export const getCaterer = asyncHandler(async (req: Request, res: Response) => {
  const caterer = await catererService.getById(req.params.id);
  ApiResponse.success(res, 'Caterer details fetched', caterer);
});
```

---

## 🧩 Creating & Adding New Modules (Developer Guide)

Follow this step-by-step guide to add a new domain module (e.g., `caterer`):

### Step 1: Create the Module Directory
Create `src/modules/caterer/` with 4 standard files:
```
src/modules/caterer/
├── caterer.interface.ts
├── caterer.service.ts
├── caterer.controller.ts
└── caterer.route.ts
```

### Step 2: Define Data Interfaces (`caterer.interface.ts`)
```ts
export interface Caterer {
  id: string;
  businessName: string;
  cuisineTypes: string[];
  rating: number;
}

export interface CreateCatererDTO {
  businessName: string;
  cuisineTypes: string[];
}
```

### Step 3: Implement Business Logic (`caterer.service.ts`)
```ts
import { Caterer, CreateCatererDTO } from './caterer.interface.js';

export class CatererService {
  public async getCaterers(): Promise<Caterer[]> {
    // Perform database query here
    return [];
  }
}

export const catererService = new CatererService();
```

### Step 4: Implement Controller (`caterer.controller.ts`)
```ts
import { Request, Response } from 'express';
import { catererService } from './caterer.service.js';
import { ApiResponse, asyncHandler } from '../../utils/index.js';

export class CatererController {
  public getCaterers = asyncHandler(async (_req: Request, res: Response) => {
    const data = await catererService.getCaterers();
    ApiResponse.success(res, 'Caterers retrieved successfully', data);
  });
}

export const catererController = new CatererController();
```

### Step 5: Define Route & Request Validation (`caterer.route.ts`)
```ts
import { Router } from 'express';
import { catererController } from './caterer.controller.js';

const router = Router();

router.get('/', catererController.getCaterers);

export const catererRoutes = router;
```

### Step 6: Register Route in Version 1 Aggregator (`src/routes/v1/index.ts`)
```ts
import { Router } from 'express';
import { healthRoutes } from '../../modules/health/health.route.js';
import { userRoutes } from '../../modules/user/user.route.ts';
import { catererRoutes } from '../../modules/caterer/caterer.route.js'; // 👈 Import new route

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/caterers', catererRoutes); // 👈 Register endpoint (/api/v1/caterers)

export const v1Router = router;
```

---

## 🗄️ Database Configuration & Integration

The architecture is ORM / ODM agnostic and prepared for database connection (such as **Prisma**, **Mongoose / MongoDB**, **TypeORM**, or **Kysely**).

### Recommended Integration Steps
1. Place database connection configuration inside `src/config/database.config.ts`.
2. Initialize database connection inside `src/server.ts` before calling `app.listen()`.
3. In domain modules (`src/modules/<feature>/`), create `<feature>.model.ts` or database repository files.

---

## 🔒 Authentication & Authorization Strategy

The system is structured to receive JWT-based or Session-based authentication middlewares under `src/middlewares/auth.middleware.ts`.

### Example Flow
1. **Auth Middleware**: Extracts Bearer token from `Authorization` header, verifies JWT, and attaches payload to `req.user`.
2. **Role Middleware**: Checks `req.user.role` against required roles (e.g., `'admin'`, `'caterer'`).
3. **Usage in Routes**:
   ```ts
   router.post('/menu', authenticate, authorize(['caterer']), menuController.createMenu);
   ```

---

## 📏 Coding Standards & Conventions

- **File Naming**: Lowercase with hyphens or dots (`user.controller.ts`, `api-error.ts`).
- **Class Naming**: PascalCase (`UserController`, `CatererService`).
- **Function / Variable Naming**: camelCase (`getUserById`, `catererService`).
- **Imports**: Always keep imports clean. Internal module imports require relative extension `.js` when using ESM/NodeNext compilation mode.
- **Path Aliases**: Use `@/*` pointing to `src/*` (e.g. `import { ApiResponse } from '@/utils/index.js'`).

---

## 🔀 Git Workflow & Branching Strategy

- `main` / `master`: Production-ready code.
- `staging` / `develop`: Integration branch for upcoming releases.
- `feature/<feature-name>`: Feature development branches (e.g., `feature/caterer-profile`).
- `bugfix/<issue-name>`: Bug fix branches.

---

## 🔧 Troubleshooting & Common Issues

### 1. `Error: listen EADDRINUSE: address already in use :::5000` (macOS)
- **Cause**: Port 5000 is used by default by macOS ControlCenter / AirPlay Receiver.
- **Solution**: The default port in `.env.development` is set to **`5001`**. If you need another port, change `PORT=5001` in your `.env.development` file.

### 2. `Invalid environment configuration` error on startup
- **Cause**: A required environment variable is missing or has an invalid type.
- **Solution**: Check the console error output to see which key failed Zod validation and update `.env.development` accordingly.

### 3. Path alias imports not working in compiled output
- **Solution**: Always run `npm run build` which invokes `tsc-alias` to rewrite `@/*` alias paths in the `dist/` build directory.

---

## 🚀 Deployment Guidelines

### Containerized Deployment (Docker)
A production Docker container can be built with:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5001
CMD ["node", "dist/server.js"]
```

### Process Manager (PM2)
To run in production using PM2:
```bash
npm run build
pm2 start dist/server.js --name "prasang-server" -i max
```

---

## 📄 License

This project is proprietary and confidential to **Prasang Platform**.
