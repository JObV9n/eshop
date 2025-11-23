<template>
  <MainLayout>
    <div class="container max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Review Your Order</h1>

      <!-- Checkout Steps Indicator -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center text-muted-foreground">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            ✓
          </div>
          <span class="ml-2">Shipping</span>
        </div>
        <div class="flex-1 h-0.5 bg-muted mx-4"></div>
        <div class="flex items-center text-muted-foreground">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            ✓
          </div>
          <span class="ml-2">Payment</span>
        </div>
        <div class="flex-1 h-0.5 bg-muted mx-4"></div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            3
          </div>
          <span class="ml-2 font-semibold">Place Order</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Order Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Shipping Address -->
          <Card class="p-6">
            <h2 class="text-xl font-semibold mb-4">Shipping Address</h2>
            <div class="text-muted-foreground">
              <p>{{ shippingAddress.fullName }}</p>
              <p>{{ shippingAddress.address }}</p>
              <p>{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.postalCode }}</p>
              <p>{{ shippingAddress.country }}</p>
            </div>
            <Button
              variant="link"
              @click="router.push('/shipping-address')"
              class="mt-2 px-0"
            >
              Edit
            </Button>
          </Card>

          <!-- Payment Method -->
          <Card class="p-6">
            <h2 class="text-xl font-semibold mb-4">Payment Method</h2>
            <p class="text-muted-foreground">{{ paymentMethod }}</p>
            <Button
              variant="link"
              @click="router.push('/payment-method')"
              class="mt-2 px-0"
            >
              Edit
            </Button>
          </Card>

          <!-- Order Items -->
          <Card class="p-6">
            <h2 class="text-xl font-semibold mb-4">Order Items</h2>
            <div class="space-y-4">
              <div
                v-for="item in cartStore.cart.items"
                :key="item.id"
                class="flex gap-4 pb-4 border-b last:border-0"
              >
                <div class="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    :src="item.product?.images?.[0] || '/images/placeholder.jpg'"
                    :alt="item.product?.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1">
                  <RouterLink
                    :to="`/product/${item.product?.slug}`"
                    class="font-semibold hover:underline"
                  >
                    {{ item.product?.name }}
                  </RouterLink>
                  <p class="text-sm text-muted-foreground">
                    Qty: {{ item.quantity }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold">
                    ${{ formatCurrency((item.product?.price || 0) * item.quantity) }}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <Card class="p-6 sticky top-4">
            <h2 class="text-xl font-semibold mb-4">Order Summary</h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Items:</span>
                <span>${{ formatCurrency(cartStore.cart.itemsPrice || 0) }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping:</span>
                <span>${{ formatCurrency(cartStore.cart.shippingPrice || 0) }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax:</span>
                <span>${{ formatCurrency(cartStore.cart.taxPrice || 0) }}</span>
              </div>

              <div class="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Order Total:</span>
                <span>${{ formatCurrency(cartStore.cart.totalPrice || 0) }}</span>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
              {{ error }}
            </div>

            <Button
              @click="handlePlaceOrder"
              :disabled="placing || cartStore.isEmpty"
              class="w-full"
              size="lg"
            >
              {{ placing ? 'Placing Order...' : 'Place Order' }}
            </Button>
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
import { useOrderStore } from '@/stores/orders'
import { formatCurrency } from '@/lib/utils'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const placing = ref(false)
const error = ref('')
const shippingAddress = ref<any>({})
const paymentMethod = ref('')

const handlePlaceOrder = async () => {
  try {
    placing.value = true
    error.value = ''

    // Create order
    const orderData = {
      items: cartStore.cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price || 0,
      })),
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value,
      itemsPrice: cartStore.cart.itemsPrice,
      shippingPrice: cartStore.cart.shippingPrice,
      taxPrice: cartStore.cart.taxPrice,
      totalPrice: cartStore.cart.totalPrice,
    }

    const order = await orderStore.createOrder(orderData)

    // Clear cart and saved data
    await cartStore.clearCart()
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('paymentMethod')

    // Redirect to order details
    router.push(`/user/orders/${order.id}`)
  } catch (err: any) {
    error.value = err.message || 'Failed to place order'
    console.error(err)
  } finally {
    placing.value = false
  }
}

onMounted(() => {
  // Load shipping address
  const savedAddress = localStorage.getItem('shippingAddress')
  if (!savedAddress) {
    router.push('/shipping-address')
    return
  }
  shippingAddress.value = JSON.parse(savedAddress)

  // Load payment method
  const savedPayment = localStorage.getItem('paymentMethod')
  if (!savedPayment) {
    router.push('/payment-method')
    return
  }
  paymentMethod.value = savedPayment

  // Redirect if cart is empty
  if (cartStore.isEmpty) {
    router.push('/cart')
  }
})
</script>
