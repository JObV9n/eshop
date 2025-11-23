<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Search Products</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Filters Sidebar -->
        <aside class="lg:col-span-1">
          <Card class="p-4">
            <h2 class="text-xl font-semibold mb-4">Filters</h2>

            <!-- Category Filter -->
            <div class="mb-6">
              <Label class="mb-2">Category</Label>
              <Select v-model="filters.category">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </Select>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <Label class="mb-2">Price Range</Label>
              <div class="grid grid-cols-2 gap-2">
                <Input
                  v-model.number="filters.minPrice"
                  type="number"
                  placeholder="Min"
                  min="0"
                />
                <Input
                  v-model.number="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>

            <!-- Rating Filter -->
            <div class="mb-6">
              <Label class="mb-2">Minimum Rating</Label>
              <Select v-model.number="filters.minRating">
                <option value="0">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </Select>
            </div>

            <!-- Apply Filters Button -->
            <Button @click="applyFilters" class="w-full mb-2">
              Apply Filters
            </Button>
            <Button @click="clearFilters" variant="outline" class="w-full">
              Clear Filters
            </Button>
          </Card>
        </aside>

        <!-- Products Grid -->
        <div class="lg:col-span-3">
          <!-- Sort and Results Info -->
          <div class="flex items-center justify-between mb-6">
            <p class="text-muted-foreground">
              {{ totalProducts }} products found
            </p>
            <Select v-model="sortBy" @change="applyFilters">
              <option value="createdAt:desc">Newest First</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="rating:desc">Highest Rated</option>
              <option value="name:asc">Name: A-Z</option>
            </Select>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <p class="text-muted-foreground">Loading products...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-destructive">{{ error }}</p>
          </div>

          <!-- No Results -->
          <div v-else-if="products.length === 0" class="text-center py-12">
            <p class="text-muted-foreground">No products found</p>
          </div>

          <!-- Products Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              Previous
            </Button>
            <div class="flex gap-1">
              <Button
                v-for="page in visiblePages"
                :key="page"
                :variant="page === currentPage ? 'default' : 'outline'"
                size="sm"
                @click="changePage(page)"
              >
                {{ page }}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import MainLayout from '@/components/layouts/MainLayout.vue'
import ProductCard from '@/components/shared/ProductCard.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const products = ref<any[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const error = ref('')

const filters = ref({
  category: '',
  minPrice: null as number | null,
  maxPrice: null as number | null,
  minRating: 0,
  query: '',
})

const sortBy = ref('createdAt:desc')
const currentPage = ref(1)
const pageSize = ref(12)
const totalProducts = ref(0)

const totalPages = computed(() => Math.ceil(totalProducts.value / pageSize.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const loadProducts = async () => {
  try {
    loading.value = true
    error.value = ''

    const [sortField, sortOrder] = sortBy.value.split(':')
    
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      sortBy: sortField,
      sortOrder,
    }

    if (filters.value.category) params.category = filters.value.category
    if (filters.value.minPrice) params.minPrice = filters.value.minPrice
    if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice
    if (filters.value.minRating) params.minRating = filters.value.minRating
    if (filters.value.query) params.query = filters.value.query

    const result = await productStore.fetchProducts(params)
    products.value = result.data
    totalProducts.value = result.total
  } catch (err: any) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await productStore.fetchCategories()
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  loadProducts()
}

const clearFilters = () => {
  filters.value = {
    category: '',
    minPrice: null,
    maxPrice: null,
    minRating: 0,
    query: '',
  }
  applyFilters()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Load query from URL params
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    filters.value.query = newQuery as string
    applyFilters()
  }
}, { immediate: true })

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>
