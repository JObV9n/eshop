<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">Search Products</h1>
        
        <!-- Search Bar -->
        <div class="flex gap-4 mb-4">
          <Input
            v-model="searchQuery"
            placeholder="Search by product name or keyword..."
            class="flex-1"
            @keyup.enter="handleSearch"
          />
          <Button @click="handleSearch">
            <span class="mr-2">🔍</span>
            Search
          </Button>
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Category Filter -->
          <div>
            <Label class="mb-2 block text-sm font-medium">Category</Label>
            <Select v-model="selectedCategory" @update:modelValue="handleSearch">
              <option value="">All Categories</option>
              <option v-for="cat in productStore.categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </Select>
          </div>

          <!-- Sort By -->
          <div>
            <Label class="mb-2 block text-sm font-medium">Sort By</Label>
            <Select v-model="sortBy" @update:modelValue="handleSearch">
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating-desc">Highest Rated</option>
            </Select>
          </div>

          <!-- Price Range -->
          <div>
            <Label class="mb-2 block text-sm font-medium">Min Price</Label>
            <Input
              v-model="minPrice"
              type="number"
              placeholder="Min"
              min="0"
              @blur="handleSearch"
            />
          </div>

          <div>
            <Label class="mb-2 block text-sm font-medium">Max Price</Label>
            <Input
              v-model="maxPrice"
              type="number"
              placeholder="Max"
              min="0"
              @blur="handleSearch"
            />
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 flex-wrap">
          <span class="text-sm text-muted-foreground">Active filters:</span>
          <Badge
            v-if="searchQuery"
            variant="secondary"
            class="cursor-pointer"
            @click="clearFilter('search')"
          >
            Search: {{ searchQuery }} ✕
          </Badge>
          <Badge
            v-if="selectedCategory"
            variant="secondary"
            class="cursor-pointer"
            @click="clearFilter('category')"
          >
            {{ selectedCategory }} ✕
          </Badge>
          <Badge
            v-if="minPrice"
            variant="secondary"
            class="cursor-pointer"
            @click="clearFilter('minPrice')"
          >
            Min: ${{ minPrice }} ✕
          </Badge>
          <Badge
            v-if="maxPrice"
            variant="secondary"
            class="cursor-pointer"
            @click="clearFilter('maxPrice')"
          >
            Max: ${{ maxPrice }} ✕
          </Badge>
          <Button
            variant="outline"
            size="sm"
            @click="clearAllFilters"
          >
            Clear All
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="productStore.loading" class="text-center py-12">
        <Spinner class="mx-auto" />
        <p class="text-muted-foreground mt-4">Loading products...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="productStore.error" class="text-center py-12">
        <p class="text-destructive">{{ productStore.error }}</p>
      </div>

      <!-- Products Grid -->
      <div v-else>
        <!-- Results Summary -->
        <div v-if="productStore.products.length > 0" class="mb-4">
          <p class="text-muted-foreground">
            Showing {{ (productStore.pagination.page - 1) * productStore.pagination.limit + 1 }} - 
            {{ Math.min(productStore.pagination.page * productStore.pagination.limit, productStore.pagination.total) }} 
            of {{ productStore.pagination.total }} products
          </p>
        </div>

        <div v-if="productStore.products.length === 0" class="text-center py-12">
          <p class="text-2xl mb-2">😔</p>
          <p class="text-muted-foreground mb-4">No products found matching your criteria</p>
          <Button @click="clearAllFilters" variant="outline">
            Clear Filters
          </Button>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <ProductCard
              v-for="product in productStore.products"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Pagination -->
          <div class="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              :disabled="productStore.pagination.page === 1"
              @click="goToPage(productStore.pagination.page - 1)"
            >
              ← Previous
            </Button>
            
            <!-- Page Numbers -->
            <div class="flex gap-2">
              <Button
                v-for="pageNum in visiblePages"
                :key="pageNum"
                :variant="pageNum === productStore.pagination.page ? 'default' : 'outline'"
                size="sm"
                @click="goToPage(pageNum)"
              >
                {{ pageNum }}
              </Button>
            </div>
            
            <Button
              variant="outline"
              :disabled="productStore.pagination.page === productStore.pagination.totalPages"
              @click="goToPage(productStore.pagination.page + 1)"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import MainLayout from '@/components/layouts/MainLayout.vue'
import ProductCard from '@/components/shared/ProductCard.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('createdAt-desc')
const minPrice = ref('')
const maxPrice = ref('')

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedCategory.value || minPrice.value || maxPrice.value)
})

// Generate visible page numbers
const visiblePages = computed(() => {
  const pages = []
  const total = productStore.pagination.totalPages
  const current = productStore.pagination.page

  if (total <= 7) {
    // Show all pages if 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    // Show pages around current
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    // Always show last page
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
})

const buildSearchParams = (page: number = 1) => {
  const params: any = {
    page,
    limit: 12,
  }

  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }

  if (selectedCategory.value) {
    params.category = selectedCategory.value
  }

  if (sortBy.value) {
    const [field, order] = sortBy.value.split('-')
    params.sortBy = field
    params.order = order
  }

  // Only include price filters if they have valid numeric values
  if (minPrice.value && minPrice.value !== '' && !isNaN(Number(minPrice.value))) {
    params.minPrice = Number(minPrice.value)
  }

  if (maxPrice.value && maxPrice.value !== '' && !isNaN(Number(maxPrice.value))) {
    params.maxPrice = Number(maxPrice.value)
  }

  return params
}

const handleSearch = async () => {
  const params = buildSearchParams(1)
  router.push({ query: params })
  await productStore.fetchProducts(params)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPage = async (page: number | string) => {
  if (page === '...') return
  
  const params = buildSearchParams(page as number)
  router.push({ query: params })
  await productStore.fetchProducts(params)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilter = (filterType: string) => {
  switch (filterType) {
    case 'search':
      searchQuery.value = ''
      break
    case 'category':
      selectedCategory.value = ''
      break
    case 'minPrice':
      minPrice.value = ''
      break
    case 'maxPrice':
      maxPrice.value = ''
      break
  }
  handleSearch()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  minPrice.value = ''
  maxPrice.value = ''
  sortBy.value = 'createdAt-desc'
  handleSearch()
}

onMounted(async () => {
  // Load categories
  await productStore.fetchCategories()

  // Get query params from URL
  searchQuery.value = (route.query.search as string) || ''
  selectedCategory.value = (route.query.category as string) || ''
  minPrice.value = (route.query.minPrice as string) || ''
  maxPrice.value = (route.query.maxPrice as string) || ''
  
  // Reconstruct sortBy from sortBy and order params
  const sortByParam = route.query.sortBy as string
  const orderParam = route.query.order as string
  if (sortByParam && orderParam) {
    sortBy.value = `${sortByParam}-${orderParam}`
  }

  // Fetch products
  const params = buildSearchParams(Number(route.query.page) || 1)
  await productStore.fetchProducts(params)
})
</script>
