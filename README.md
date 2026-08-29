# Cartify — E-commerce Backend API

Cartify is a scalable, modular e-commerce backend API built with Express.js, TypeScript, Prisma, and PostgreSQL. It provides a robust foundation for e-commerce applications, featuring authentication, product management, shopping cart, wishlist, orders, payments, reviews, coupons, notifications, and administrative capabilities.

## 2. PROJECT OVERVIEW
Cartify serves as the central data and business logic layer for a modern e-commerce storefront. It handles complex workflows like cart management, atomic stock decrement, payment verification, and order processing. The API is designed to be consumed by frontend applications (React, Next.js, mobile apps). It enforces strict role-based access control, separating USER (shopping, ordering, profile management) and ADMIN (inventory, categories, order fulfillment, oversight) responsibilities.

## 3. KEY FEATURES
- **Authentication & Authorization**: JWT-based auth, secure login/registration, role-based (USER/ADMIN) route protection.
- **User Management**: Profile management, address book.
- **Product Management**: Full CRUD for products, inventory transactions (restock, damage, purchase, sale).
- **Category Management**: Organized product hierarchy.
- **Cart & Wishlist**: Manage items, calculate totals, store favorite products.
- **Order Management**: Checkout workflow, status tracking (PENDING to DELIVERED).
- **Coupon System**: Percentage/fixed discounts, usage limits, validation.
- **Payment**: Payment processing, transaction tracking, status updates.
- **Reviews**: Product rating and comments.
- **Notifications**: In-app user notifications (read/unread tracking).
- **Security**: Rate limiting, Helmet, payload limits, CORS, secure error handling.
- **API Documentation**: Interactive Swagger/OpenAPI UI.

## 4. TECHNOLOGY STACK
| Technology | Purpose |
|---|---|
| **Node.js & Express.js** | Core runtime and web server framework |
| **TypeScript** | Static typing and enhanced developer experience |
| **Prisma ORM** | Type-safe database interactions and schema management |
| **PostgreSQL** | Primary relational database |
| **JWT (jsonwebtoken)** | Secure, stateless user authentication |
| **Bcryptjs** | Password hashing |
| **Swagger UI** | API documentation interface |
| **Helmet & CORS** | HTTP security headers and cross-origin resource sharing |
| **express-rate-limit** | Brute-force protection |
| **Morgan & Compression** | Request logging and payload compression |

## 5. ARCHITECTURE
The project follows a feature-based modular architecture. Each domain (e.g., users, products) encapsulates its own routes, controllers, and validation logic.

```
src/
├── app/
│   ├── modules/
│   │   ├── addresses/
│   │   ├── admin/
│   │   ├── carts/
│   │   ├── categories/
│   │   ├── coupons/
│   │   ├── inventory/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── products/
│   │   ├── reviews/
│   │   ├── users/
│   │   └── wishlist/
│   ├── middleware/ (auth, validation, global error handler)
│   ├── routes/     (central route registry)
│   └── docs/       (Swagger JSON)
├── generated/      (Prisma generated client)
├── server.ts       (Server entry point)
└── app.ts          (Express app setup)
```

**Request Flow:**
Client -> Route -> Middleware (Auth/Validation) -> Controller -> Prisma -> PostgreSQL -> Response

## 6. MODULE OVERVIEW
| Module | Responsibility | Access |
|---|---|---|
| **Auth/Users** | Registration, login, profile management | Public / USER |
| **Categories** | Product categorization | Public (Read) / ADMIN (Write) |
| **Products** | Product catalog | Public (Read) / ADMIN (Write) |
| **Inventory** | Stock adjustments and history | ADMIN |
| **Cart** | Shopping cart state | USER |
| **Wishlist** | Saved products | USER |
| **Address** | Shipping addresses | USER |
| **Coupons** | Discount codes | USER (Apply) / ADMIN (Manage) |
| **Orders** | Checkout and fulfillment | USER (Create/View) / ADMIN (Manage) |
| **Payments** | Transactions | USER (Create/View) / ADMIN (Manage) |
| **Reviews** | Ratings and feedback | USER (Write) / Public (Read) |
| **Notifications** | Alerts | USER |
| **Admin** | Dashboard and metrics | ADMIN |

## 7. AUTHENTICATION & AUTHORIZATION
Authentication uses JWT (JSON Web Tokens). Passwords are hashed using bcrypt.
- **Login/Register**: Returns an access token and user object (excluding password).
- **Protection**: The `auth` middleware verifies the JWT signature and extracts the user identity.
- **Roles**: The `authorize(Role)` middleware restricts access (e.g., only `ADMIN` can delete products).

## 8. SECURITY
- **Helmet**: Sets secure HTTP headers.
- **Rate Limiting**: Protects against DDoS and brute-force (100 reqs/15m).
- **Payload Limits**: Request bodies restricted to `10kb`.
- **CORS**: Configured to restrict origins based on `CLIENT_URL`.
- **Error Handling**: Custom error handler masks internal server details in production.

## 9. DATABASE
PostgreSQL managed via Prisma. The schema is split modularly (`prisma/schema/*.prisma`).
**Key Models:**
- `User`, `Address`
- `Category`, `Product`, `InventoryTransaction`
- `CartItem`, `WishlistItem`
- `Order`, `OrderItem`, `Coupon`, `CouponUsage`
- `Payment`, `Review`, `Notification`

## 10. ORDER & TRANSACTION SAFETY
Order creation is transactional. The system calculates totals, verifies product stock, applies coupons (verifying `usageLimit` and `perUserLimit`), and decrements inventory atomically. This prevents overselling during concurrent checkout attempts.

## 11. PAYMENT
Payments are linked to Orders. The workflow involves:
1. User creates a payment intent.
2. Payment status transitions (`PENDING` -> `PAID` / `COMPLETED`).
3. Order payment status syncs automatically.

## 12. API BASE URL
All API routes are prefixed with:
`/api/v1`

## 13. SWAGGER / API DOCUMENTATION
Interactive API documentation is available via Swagger.
Endpoint: `GET /api-docs`
It covers all modules, request schemas, and authentication requirements.

## 14. ENVIRONMENT VARIABLES
| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port (default 5000) | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token expiration (e.g., 7d) | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No |

## 15. INSTALLATION & SETUP
```bash
# 1. Clone the repository
git clone <repo-url>
cd Cartify-Server

# 2. Install dependencies
pnpm install

# 3. Environment configuration
cp .env.example .env
# Fill in the .env variables

# 4. Database Setup
pnpm prisma:generate
pnpm prisma:push

# 5. Start Development Server
pnpm run dev
```

## 16. RUNNING THE PROJECT
- **Development**: `pnpm run dev`
- **Build**: `pnpm run build`
- **Production**: `pnpm run start`

## 17. POSTMAN TESTING STRATEGY
1. Create a User via `/api/v1/auth/register`.
2. Login via `/api/v1/auth/login` to get the `accessToken`.
3. Set the token as a `Bearer Token` in Postman.
4. Create a category and product (Requires ADMIN role).
5. Add product to cart `/api/v1/carts`.
6. Create an order `/api/v1/orders`.
7. Pay for the order `/api/v1/payments/create`.

## 18. PROJECT STATUS
**Frontend Integration Ready**
The backend API is complete, hardened for production, and ready to be consumed by any modern frontend application.

## 19. FUTURE SCALING (Future Improvements)
- Redis caching for product catalogs.
- Background job queue (e.g., BullMQ) for email processing.
- Object storage (AWS S3) for image uploads.
- Dedicated search engine (Elasticsearch).
