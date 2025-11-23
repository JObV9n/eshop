<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <section class="mb-12 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Welcome to Eshop</h1>
        <p class="text-lg text-muted-foreground mb-6">
          Discover quality products at unbeatable prices
        </p>
        <RouterLink to="/search">
          <Button size="lg">Shop Now</Button>
        </RouterLink>
      </section>

      <!-- Featured Products -->
      <section v-if="featuredProducts.length > 0" class="mb-12">
        <h2 class="text-3xl font-bold mb-6">Featured Products</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>

      <!-- Latest Products -->
      <section v-if="latestProducts.length > 0" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold">Latest Products</h2>
          <RouterLink to="/search">
            <Button variant="outline">View All</Button>
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in latestProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-muted-foreground">Loading products...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="text-center py-12">
        <p class="text-destructive">{{ error }}</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import MainLayout from '@/components/layouts/MainLayout.vue'
import ProductCard from '@/components/shared/ProductCard.vue'
import Button from '@/components/ui/Button.vue'

const productStore = useProductStore()

const featuredProducts = ref<any[]>([])
const latestProducts = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const [featured, latest] = await Promise.all([
      productStore.fetchFeaturedProducts(),
      productStore.fetchLatestProducts(),
    ])
    featuredProducts.value = featured
    latestProducts.value = latest
  } catch (err: any) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
