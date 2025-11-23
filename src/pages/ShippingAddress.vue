<template>
  <MainLayout>
    <div class="container max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Shipping Address</h1>

      <!-- Checkout Steps Indicator -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            1
          </div>
          <span class="ml-2 font-semibold">Shipping</span>
        </div>
        <div class="flex-1 h-0.5 bg-muted mx-4"></div>
        <div class="flex items-center text-muted-foreground">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            2
          </div>
          <span class="ml-2">Payment</span>
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
          <!-- Full Name -->
          <div>
            <Label for="fullName">Full Name</Label>
            <Input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              placeholder="John Doe"
              required
              class="mt-1"
            />
          </div>

          <!-- Address -->
          <div>
            <Label for="address">Address</Label>
            <Input
              id="address"
              v-model="formData.address"
              type="text"
              placeholder="123 Main St"
              required
              class="mt-1"
            />
          </div>

          <!-- City -->
          <div>
            <Label for="city">City</Label>
            <Input
              id="city"
              v-model="formData.city"
              type="text"
              placeholder="New York"
              required
              class="mt-1"
            />
          </div>

          <!-- State/Province and Postal Code -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="state">State/Province</Label>
              <Input
                id="state"
                v-model="formData.state"
                type="text"
                placeholder="NY"
                required
                class="mt-1"
              />
            </div>
            <div>
              <Label for="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                v-model="formData.postalCode"
                type="text"
                placeholder="10001"
                required
                class="mt-1"
              />
            </div>
          </div>

          <!-- Country -->
          <div>
            <Label for="country">Country</Label>
            <Select
              id="country"
              v-model="formData.country"
              required
              class="mt-1"
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </Select>
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
              @click="router.push('/cart')"
              class="flex-1"
            >
              Back to Cart
            </Button>
            <Button
              type="submit"
              :disabled="loading"
              class="flex-1"
            >
              {{ loading ? 'Saving...' : 'Continue to Payment' }}
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
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const error = ref('')

const formData = ref({
  fullName: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
})

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    // Save shipping address to cart store or local storage
    localStorage.setItem('shippingAddress', JSON.stringify(formData.value))

    // Navigate to payment method page
    router.push('/payment-method')
  } catch (err: any) {
    error.value = err.message || 'Failed to save shipping address'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Load saved shipping address if exists
  const saved = localStorage.getItem('shippingAddress')
  if (saved) {
    formData.value = JSON.parse(saved)
  }

  // Redirect if cart is empty
  if (cartStore.isEmpty) {
    router.push('/cart')
  }
})
</script>
