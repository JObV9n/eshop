<template>
  <RouterLink :to="`/product/${product.slug}`">
    <Card class="h-full hover:shadow-lg transition-shadow overflow-hidden">
      <!-- Image -->
      <div class="aspect-square overflow-hidden bg-muted">
        <img :src="product.images[0] || '/images/product-placeholder.png'" :alt="product.name"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>

      <!-- Content -->
      <div class="p-4 space-y-2">
        <!-- Brand -->
        <p class="text-xs text-muted-foreground uppercase tracking-wide">
          {{ product.brand }}
        </p>

        <!-- Name -->
        <h3 class="font-semibold line-clamp-2 min-h-[2.5rem]">
          {{ product.name }}
        </h3>

        <!-- Product Rating -->
        <ProductRating :rating="product.rating" :numReviews="product.numReviews" />

        <!-- Price and Stock -->
        <ProductPrice :price="product.price" :stock="product.stock" />

        <!-- Add to cart Button -->
        <ProductAddToCartButton :product-id="product.id" :name="product.name" :slug="product.slug"
          :price="product.price" :image="product.images[0] ?? '/images/product-placeholder.png'"
          :stock="product.stock" />
      </div>
    </Card>
  </RouterLink>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import ProductRating from '@/components/shared/product/ProductRating.vue'
import ProductPrice from '@/components/shared/product/ProductPrice.vue'
import ProductAddToCartButton from '@/components/shared/product/ProductAddToCartButton.vue'

interface Product {
  id: string
  name: string
  slug: string
  images: string[]
  brand: string
  price: string
  rating: string
  numReviews: number
  stock: number
}

const { product } = defineProps<{ product: Product }>()
</script>
