import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/pages/Search.vue'),
  },
  {
    path: '/product/:slug',
    name: 'product-detail',
    component: () => import('@/pages/ProductDetail.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/pages/Cart.vue'),
  },
  // Auth routes
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/pages/auth/SignIn.vue'),
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('@/pages/auth/SignUp.vue'),
  },
  // User routes
  {
    path: '/user',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'profile',
        name: 'user-profile',
        component: () => import('@/pages/user/Profile.vue'),
      },
      {
        path: 'orders',
        name: 'user-orders',
        component: () => import('@/pages/user/Orders.vue'),
      },
      {
        path: 'orders/:id',
        name: 'user-order-detail',
        component: () => import('@/pages/user/OrderDetail.vue'),
      },
    ],
  },
  {
    path: '/shipping-address',
    name: 'shipping-address',
    meta: { requiresAuth: true },
    component: () => import('@/pages/ShippingAddress.vue'),
  },
  {
    path: '/payment-method',
    name: 'payment-method',
    meta: { requiresAuth: true },
    component: () => import('@/pages/PaymentMethod.vue'),
  },
  {
    path: '/place-order',
    name: 'place-order',
    meta: { requiresAuth: true },
    component: () => import('@/pages/PlaceOrder.vue'),
  },
  // Admin routes
  {
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'overview',
        name: 'admin-overview',
        component: () => import('@/pages/admin/Overview.vue'),
      },
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('@/pages/admin/Products.vue'),
      },
      {
        path: 'products/create',
        name: 'admin-product-create',
        component: () => import('@/pages/admin/ProductForm.vue'),
      },
      {
        path: 'products/:id/edit',
        name: 'admin-product-edit',
        component: () => import('@/pages/admin/ProductForm.vue'),
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/pages/admin/Orders.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/admin/Users.vue'),
      },
    ],
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'sign-in', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'home' })
  } else {
    next()
  }
})

// Import auth store (will be defined after we create it)
import { useAuthStore } from '@/stores/auth'

export default router
