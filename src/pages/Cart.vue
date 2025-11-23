<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-muted-foreground">Loading cart...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-destructive">{{ error }}</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartStore.isEmpty" class="text-center py-12">
        <ShoppingCart class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 class="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p class="text-muted-foreground mb-6">Add some products to get started!</p>
        <RouterLink to="/search">
          <Button>Continue Shopping</Button>
        </RouterLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-4">
          <Card
            v-for="item in cartStore.cart.items"
            :key="item.id"
            class="p-4"
          >
            <div class="flex gap-4">
              <!-- Product Image -->
              <div class="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img
                  :src="item.product?.images?.[0] || '/images/placeholder.jpg'"
                  :alt="item.product?.name"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- Product Info -->
              <div class="flex-1">
                <RouterLink
                  :to="`/product/${item.product?.slug}`"
                  class="text-lg font-semibold hover:underline"
                >
                  {{ item.product?.name }}
                </RouterLink>
                <p class="text-sm text-muted-foreground mb-2">
                  {{ item.product?.brand }}
                </p>
                <p class="text-lg font-bold">
                  ${{ formatCurrency(item.product?.price || 0) }}
                </p>
              </div>

              <!-- Quantity Controls -->
              <div class="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleRemoveItem(item.id)"
                  class="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>

                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleUpdateQuantity(item.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                  >
                    -
                  </Button>
                  <span class="w-12 text-center font-semibold">
                    {{ item.quantity }}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleUpdateQuantity(item.id, item.quantity + 1)"
                    :disabled="item.quantity >= (item.product?.countInStock || 0)"
                  >
                    +
                  </Button>
                </div>

                <p class="text-sm font-semibold">
                  Subtotal: ${{ formatCurrency((item.product?.price || 0) * item.quantity) }}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <Card class="p-6 sticky top-4">
            <h2 class="text-2xl font-bold mb-4">Order Summary</h2>

            <div class="space-y-3 mb-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Items ({{ cartStore.itemCount }}):</span>
                <span class="font-semibold">
                  ${{ formatCurrency(cartStore.cart.itemsPrice || 0) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping:</span>
                <span class="font-semibold">
                  ${{ formatCurrency(cartStore.cart.shippingPrice || 0) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax:</span>
                <span class="font-semibold">
                  ${{ formatCurrency(cartStore.cart.taxPrice || 0) }}
                </span>
              </div>

              <div class="border-t pt-3 flex justify-between text-lg">
                <span class="font-bold">Total:</span>
                <span class="font-bold">
                  ${{ formatCurrency(cartStore.cart.totalPrice || 0) }}
                </span>
              </div>
            </div>

            <Button
              @click="handleCheckout"
              class="w-full mb-2"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <RouterLink to="/search">
              <Button variant="outline" class="w-full">
                Continue Shopping
              </Button>
            </RouterLink>
          </Card>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/lib/utils'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { ShoppingCart } from 'lucide-vue-next'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const handleUpdateQuantity = async (itemId: string, quantity: number) => {
  if (quantity < 1) return

  try {
    await cartStore.updateItem(itemId, quantity)
  } catch (err: any) {
    error.value = 'Failed to update quantity'
    console.error(err)
  }
}

const handleRemoveItem = async (itemId: string) => {
  if (!confirm('Are you sure you want to remove this item?')) return

  try {
    await cartStore.removeItem(itemId)
  } catch (err: any) {
    error.value = 'Failed to remove item'
    console.error(err)
  }
}

const handleCheckout = () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/sign-in?redirect=/shipping-address')
  } else {
    router.push('/shipping-address')
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await cartStore.fetchCart()
  } catch (err: any) {
    error.value = 'Failed to load cart'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
