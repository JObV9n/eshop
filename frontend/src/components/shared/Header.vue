<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center space-x-2">
        <span class="text-xl font-bold">Eshop</span> <!--Store Name-->
      </RouterLink>

      <!-- Search Bar (Desktop) -->
      <div class="hidden md:flex flex-1 max-w-md mx-8">
        <form @submit.prevent="handleSearch" class="w-full">
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search products..."
            class="w-full"
          />
        </form>
      </div>

      <!-- Navigation -->
      <nav class="flex items-center space-x-4">
        <!-- Cart -->
        <RouterLink
          to="/cart"
          class="relative flex items-center space-x-1 hover:text-primary"
        >
          <ShoppingCart :size="24" />
          <Badge v-if="cartItemCount > 0" variant="destructive" class="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {{ cartItemCount }}
          </Badge>
        </RouterLink>

        <!-- User Menu -->
        <div v-if="authStore.isAuthenticated" class="flex items-center space-x-2">
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin/overview"
            class="hover:text-primary"
          >
            Admin
          </RouterLink>
          <RouterLink to="/user/orders" class="hover:text-primary">
            Orders
          </RouterLink>
          <Button @click="handleLogout" variant="ghost" size="sm">
            Logout
          </Button>
        </div>

        <!-- Auth Links -->
        <div v-else class="flex items-center space-x-2">
          <RouterLink to="/sign-in">
            <Button variant="ghost" size="sm">Sign In</Button>
          </RouterLink>
          <RouterLink to="/sign-up">
            <Button size="sm">Sign Up</Button>
          </RouterLink>
        </div>
      </nav>
    </div>

    <!-- Mobile Search -->
    <div class="md:hidden px-4 pb-3">
      <form @submit.prevent="handleSearch" class="w-full">
        <Input
          v-model="searchQuery"
          type="search"
          placeholder="Search products..."
          class="w-full"
        />
      </form>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = ref('')

// Ensure itemCount is reactive
const cartItemCount = computed(() => cartStore.itemCount)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } })
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>
