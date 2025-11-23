<template>
  <MainLayout>
    <div class="container max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Payment Method</h1>

      <!-- Checkout Steps Indicator -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center text-muted-foreground">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            ✓
          </div>
          <span class="ml-2">Shipping</span>
        </div>
        <div class="flex-1 h-0.5 bg-muted mx-4"></div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            2
          </div>
          <span class="ml-2 font-semibold">Payment</span>
        </div>
        <div class="flex-1 h-0.5 bg-muted mx-4"></div>
        <div class="flex items-center text-muted-foreground">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            3
          </div>
          <span class="ml-2">Place Order</span>
        </div>
      </div>

      <Card class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">Select Payment Method</h2>

            <!-- PayPal Option -->
            <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5': selectedMethod === 'PayPal' }"
            >
              <input
                type="radio"
                v-model="selectedMethod"
                value="PayPal"
                class="mt-1 mr-3"
              />
              <div class="flex-1">
                <div class="font-semibold mb-1">PayPal</div>
                <p class="text-sm text-muted-foreground">
                  Pay securely using your PayPal account or credit card
                </p>
              </div>
            </label>

            <!-- Stripe Option -->
            <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5': selectedMethod === 'Stripe' }"
            >
              <input
                type="radio"
                v-model="selectedMethod"
                value="Stripe"
                class="mt-1 mr-3"
              />
              <div class="flex-1">
                <div class="font-semibold mb-1">Credit/Debit Card (Stripe)</div>
                <p class="text-sm text-muted-foreground">
                  Pay with Visa, Mastercard, American Express, or Discover
                </p>
              </div>
            </label>

            <!-- Cash on Delivery Option -->
            <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5': selectedMethod === 'CashOnDelivery' }"
            >
              <input
                type="radio"
                v-model="selectedMethod"
                value="CashOnDelivery"
                class="mt-1 mr-3"
              />
              <div class="flex-1">
                <div class="font-semibold mb-1">Cash on Delivery</div>
                <p class="text-sm text-muted-foreground">
                  Pay with cash when your order is delivered
                </p>
              </div>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {{ error }}
          </div>

          <!-- Buttons -->
          <div class="flex gap-4">
            <Button
              type="button"
              variant="outline"
              @click="router.push('/shipping-address')"
              class="flex-1"
            >
              Back to Shipping
            </Button>
            <Button
              type="submit"
              :disabled="!selectedMethod || loading"
              class="flex-1"
            >
              {{ loading ? 'Saving...' : 'Continue to Review' }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const error = ref('')
const selectedMethod = ref('PayPal')

const handleSubmit = async () => {
  if (!selectedMethod.value) {
    error.value = 'Please select a payment method'
    return
  }

  try {
    loading.value = true
    error.value = ''

    // Save payment method to local storage
    localStorage.setItem('paymentMethod', selectedMethod.value)

    // Navigate to place order page
    router.push('/place-order')
  } catch (err: any) {
    error.value = err.message || 'Failed to save payment method'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Load saved payment method if exists
  const saved = localStorage.getItem('paymentMethod')
  if (saved) {
    selectedMethod.value = saved
  }

  // Check if shipping address is saved
  const shippingAddress = localStorage.getItem('shippingAddress')
  if (!shippingAddress) {
    router.push('/shipping-address')
  }

  // Redirect if cart is empty
  if (cartStore.isEmpty) {
    router.push('/cart')
  }
})
</script>
