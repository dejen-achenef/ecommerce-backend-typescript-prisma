# E-Commerce Backend API

A robust Node.js/TypeScript backend API for an e-commerce platform built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Product Management**: CRUD operations for products (Admin only)
- **Order Management**: Create and view orders with transaction support
- **Search & Pagination**: Product search and paginated listings
- **Role-Based Access Control**: Admin and User roles with proper authorization

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Custom input validators

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecommerce_backend_prisma
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
BCRYPT_ROUNDS=12
```

**Important**: Replace the `DATABASE_URL` with your actual PostgreSQL connection string and set a strong `JWT_SECRET` for production.

### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- Username: Alphanumeric only (3-50 characters), must be unique
- Email: Valid email format, must be unique
- Password: Minimum 8 characters, must include:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "object": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "User",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "errors": null
}
```

#### POST `/auth/login`
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "object": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "User"
    }
  },
  "errors": null
}
```

### Products

#### GET `/products`
Get paginated list of products (Public).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` or `pageSize` (optional): Items per page (default: 10)
- `search` (optional): Search term for product name (case-insensitive)
- `category` (optional): Filter by category

**Example:**
```
GET /products?page=1&limit=10&search=laptop
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "object": [
    {
      "id": "uuid",
      "name": "Laptop",
      "price": 999.99,
      "stock": 50,
      "category": "Electronics",
      "description": "High-performance laptop"
    }
  ],
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 5,
  "totalProducts": 50,
  "errors": null
}
```

#### GET `/products/:id`
Get product details by ID (Public).

#### POST `/products`
Create a new product (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description (min 10 characters)",
  "price": 99.99,
  "stock": 100,
  "category": "Category Name"
}
```

#### PUT `/products/:id`
Update an existing product (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 149.99,
  "stock": 75,
  "category": "New Category"
}
```

#### DELETE `/products/:id`
Delete a product (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Orders

#### POST `/orders`
Place a new order (Authenticated users only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "products": [
    {
      "productId": "uuid",
      "quantity": 2
    },
    {
      "productId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "object": {
    "order_id": "uuid",
    "status": "pending",
    "total_price": 1999.98,
    "created_at": "2024-01-01T00:00:00.000Z",
    "products": [
      {
        "productId": "uuid",
        "quantity": 2,
        "product": {
          "id": "uuid",
          "name": "Product Name",
          "price": 999.99,
          "description": "Product description"
        }
      }
    ]
  },
  "errors": null
}
```

#### GET `/orders`
Get order history for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "object": [
    {
      "order_id": "uuid",
      "status": "pending",
      "total_price": 1999.98,
      "created_at": "2024-01-01T00:00:00.000Z",
      "products": [...]
    }
  ],
  "errors": null
}
```

## Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "object": { ... },
  "errors": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error detail 1", "Error detail 2"]
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "object": [...],
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 5,
  "totalProducts": 50,
  "errors": null
}
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **User**: Default role for registered users. Can place orders and view their own orders.
- **Admin**: Can create, update, and delete products. Must be set manually in the database.

To create an admin user, update the `role` field in the database:
```sql
UPDATE "User" SET role = 'Admin' WHERE email = 'admin@example.com';
```

## Database Schema

### User
- `id`: UUID (Primary Key)
- `username`: String (Unique)
- `email`: String (Unique)
- `password`: String (Hashed)
- `role`: String (Default: "User")
- `createdAt`: DateTime

### Product
- `id`: UUID (Primary Key)
- `name`: String
- `description`: String
- `price`: Float
- `stock`: Integer
- `category`: String (Nullable)
- `userId`: UUID (Foreign Key)

### Order
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `description`: String
- `totalPrice`: Float
- `status`: String
- `createdAt`: DateTime

### OrderProducts
- `id`: UUID (Primary Key)
- `orderId`: UUID (Foreign Key)
- `productId`: UUID (Foreign Key)
- `quantity`: Integer
- `totalPrice`: Float

## Error Handling

The API uses consistent HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (Validation errors)
- `401`: Unauthorized (Authentication required)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found
- `409`: Conflict (Duplicate entry)
- `500`: Internal Server Error
- `503`: Service Unavailable (Database connection issues)

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run prisma:generate`: Generate Prisma Client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio (Database GUI)

### Project Structure

```
ecommerce_backend_prisma/
├── config/
│   └── env.ts              # Environment configuration
├── controllers/
│   ├── authControllers.ts  # Authentication controllers
│   ├── controllers.ts      # User registration
│   ├── orderControllers.ts # Order management
│   └── productControllers.ts # Product management
├── functions/
│   ├── errorHandler.ts     # Error handling utilities
│   ├── jwt.ts              # JWT token utilities
│   └── utils.ts            # General utilities
├── middlewares/
│   ├── authMiddleware.ts   # Authentication & authorization
│   ├── loggingMiddleware.ts # Request logging
│   └── rateLimitMiddleware.ts # Rate limiting
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── routes/
│   └── routes.ts           # API routes
├── types/
│   └── index.ts            # TypeScript type definitions
├── validators/
│   └── inputValidators.ts # Input validation functions
├── server.ts              # Application entry point
└── package.json           # Dependencies and scripts
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection protection (via Prisma ORM)
- Transaction support for order creation

## Testing

To test the API, you can use tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- REST Client extensions

### Example cURL Commands

**Register User:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

**Get Products:**
```bash
curl http://localhost:3000/products?page=1&limit=10
```

**Create Product (Admin):**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"name":"New Product","description":"Product description here","price":99.99,"stock":100,"category":"Electronics"}'
```

## License

This project is created for educational purposes.

## Author

E-Commerce Backend API - Node.js/TypeScript Implementation

