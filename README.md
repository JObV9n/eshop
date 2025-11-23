# Vue eshop

A modern, full-stack ecommerce application built with Vue.js 3, Express.js, and PostgreSQL.

## 🎯 Project Overview

This is a Vue.js counterpart of the Next.js eshop application, featuring:

- **Frontend**: Vue 3 (Composition API), Vite, TypeScript, Pinia, shadcn-vue
- **Backend**: Express.js, TypeScript, Drizzle ORM, JWT Authentication
- **Database**: PostgreSQL 16

## 📁 Monorepo Structure

```
vue-eshop/
├── frontend/          # Vue.js application
├── backend/           # Express.js API server
├── shared/            # Shared types, constants, validators
└── package.json       # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm 10+

### Installation

```bash
# Install dependencies for all workspaces
npm install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your database URL in backend/.env
# DATABASE_URL=postgresql://postgres:password@localhost:5432/eshop_vue
```

### Database Setup

```bash
# Generate Drizzle schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:backend  # Backend: http://localhost:5000
npm run dev:frontend # Frontend: http://localhost:5173
```

### Build for Production

```bash
# Build all workspaces
npm run build

# Start production server
npm start
```

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./backend/API.md)
- [Migration Guide](./MIGRATION.md)

## 🛠️ Tech Stack

### Frontend
- Vue 3 (Composition API with `<script setup>`)
- Vite 5
- TypeScript
- Vue Router 4
- Pinia (State Management)
- shadcn-vue (UI Components)
- TailwindCSS
- vee-validate + Zod
- Axios

### Backend
- Express.js 4
- TypeScript
- Drizzle ORM
- PostgreSQL 16
- JWT Authentication
- Zod Validation
<!-- - Nodemailer  -->

## 🎨 Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ Product Browsing & Search
- ✅ Shopping Cart
- ✅ Order Management
- ✅ User Profile
- ✅ Admin Dashboard
- ✅ Product Reviews
- ✅ Payment Integration (PayPal, Stripe)
- ✅ Email Notifications
- ✅ Responsive Design
- ✅ Dark/Light Mode

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend & backend concurrently |
| `npm run build` | Build all workspaces |
| `npm run db:generate` | Generate Drizzle schema |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run lint` | Lint all workspaces |

## 🔧 Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.

## 📄 License

MIT

