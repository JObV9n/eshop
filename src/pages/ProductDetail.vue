<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-muted-foreground">Loading product...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-destructive">{{ error }}</p>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Product Images -->
        <div>
          <div class="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
            <img
              :src="product.images?.[0] || '/images/placeholder.jpg'"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="(image, index) in product.images?.slice(0, 4)"
              :key="index"
              class="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-75"
            >
              <img
                :src="image"
                :alt="`${product.name} ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <Badge variant="secondary" class="mb-2">{{ product.brand }}</Badge>
          <h1 class="text-3xl font-bold mb-2">{{ product.name }}</h1>
          
          <!-- Rating -->
          <div class="flex items-center gap-2 mb-4">
            <div class="flex">
              <Star
                v-for="i in 5"
                :key="i"
                :class="[
                  'w-5 h-5',
                  i <= Math.round(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                ]"
              />
            </div>
            <span class="text-sm text-muted-foreground">
              ({{ product.numReviews || 0 }} reviews)
            </span>
          </div>

          <p class="text-3xl font-bold mb-4">${{ formatCurrency(product.price) }}</p>

          <div class="mb-6">
            <p class="text-sm font-semibold mb-2">Description:</p>
            <p class="text-muted-foreground">{{ product.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-muted-foreground">Category</p>
              <p class="font-semibold">{{ product.category }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Stock</p>
              <Badge :variant="product.countInStock > 0 ? 'default' : 'destructive'">
                {{ product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock' }}
              </Badge>
            </div>
          </div>

          <!-- Add to Cart -->
          <div v-if="product.countInStock > 0" class="space-y-4">
            <div class="flex items-center gap-4">
              <Label>Quantity:</Label>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="decrementQuantity"
                  :disabled="quantity <= 1"
                >
                  -
                </Button>
                <Input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="product.countInStock"
                  class="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  @click="incrementQuantity"
                  :disabled="quantity >= product.countInStock"
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              @click="handleAddToCart"
              class="w-full"
              :disabled="addingToCart"
            >
              <ShoppingCart class="w-4 h-4 mr-2" />
              {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
            </Button>
          </div>

          <div v-else class="p-4 bg-destructive/10 text-destructive rounded-lg">
            This product is currently out of stock
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="product" class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <div v-if="product.reviews && product.reviews.length > 0" class="space-y-4">
          <Card v-for="review in product.reviews" :key="review.id" class="p-4">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-semibold">{{ review.user?.name || 'Anonymous' }}</p>
                <div class="flex">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      'w-4 h-4',
                      i <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    ]"
                  />
                </div>
              </div>
              <span class="text-sm text-muted-foreground">
                {{ formatDate(review.createdAt) }}
              </span>
            </div>
            <p class="text-muted-foreground">{{ review.comment }}</p>
          </Card>
        </div>

        <p v-else class="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/lib/utils'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { Star, ShoppingCart } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const product = ref<any>(null)
const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const addingToCart = ref(false)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const incrementQuantity = () => {
  if (product.value && quantity.value < product.value.countInStock) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = async () => {
  if (!product.value) return

  try {
    addingToCart.value = true
    await cartStore.addItem(product.value.id, quantity.value)
    // Show success message (you can add a toast notification here)
    alert('Product added to cart!')
  } catch (err: any) {
    error.value = err.message || 'Failed to add to cart'
  } finally {
    addingToCart.value = false
  }
}

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) {
    error.value = 'Product not found'
    return
  }

  try {
    loading.value = true
    product.value = await productStore.fetchProductBySlug(slug)
  } catch (err: any) {
    error.value = 'Failed to load product'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
