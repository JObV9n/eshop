# Backend API - Vue Eshop

Express.js backend with Drizzle ORM, PostgreSQL, and JWT authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://postgres:password@localhost:5432/eshop_vue

# Generate Drizzle schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error middleware
│   ├── db/              # Database schema & connection
│   ├── utils/           # Helper functions
│   └── index.ts         # Main server file
├── drizzle/            # Migration files (generated)
├── .env                # Environment variables
└── package.json
```

## 🔑 Environment Variables

See `.env.example` for all required variables.

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh JWT token
- `GET /profile` - Get user profile (protected)
- `POST /logout` - Logout user (protected)

### Products (`/api/products`)
- `GET /` - Get all products (with filters & pagination)
- `GET /latest` - Get latest products
- `GET /featured` - Get featured products
- `GET /categories` - Get all categories
- `GET /slug/:slug` - Get product by slug
- `GET /:id` - Get product by ID
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

### Cart (`/api/cart`) - To be implemented
### Orders (`/api/orders`) - To be implemented
### Users (`/api/users`) - To be implemented
### Reviews (`/api/reviews`) - To be implemented

## 🔒 Authentication

JWT-based authentication. Include token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database

PostgreSQL 16 with Drizzle ORM.

### Available Commands:
- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema directly (dev only)
- `npm run db:studio` - Open Drizzle Studio GUI
- `npm run db:seed` - Seed database with sample data

## 🧪 Testing

```bash
# Test API health
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456","confirmPassword":"123456"}'
```

## 🛠️ Development

```bash
npm run dev  # Auto-reload on changes
```

Server runs on `http://localhost:5000`

## 📝 Notes

- TypeScript strict mode enabled
- All routes return JSON responses
- Error handling middleware included
- CORS configured for frontend

## ✅ Completed Features

- [x] JWT Authentication
- [x] User registration & login
- [x] Product CRUD operations
- [x] Database schema & migrations
- [ ] Cart management
- [ ] Order processing
- [ ] User profile management
- [ ] Review system
- [ ] Email notifications
- [ ] Payment integration

## 🔜 Next Steps

1. Implement remaining controllers (Cart, Orders, Users, Reviews)
2. Add email service for order confirmations
3. Integrate payment providers (PayPal, Stripe)
4. Add comprehensive error handling
5. Implement rate limiting
6. Add API documentation (Swagger)
7. Write unit & integration tests
