<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Shopping Cart</h1>

      <!-- Loading State -->
      <div v-if="cartStore.loading" class="text-center py-12">
        <Spinner class="mx-auto" />
        <p class="text-muted-foreground mt-4">Loading cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!cartStore.cart || cartStore.isEmpty" class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p class="text-muted-foreground mb-6">Add some products to get started</p>
        <Button @click="$router.push('/search')">
          Continue Shopping
        </Button>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-4">
          <Card v-for="item in cartStore.cart.items" :key="item.productId">
            <div class="flex gap-4 p-4">
              <!-- Product Image -->
              <img
                :src="item.image"
                :alt="item.name"
                class="w-24 h-24 object-cover rounded"
              />

              <!-- Product Details -->
              <div class="flex-1">
                <RouterLink
                  :to="`/product/${item.slug}`"
                  class="font-semibold hover:text-primary"
                >
                  {{ item.name }}
                </RouterLink>
                <p class="text-lg font-bold text-primary mt-1">
                  ${{ item.price }}
                </p>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="updateQuantity(item.productId, item.qty - 1)"
                    :disabled="item.qty <= 1 || updating"
                  >
                    -
                  </Button>
                  <span class="w-12 text-center">{{ item.qty }}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="updateQuantity(item.productId, item.qty + 1)"
                    :disabled="updating"
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    @click="removeItem(item.productId)"
                    :disabled="updating"
                    class="ml-auto"
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <!-- Item Total -->
              <div class="text-right">
                <p class="font-semibold">
                  ${{ (Number(item.price) * item.qty).toFixed(2) }}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <Card class="p-6 sticky top-20">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>
            
            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Items ({{ cartStore.itemCount }})</span>
                <span>${{ cartStore.cart.itemsPrice }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span>${{ cartStore.cart.shippingPrice }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax</span>
                <span>${{ cartStore.cart.taxPrice }}</span>
              </div>
              <div class="border-t pt-2 mt-2">
                <div class="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${{ cartStore.cart.totalPrice }}</span>
                </div>
              </div>
            </div>

            <!-- Checkout Button -->
            <div v-if="!authStore.isAuthenticated" class="space-y-3">
              <p class="text-sm text-muted-foreground text-center">
                Please sign in to continue
              </p>
              <Button
                class="w-full"
                @click="$router.push({ name: 'sign-in', query: { redirect: '/cart' } })"
              >
                Sign In to Checkout
              </Button>
              <Button
                class="w-full"
                variant="outline"
                @click="$router.push({ name: 'sign-up', query: { redirect: '/cart' } })"
              >
                Create Account
              </Button>
            </div>

            <Button
              v-else
              class="w-full"
              @click="proceedToCheckout"
              :disabled="cartStore.isEmpty"
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outline"
              class="w-full mt-3"
              @click="$router.push('/search')"
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Spinner from '@/components/ui/Spinner.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const updating = ref(false)

const updateQuantity = async (productId: string, qty: number) => {
  if (qty < 1) return
  
  updating.value = true
  try {
    await cartStore.updateItem(productId, qty, authStore.isAuthenticated)
    showToast('success', 'Cart updated')
  } catch (err: any) {
    showToast('error', err.response?.data?.message || 'Failed to update cart')
  } finally {
    updating.value = false
  }
}

const removeItem = async (productId: string) => {
  updating.value = true
  try {
    await cartStore.removeItem(productId, authStore.isAuthenticated)
    showToast('success', 'Item removed from cart')
  } catch (err: any) {
    showToast('error', err.response?.data?.message || 'Failed to remove item')
  } finally {
    updating.value = false
  }
}

const proceedToCheckout = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'sign-in', query: { redirect: '/shipping-address' } })
    return
  }
  router.push('/shipping-address')
}
</script>
