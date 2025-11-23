# Vue eshop Frontend

Modern e-commerce frontend built with Vue 3, TypeScript, and Vite.

## 🚀 Tech Stack

- **Vue 3.5+** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite 7.2.4** - Next-generation frontend tooling
- **Vue Router 4** - Official routing library with navigation guards
- **Pinia** - Intuitive state management
- **TailwindCSS 3** - Utility-first CSS framework
- **Radix Vue** - Headless UI components
- **Lucide Vue** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **CVA** - Class Variance Authority for component variants

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/          # Global styles and assets
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   ├── Input.vue
│   │   │   ├── Dialog.vue
│   │   │   ├── Toast.vue
│   │   │   └── ...
│   │   ├── shared/      # Shared components
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   └── ProductCard.vue
│   │   └── layouts/     # Layout components
│   │       └── MainLayout.vue
│   ├── composables/     # Reusable composition functions
│   │   └── useToast.ts
│   ├── lib/             # Utility functions
│   │   └── utils.ts
│   ├── pages/           # Page components
│   │   ├── Home.vue
│   │   ├── Search.vue
│   │   ├── ProductDetail.vue
│   │   ├── Cart.vue
│   │   ├── auth/        # Authentication pages
│   │   ├── user/        # User pages
│   │   └── admin/       # Admin pages
│   ├── router/          # Vue Router configuration
│   │   └── index.ts
│   ├── stores/          # Pinia stores
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── products.ts
│   │   └── orders.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Static assets
├── .env                 # Environment variables
└── package.json
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Component Library

### UI Components

All UI components are built with TailwindCSS and support dark mode:

- **Button** - Primary action component with variants (default, destructive, outline, secondary, ghost, link)
- **Card** - Content container with header, content, and footer slots
- **Input** - Form input with label support
- **Label** - Form label component
- **Badge** - Status indicator with color variants
- **Table** - Data table component
- **Select** - Dropdown selection
- **Textarea** - Multi-line text input
- **Dialog** - Modal dialog with overlay
- **Dropdown** - Dropdown menu with positioning
- **Toast** - Notification system with variants (success, error, warning, info)
- **Spinner** - Loading indicator with sizes

### Shared Components

- **Header** - Main navigation with search, cart badge, and auth menu
- **Footer** - Site footer with links and information
- **ProductCard** - Product display card with image, rating, price, and stock status
- **MainLayout** - Page layout wrapper with header and footer

## 🔐 Authentication

The app uses JWT-based authentication with automatic token refresh:

```typescript
// Login
await authStore.login(email, password)

// Logout
await authStore.logout()

// Check authentication
if (authStore.isAuthenticated) {
  // User is logged in
}

// Check admin role
if (authStore.isAdmin) {
  // User is an admin
}
```

## 🛒 Shopping Cart

Cart state is managed globally with Pinia:

```typescript
// Add item to cart
await cartStore.addItem(productId, quantity)

// Update item quantity
await cartStore.updateItem(itemId, newQuantity)

// Remove item
await cartStore.removeItem(itemId)

// Get cart item count
const count = cartStore.itemCount
```

## 🗂️ State Management

The app uses Pinia stores for global state:

- **authStore** - User authentication and profile
- **cartStore** - Shopping cart management
- **productStore** - Product catalog and search
- **orderStore** - Order history and management

## 🎯 Routing

Protected routes require authentication:

```typescript
// Public routes
/ - Home page
/search - Product search and filtering
/product/:slug - Product details
/cart - Shopping cart

// Auth routes (redirects if authenticated)
/auth/sign-in - Login
/auth/sign-up - Registration

// User routes (requires authentication)
/user/profile - User profile
/user/orders - Order history
/user/orders/:id - Order details
/shipping-address - Shipping form
/payment-method - Payment selection
/place-order - Order review and placement

// Admin routes (requires admin role)
/admin/overview - Dashboard
/admin/products - Product management
/admin/products/:id/edit - Edit product
/admin/orders - Order management
/admin/users - User management
```

## 🎨 Theming

The app supports light and dark modes using TailwindCSS:

- Theme colors are defined in `tailwind.config.js`
- Dark mode is enabled via `class` strategy
- CSS variables are used for consistent theming

## 📦 API Integration

All API calls are centralized in Pinia stores using Axios:

```typescript
// Example: Fetch products with filters
const result = await productStore.fetchProducts({
  page: 1,
  limit: 12,
  category: 'Electronics',
  minPrice: 100,
  maxPrice: 1000,
  sortBy: 'price',
  sortOrder: 'asc'
})
```

## 🧪 Testing

Testing is not yet implemented. TODO:
- Unit tests with Vitest
- Component tests with Vue Test Utils
- E2E tests with Playwright

## 🚢 Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your hosting provider:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📚 Key Features

### Public Features
- ✅ Product browsing with search and filters
- ✅ Product details with image gallery
- ✅ Add to cart with quantity selection
- ✅ Shopping cart management
- ✅ Responsive design for mobile/tablet/desktop

### User Features
- ✅ User registration and login
- ✅ Profile management with password change
- ✅ Order history and tracking
- ✅ Checkout flow (shipping, payment, review)
- ✅ Order placement

### Admin Features
- ✅ Dashboard with statistics
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ User management
- ✅ Role-based access control

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details
