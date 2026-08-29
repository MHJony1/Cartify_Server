# Cartify Backend Technical Documentation

## 1. Project Overview
Cartify is a highly modular, scalable e-commerce backend built with Node.js, Express, TypeScript, and Prisma ORM. It provides a complete RESTful API suite for managing the entire e-commerce lifecycle, from user registration and product catalogs to cart management, checkout, payments, and notifications.

## 2. Architecture & Folder Structure
The application uses a **Feature-Module Architecture**. Each domain entity (User, Product, Order) has its own encapsulated directory inside `src/app/modules/`.

```
src/
├── app/
│   ├── modules/          # Business domains
│   │   ├── addresses/    # User address management
│   │   ├── admin/        # Admin dashboard APIs
│   │   ├── carts/        # Shopping cart logic
│   │   ├── categories/   # Product taxonomy
│   │   ├── coupons/      # Discount system
│   │   ├── inventory/    # Stock transactions
│   │   ├── notifications/# User alerts
│   │   ├── orders/       # Checkout & fulfillment
│   │   ├── payments/     # Transactions
│   │   ├── products/     # Product catalog
│   │   ├── reviews/      # Product feedback
│   │   ├── users/        # Auth and profiles
│   │   └── wishlist/     # Saved items
│   ├── middleware/       # Shared Express middlewares
│   ├── routes/           # Central API router
│   ├── lib/              # Shared libraries
│   ├── errors/           # Custom error classes
│   ├── utils/            # Helper functions
│   └── docs/             # Swagger definitions
├── generated/            # Custom Prisma client output
├── app.ts                # Express setup and configuration
└── server.ts             # Application entry point
```

## 3. Request Lifecycle
1. **Client** initiates an HTTP request.
2. **Express Router** (`routes/index.ts`) matches the path.
3. **Global Middlewares** apply CORS, Helmet, Rate Limiting, and Payload constraints.
4. **Route-Specific Middleware**:
   - `auth`: Verifies JWT and injects `req.user`.
   - `authorize(Role)`: Verifies user role (USER or ADMIN).
   - `validateRequest`: Validates `req.body` against a Zod schema.
5. **Controller**: Extracts data, calls the Service.
6. **Service**: Contains business logic, interacts with Prisma.
7. **Prisma**: Executes queries on PostgreSQL.
8. **Response**: Data returned to client, or errors caught by `globalErrorHandler`.

## 4. Database Architecture (Prisma)
The database schema is split into multiple files inside `prisma/schema/` for maintainability.
- **User**: One-to-many with Orders, Reviews, CartItems, Addresses.
- **Product**: Belongs to a Category. Has many OrderItems, CartItems, Reviews, InventoryTransactions.
- **Order**: Has many OrderItems. Has optional Coupon relation. Has many Payments.
- **InventoryTransaction**: Tracks exact history of stock changes (PURCHASE, SALE, RETURN, DAMAGE).

## 5. Core Flows

### 5.1. Authentication Flow
- User registers (`/auth/register`). Password hashed with bcrypt.
- User logs in (`/auth/login`). Server generates a JWT.
- Client passes JWT in `Authorization: Bearer <token>`.

### 5.2. Order & Checkout Flow
- User adds items to Cart (`/carts`).
- User applies optional Coupon.
- User creates Order (`POST /orders`).
- **Transaction Safety**: The system initiates a database transaction. It verifies stock, calculates exact totals, validates the coupon usage limits, decrements stock atomically, and creates the `Order` and `OrderItem` records.

### 5.3. Inventory Flow
Instead of just updating a number, the system utilizes `InventoryTransaction` to maintain an immutable ledger of stock changes (RESTOCK, DAMAGE, SALE).

## 6. Security Architecture
- **Rate Limiting**: `express-rate-limit` prevents brute-force.
- **CORS**: Restricts API access to authorized frontend domains.
- **Payload Protection**: Express JSON limit set to `10kb` to prevent memory exhaustion.
- **Error Handling**: `globalErrorHandler` catches all exceptions. In production, sensitive error stacks are stripped out.

## 7. Pagination, Search, and Filtering
Modules like Products and Orders support advanced querying via URL parameters:
- `?page=1&limit=10`
- `?search=keyword`
- `?categoryId=uuid`

## 8. Swagger / OpenAPI Documentation
The entire API surface is documented in `src/app/docs/swagger.json`.
Access the interactive UI by navigating to `/api-docs` when the server is running.

## 9. Production Checklist
- [x] Configure CORS (`CLIENT_URL`).
- [x] Set robust JWT Secret (`JWT_SECRET`).
- [x] Ensure PostgreSQL is highly available (e.g., Neon DB).
- [x] Use a process manager (PM2 or Docker) for deployment.

## 10. API Endpoint Reference

### Auth & Users
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout

### Products & Categories
- `GET /api/v1/products` - List products
- `GET /api/v1/categories` - List categories
- `POST /api/v1/products` - Create product (ADMIN)

### Cart & Orders
- `GET /api/v1/carts` - View cart
- `POST /api/v1/carts` - Add to cart
- `POST /api/v1/orders` - Checkout
- `GET /api/v1/orders/my-orders` - User order history

### Payments
- `POST /api/v1/payments/create` - Init payment
- `GET /api/v1/payments/my-payments` - User payments

### Admin & Inventory
- `GET /api/v1/admin/*` - Admin dashboard stats
- `GET /api/v1/inventory` - View stock ledgers
