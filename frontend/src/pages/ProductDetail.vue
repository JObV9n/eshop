<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <Spinner class="mx-auto" />
        <p class="text-muted-foreground mt-4">Loading product...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-destructive">{{ error }}</p>
        <Button class="mt-4" @click="$router.push('/search')">Browse Products</Button>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Product Images -->
        <div>
          <img :src="selectedImage || product.images[0]" :alt="product.name" class="w-full rounded-lg mb-4" />
          <div class="grid grid-cols-4 gap-2">
            <img v-for="(image, index) in product.images" :key="index" :src="image"
              :alt="`${product.name} ${index + 1}`" class="w-full rounded cursor-pointer border-2"
              :class="selectedImage === image ? 'border-primary' : 'border-transparent'"
              @click="selectedImage = image" />
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <h1 class="text-3xl font-bold mb-2">{{ product.name }}</h1>
          <div class="flex items-center gap-2 mb-4">
            <div class="flex items-center">
              <span class="text-yellow-500 mr-1">★</span>
              <span class="font-semibold">{{ product.rating }}</span>
            </div>
            <span class="text-muted-foreground">({{ product.numReviews }} reviews)</span>
          </div>

          <p class="text-3xl font-bold text-primary mb-4">${{ product.price }}</p>

          <div class="space-y-2 mb-6">
            <p><span class="font-semibold">Brand:</span> {{ product.brand }}</p>
            <p><span class="font-semibold">Category:</span> {{ product.category }}</p>
            <p>
              <span class="font-semibold">Stock:</span>
              <Badge :variant="product.stock > 0 ? 'default' : 'destructive'">
                {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
              </Badge>
            </p>
          </div>

          <p class="text-muted-foreground mb-6">{{ product.description }}</p>

          <!-- Add to Cart -->
          <div class="flex gap-4 mb-8">
            <Input v-model.number="quantity" type="number" min="1" :max="product.stock" class="w-20"
              :disabled="product.stock === 0" />
            <!-- <Button :disabled="product.stock === 0 || addingToCart" @click="handleAddToCart" class="flex-1">
              {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </Button> -->

            <!-- Add to Cart -->
            <ProductAddToCartButton :product-id="product.id" :name="product.name" :slug="product.slug"
              :price="product.price" :image="product.images[0]" :stock="product.stock" :qty="quantity" />

          </div>

          <!-- Reviews Section -->
          <div class="border-t pt-6">
            <h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>

            <!-- Write Review (Only for logged-in users) -->
            <div v-if="authStore.isAuthenticated" class="mb-6 p-4 bg-secondary rounded-lg">
              <h3 class="font-semibold mb-3">Write a Review</h3>
              <form @submit.prevent="handleSubmitReview">
                <div class="mb-3">
                  <Label>Rating</Label>
                  <div class="flex gap-1">
                    <button v-for="star in 5" :key="star" type="button" class="text-2xl"
                      :class="star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'"
                      @click="reviewForm.rating = star">
                      ★
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <Label>Title</Label>
                  <Input v-model="reviewForm.title" placeholder="Summary of your review" required />
                </div>
                <div class="mb-3">
                  <Label>Review</Label>
                  <Textarea v-model="reviewForm.description" placeholder="Tell us what you think..." rows="4"
                    required />
                </div>
                <Button type="submit" :disabled="submittingReview">
                  {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
                </Button>
              </form>
            </div>

            <!-- Login prompt for non-authenticated users -->
            <div v-else class="mb-6 p-4 bg-secondary rounded-lg">
              <p class="text-muted-foreground mb-2">Want to leave a review?</p>
              <Button @click="$router.push('/sign-in')" variant="outline">
                Sign In to Review
              </Button>
            </div>

            <!-- Reviews List -->
            <div v-if="reviews.length > 0" class="space-y-4">
              <div v-for="review in reviews" :key="review.id" class="border rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <p class="font-semibold">{{ review.userName }}</p>
                    <div class="flex items-center gap-2">
                      <div class="flex">
                        <span v-for="star in 5" :key="star" class="text-yellow-500">
                          {{ star <= review.rating ? '★' : '☆' }} </span>
                      </div>
                    </div>
                  </div>
                  <span class="text-sm text-muted-foreground">
                    {{ new Date(review.createdAt).toLocaleDateString() }}
                  </span>
                </div>
                <h4 class="font-semibold mb-1">{{ review.title }}</h4>
                <p class="text-muted-foreground">{{ review.description }}</p>
              </div>
            </div>
            <p v-else class="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import axios from 'axios'

const route = useRoute()
// const router = useRouter()
const productStore = useProductStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const showToast = useToast()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const product = ref<any>(null)
const reviews = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const selectedImage = ref('')
const quantity = ref(1)
const addingToCart = ref(false)
const submittingReview = ref(false)

const reviewForm = ref({
  rating: 5,
  title: '',
  description: '',
})

// Add to Cart Handler
const handleAddToCart = async () => {
  if (!product.value) return

  addingToCart.value = true
  try {
    await cartStore.addToCart({
      productId: product.value.id,
      name: product.value.name,
      slug: product.value.slug,
      qty: quantity.value,
      image: product.value.images[0],
      price: product.value.price,
    }, authStore.isAuthenticated)
    showToast.success('Product added to cart')
  } catch (err: any) {
    showToast.error(err.response?.data?.message || 'Failed to add to cart')
  } finally {
    addingToCart.value = false
  }
}

// Review Submit Handler
const handleSubmitReview = async () => {
  if (!product.value || !authStore.isAuthenticated) return

  submittingReview.value = true
  try {
    const response = await axios.post(
      `${API_URL}/products/${product.value.id}/reviews`,
      {
        ...reviewForm.value,
        productId: product.value.id,
        userId: authStore.user?.id,
      },
      {
        headers: { Authorization: `Bearer ${authStore.token}` },
      }
    )

    if (response.data.success) {
      showToast.success('Review submitted successfully')
      reviewForm.value = { rating: 5, title: '', description: '' }
      await loadReviews()
    }
  } catch (err: any) {
    showToast.error(err.response?.data?.message || 'Failed to submit review')
  } finally {
    submittingReview.value = false
  }
}

//Load Reviews
const loadReviews = async () => {
  if (!product.value) return

  try {
    const response = await axios.get(`${API_URL}/products/${product.value.id}/reviews`)
    if (response.data.success) {
      reviews.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to load reviews:', err)
  }
}

//Load Product on Mount
onMounted(async () => {
  const slug = route.params.slug as string

  try {
    loading.value = true
    product.value = await productStore.fetchProductBySlug(slug)

    if (product.value) {
      selectedImage.value = product.value.images[0]
      await loadReviews()
    } else {
      error.value = 'Product not found'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
})
</script>
