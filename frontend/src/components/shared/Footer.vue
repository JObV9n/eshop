<template>
  <footer class="border-t bg-background mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div>
          <h3 class="font-bold text-lg mb-4">Eshop</h3>
          <p class="text-sm text-muted-foreground">
            Your one-stop shop for quality products at great prices.
          </p>
        </div>

        <!-- Shop -->
        <div>
          <h3 class="font-bold text-lg mb-4">Shop</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/search" class="text-muted-foreground hover:text-primary">
                All Products
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/search?category=Men's Dress Shirts" class="text-muted-foreground hover:text-primary">
                Dress Shirts
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/search?category=Men's Sweatshirts" class="text-muted-foreground hover:text-primary">
                Sweatshirts
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h3 class="font-bold text-lg mb-4">Customer Service</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="text-muted-foreground hover:text-primary">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" class="text-muted-foreground hover:text-primary">
                Shipping Info
              </a>
            </li>
            <li>
              <a href="#" class="text-muted-foreground hover:text-primary">
                Returns
              </a>
            </li>
          </ul>
        </div>

        <!-- Account -->
        <div>
          <h3 class="font-bold text-lg mb-4">Account</h3>
          <ul class="space-y-2 text-sm">
            <li v-if="authStore.isAuthenticated">
              <RouterLink to="/user/profile" class="text-muted-foreground hover:text-primary">
                My Profile
              </RouterLink>
            </li>
            <li v-if="authStore.isAuthenticated">
              <RouterLink to="/user/orders" class="text-muted-foreground hover:text-primary">
                Order History
              </RouterLink>
            </li>
            <li v-else>
              <RouterLink to="/sign-in" class="text-muted-foreground hover:text-primary">
                Sign In
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {{ new Date().getFullYear() }} Eshop. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
