import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface Product {
  id: string
  name: string
  slug: string
  category: string
  images: string[]
  brand: string
  description: string
  stock: number
  price: string
  rating: string
  numReviews: number
  isFeatured: boolean
  banner: string | null
  createdAt: Date
}

export const useProductStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const categories = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  // Actions
  async function fetchProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    brand?: string
    sortBy?: string
    order?: string
    minPrice?: string | number
    maxPrice?: string | number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/products`, { params })

      if (response.data.success) {
        products.value = response.data.data
        if (response.data.pagination) {
          pagination.value = response.data.pagination
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      console.error('Fetch products error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchLatestProducts() {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/products/latest`)

      if (response.data.success) {
        return response.data.data
      }
      return []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch latest products'
      console.error('Fetch latest products error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchFeaturedProducts() {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/products/featured`)

      if (response.data.success) {
        return response.data.data
      }
      return []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch featured products'
      console.error('Fetch featured products error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchProductBySlug(slug: string) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/products/slug/${slug}`)

      if (response.data.success) {
        currentProduct.value = response.data.data
        return response.data.data
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Product not found'
      console.error('Fetch product error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/products/categories`)

      if (response.data.success) {
        categories.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      console.error('Fetch categories error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    currentProduct,
    categories,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchLatestProducts,
    fetchFeaturedProducts,
    fetchProductBySlug,
    fetchCategories,
  }
})
