# 📚 Prasang Backend (`prasang-server`) - Complete Architecture & API Documentation

> Production-ready, highly scalable, and maintainable RESTful API infrastructure for the **Prasang Event & Catering Management Platform**, built strictly with **TypeScript**, **Node.js**, **Express.js**, and **MongoDB Atlas (Mongoose)**.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
   - [1.1 Project Name & Purpose](#11-project-name--purpose)
   - [1.2 Core Business Modules](#12-core-business-modules)
   - [1.3 Technology Stack & Dependencies](#13-technology-stack--dependencies)
   - [1.4 Backend Architecture & Design Patterns](#14-backend-architecture--design-patterns)
   - [1.5 Domain & Database Data Architecture](#15-domain--database-data-architecture)
   - [1.6 Authentication & Authorization Strategy](#16-authentication--authorization-strategy)
   - [1.7 User Roles & Access Hierarchy](#17-user-roles--access-hierarchy)
   - [1.8 Standardized Response & Operational Error Envelopes](#18-standardized-response--operational-error-envelopes)
   - [1.9 Environment & Configuration Requirements](#19-environment--configuration-requirements)
2. [API Reference Documentation](#2-api-reference-documentation)
   - [2.1 Server & System Health Module](#21-server--system-health-module)
   - [2.2 Authentication & OTP Module](#22-authentication--otp-module)
   - [2.3 User Management Module](#23-user-management-module)
   - [2.4 Vendor Profile Module](#24-vendor-profile-module)
   - [2.5 Business Profile Module](#25-business-profile-module)
   - [2.6 Menu & MenuItem Module](#26-menu--menuitem-module)
   - [2.7 Review & Rating Module](#27-review--rating-module)
   - [2.8 Super Admin Module](#28-super-admin-module)
3. [Complete API Summary Matrix](#3-complete-api-summary-matrix)

---

## 1. Project Overview

### 1.1 Project Name & Purpose

* **Project Name**: Prasang Backend (`prasang-server`)
* **Project Purpose**: **Prasang** is an end-to-end event and catering management platform designed to connect event organizers, caterers/vendors, menu planners, and end customers seamlessly. 
* **Backend Responsibilities**: `prasang-server` serves as the core RESTful infrastructure powering user authentication, vendor profiles, business profile management, catering search/filtering, menu packages & items, customer reviews, estimation requests, and administrative monitoring.

---

### 1.2 Core Business Modules

The backend is structured using **Domain-Driven Modular Architecture**:

1. **System Health (`health`)**: Health monitoring, database connectivity state, process uptime, and memory usage.
2. **Authentication (`auth`)**: Dual-strategy auth (`password` dev & `otp` production), mobile auth, JWT token rotation, role assignment, and OTP lifecycle.
3. **User (`user`)**: Account management, role escalation, and user lookup.
4. **Vendor (`vendor`)**: Vendor account profile management and caterer estimation requests.
5. **Business (`business`)**: Dedicated catering business management, rich filtering (city, cuisine, capacity, rating), business hours, and admin approval workflows.
6. **Menu (`menu`)**: Multi-level menu planning and individual menu items.
7. **Review (`review`)**: Customer star ratings (1-5), feedback, and automated business rating summary calculations.
8. **Super Admin (`admin`)**: Platform-wide metrics, system monitoring, and administrative status management.

---

### 1.3 Domain & Database Data Architecture

The target data model cleanly separates domain responsibilities into specialized MongoDB collections:

```text
User (Authentication & Identity)
  │
  │ userId
  ▼
Vendor (Account Profile)
  │
  │ vendorId
  ▼
Business (Catering Business Profile)
  │
  ├── Menu (Packages / Catalogs)
  │     └── MenuItem (Individual Dishes / Items)
  │
  └── Review (Ratings & Customer Reviews) ◄──── User
```

#### 1. User Entity (`User`)
* **Collection**: `users`
* **Fields**:
  - `mobileNumber` (`String`, required, unique, indexed): 10-digit Indian mobile number.
  - `firstName` (`String`, required, trimmed): User first name.
  - `lastName` (`String`, optional, trimmed): User last name.
  - `email` (`String`, unique, sparse, lowercase): Optional user email.
  - `password` (`String`, select: false): Hashed bcrypt password.
  - `role` (`String`, enum: `['SUPER_ADMIN', 'VENDOR', 'USER']`, default: `'USER'`, indexed).
  - `isActive` (`Boolean`, default: `true`).
  - `lastLoginAt` (`Date`).
  - Timestamps (`createdAt`, `updatedAt`).

#### 2. Vendor Entity (`Vendor`)
* **Collection**: `vendors`
* **Fields**:
  - `userId` (`ObjectId` ref `'User'`, required, unique, indexed): Links to owner user account.
  - `firstName` (`String`, required, trimmed): Vendor owner first name.
  - `lastName` (`String`, optional, trimmed): Vendor owner last name.
  - `status` (`String`, enum: `['ACTIVE', 'INACTIVE', 'SUSPENDED']`, default: `'ACTIVE'`, indexed).
  - Timestamps (`createdAt`, `updatedAt`).

#### 3. Business Entity (`Business`)
* **Collection**: `businesses`
* **Fields**:
  - `vendorId` (`ObjectId` ref `'Vendor'`, required, unique, indexed): Enforces 1 Vendor = 1 Business model while preserving future flexibility.
  - `businessName` (`String`, required, trimmed, indexed).
  - `description` (`String`, optional).
  - `cuisineTypes` (`[String]`, default: `[]`, indexed).
  - `address` (`String`, optional).
  - `city` (`String`, optional, trimmed, indexed).
  - `state` (`String`, optional).
  - `pincode` (`String`, optional).
  - `location` (`{ type: 'Point', coordinates: [Number] }`).
  - `contactInformation` (`{ phone, email, website }`).
  - `capacity` (`{ minGuests, maxGuests }`).
  - `businessHours` (`[{ day, isOpen, openingTime, closingTime }]`).
  - `status` (`String`, enum: `['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']`, default: `'APPROVED'`, indexed).
  - `averageRating` (`Number`, default: `0`, min: `0`, max: `5`, indexed).
  - `totalReviews` (`Number`, default: `0`).
  - `coverImage` (`String`, optional).
  - `logo` (`String`, optional).
  - Timestamps (`createdAt`, `updatedAt`).

#### 4. Menu Entity (`Menu`)
* **Collection**: `menus`
* **Fields**:
  - `businessId` (`ObjectId` ref `'Business'`, required, indexed).
  - `name` (`String`, required, trimmed): E.g., "Grand Wedding Buffet".
  - `description` (`String`).
  - `category` (`String`).
  - `isActive` (`Boolean`, default: `true`, indexed).
  - Timestamps (`createdAt`, `updatedAt`).

#### 5. MenuItem Entity (`MenuItem`)
* **Collection**: `menuitems`
* **Fields**:
  - `menuId` (`ObjectId` ref `'Menu'`, required, indexed).
  - `businessId` (`ObjectId` ref `'Business'`, required, indexed).
  - `name` (`String`, required, trimmed).
  - `description` (`String`).
  - `category` (`String`, required, indexed): E.g., "Starters", "Main Course".
  - `price` (`Number`, required, min: 0).
  - `image` (`String`).
  - `isVegetarian` (`Boolean`, default: `true`).
  - `isAvailable` (`Boolean`, default: `true`, indexed).
  - Timestamps (`createdAt`, `updatedAt`).

#### 6. Review Entity (`Review`)
* **Collection**: `reviews`
* **Fields**:
  - `businessId` (`ObjectId` ref `'Business'`, required, indexed).
  - `userId` (`ObjectId` ref `'User'`, required, indexed).
  - `rating` (`Number`, required, min: 1, max: 5).
  - `comment` (`String`, maxlength: 1000).
  - `status` (`String`, enum: `['PUBLISHED', 'FLAGGED', 'HIDDEN']`, default: `'PUBLISHED'`, indexed).
  - Timestamps (`createdAt`, `updatedAt`).
* **Indexes**: Unique compound index on `{ businessId: 1, userId: 1 }`.

---

## 2. API Reference Documentation

### 2.5 Business Profile Module

* `GET /api/v1/businesses` - Browse & filter approved catering businesses (QueryParams: `city`, `cuisine`, `search`, `minCapacity`, `minRating`, `page`, `limit`).
* `GET /api/v1/businesses/my-business` - Retrieve logged-in vendor's business profile.
* `GET /api/v1/businesses/:id` - Retrieve business details by ID.
* `PUT /api/v1/businesses/my-business` - Update logged-in vendor's business details.
* `PATCH /api/v1/businesses/:id/status` - Super Admin update business approval status (`APPROVED`, `REJECTED`, `SUSPENDED`).

### 2.6 Menu & MenuItem Module

* `GET /api/v1/menus/business/:businessId` - Get public active menus for a business.
* `GET /api/v1/menus/:menuId` - Get menu details and its associated items.
* `POST /api/v1/menus` - Create a new menu package (Vendor).
* `PUT /api/v1/menus/:menuId` - Update a menu package (Vendor).
* `DELETE /api/v1/menus/:menuId` - Delete a menu package and its items (Vendor).
* `POST /api/v1/menus/:menuId/items` - Add a menu item to a menu package (Vendor).
* `PUT /api/v1/menus/items/:itemId` - Update a menu item (Vendor).
* `DELETE /api/v1/menus/items/:itemId` - Delete a menu item (Vendor).

### 2.7 Review & Rating Module

* `GET /api/v1/reviews/business/:businessId` - Get published customer reviews for a business.
* `POST /api/v1/reviews` - Submit a star rating (1-5) and comment for a business (Authenticated User).
* `PUT /api/v1/reviews/:reviewId` - Update your own review (Authenticated User).
* `DELETE /api/v1/reviews/:reviewId` - Delete review (User or Admin).

---

## 3. Complete API Summary Matrix

| Method | Endpoint Path | Auth Required | Role Authorization | Module | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | ❌ No | Public / Guest | Health | System Uptime & DB Health Check |
| `POST` | `/api/v1/auth/register/user` | ❌ No | Public | Auth | Register End User Account |
| `POST` | `/api/v1/auth/register/vendor` | ❌ No | Public | Auth | Register Vendor & Business Profile |
| `POST` | `/api/v1/auth/login/user` | ❌ No | Public | Auth | Login User Account |
| `POST` | `/api/v1/auth/login/vendor` | ❌ No | Public | Auth | Login Vendor Account |
| `POST` | `/api/v1/auth/login/admin` | ❌ No | Public | Auth | Login Super Admin Account |
| `GET` | `/api/v1/auth/me` | ✅ Yes | Any Authenticated | Auth | Get Active User Profile + Vendor & Business |
| `GET` | `/api/v1/businesses` | ❌ Optional | Public / Guest | Business | Search & Filter Catering Businesses |
| `GET` | `/api/v1/businesses/my-business` | ✅ Yes | `VENDOR` | Business | Get Vendor's Own Business Profile |
| `PUT` | `/api/v1/businesses/my-business` | ✅ Yes | `VENDOR` | Business | Update Vendor's Business Profile |
| `PATCH` | `/api/v1/businesses/:id/status` | ✅ Yes | `SUPER_ADMIN` | Business | Update Business Approval Status |
| `GET` | `/api/v1/menus/business/:businessId` | ❌ Optional | Public | Menu | Get Menus for a Business |
| `GET` | `/api/v1/menus/:menuId` | ❌ Optional | Public | Menu | Get Menu Details & Menu Items |
| `POST` | `/api/v1/menus` | ✅ Yes | `VENDOR` | Menu | Create New Menu Package |
| `PUT` | `/api/v1/menus/:menuId` | ✅ Yes | `VENDOR` | Menu | Update Menu Package |
| `DELETE` | `/api/v1/menus/:menuId` | ✅ Yes | `VENDOR` | Menu | Delete Menu Package |
| `POST` | `/api/v1/menus/:menuId/items` | ✅ Yes | `VENDOR` | Menu | Add Item to Menu Package |
| `PUT` | `/api/v1/menus/items/:itemId` | ✅ Yes | `VENDOR` | Menu | Update Menu Item |
| `DELETE` | `/api/v1/menus/items/:itemId` | ✅ Yes | `VENDOR` | Menu | Delete Menu Item |
| `GET` | `/api/v1/reviews/business/:businessId` | ❌ Optional | Public | Review | Get Reviews for a Business |
| `POST` | `/api/v1/reviews` | ✅ Yes | `USER`, `VENDOR`, `SUPER_ADMIN` | Review | Submit Review & Rating for Business |
| `PUT` | `/api/v1/reviews/:reviewId` | ✅ Yes | Review Author | Review | Update Review |
| `DELETE` | `/api/v1/reviews/:reviewId` | ✅ Yes | Author / `SUPER_ADMIN` | Review | Delete Review |
| `GET` | `/api/v1/admin/overview` | ✅ Yes | `SUPER_ADMIN` | Admin | Super Admin System Overview |
