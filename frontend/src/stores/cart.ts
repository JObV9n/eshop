import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { CartItem } from '@vue-eshop/shared'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const LOCAL_CART_KEY = 'local_cart'

interface Cart {
  items: CartItem[]
  itemsPrice: string
  shippingPrice: string
  taxPrice: string
  totalPrice: string
}

// Helper function to calculate cart prices
const calculatePrices = (items: CartItem[]) => {
  const itemsPrice = items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0)
  const shippingPrice = itemsPrice > 100 ? 0 : 10
  const taxPrice = itemsPrice * 0.15
  const totalPrice = itemsPrice + shippingPrice + taxPrice

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}

export const useCartStore = defineStore('cart', () => {
  // State
  const cart = ref<Cart | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const itemCount = computed(() => {
    return cart.value?.items.reduce((sum, item) => sum + item.qty, 0) || 0
  })

  const isEmpty = computed(() => itemCount.value === 0)

  // Load cart from localStorage
  function loadLocalCart() {
    const stored = localStorage.getItem(LOCAL_CART_KEY)
    if (stored) {
      try {
        cart.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse local cart:', e)
      }
    }
  }

  // Save cart to localStorage
  function saveLocalCart() {
    if (cart.value) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart.value))
    } else {
      localStorage.removeItem(LOCAL_CART_KEY)
    }
  }

  // Actions
  async function fetchCart(isAuthenticated: boolean = false) {
    if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      loadLocalCart()
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/cart`)
      
      if (response.data.success) {
        cart.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch cart'
      console.error('Fetch cart error:', err)
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId: string, qty: number = 1) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_URL}/cart/items`, {
        productId,
        qty,
      })

      if (response.data.success) {
        cart.value = response.data.data
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addToCart(item: CartItem, isAuthenticated: boolean = false) {
    // For non-authenticated users, handle cart locally
    if (!isAuthenticated) {
      if (!cart.value) {
        cart.value = {
          items: [],
          itemsPrice: '0.00',
          shippingPrice: '0.00',
          taxPrice: '0.00',
          totalPrice: '0.00',
        }
      }

      // Check if item already exists in cart
      const existingIndex = cart.value.items.findIndex(i => i.productId === item.productId)
      
      if (existingIndex !== -1) {
        // Update quantity
        cart.value.items[existingIndex].qty += item.qty
      } else {
        // Add new item
        cart.value.items.push(item)
      }

      // Recalculate prices
      const prices = calculatePrices(cart.value.items)
      cart.value = { ...cart.value, ...prices }

      // Save to localStorage
      saveLocalCart()
      return true
    }

    // For authenticated users, sync with backend
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_URL}/cart/items`, item)

      if (response.data.success) {
        cart.value = response.data.data
        // Also save to localStorage as backup
        saveLocalCart()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add to cart'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sync local cart to backend after login
  async function syncCartToBackend() {
    if (!cart.value || cart.value.items.length === 0) return

    loading.value = true
    try {
      // Send all local cart items to backend
      for (const item of cart.value.items) {
        await axios.post(`${API_URL}/cart/items`, item)
      }
      
      // Fetch updated cart from backend
      const response = await axios.get(`${API_URL}/cart`)
      if (response.data.success) {
        cart.value = response.data.data
        saveLocalCart()
      }
    } catch (err) {
      console.error('Failed to sync cart:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateItem(productId: string, qty: number, isAuthenticated: boolean = false) {
    // For non-authenticated users, update locally
    if (!isAuthenticated && cart.value) {
      const item = cart.value.items.find(i => i.productId === productId)
      if (item) {
        item.qty = qty
        const prices = calculatePrices(cart.value.items)
        cart.value = { ...cart.value, ...prices }
        saveLocalCart()
        return true
      }
      return false
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.put(
        `${API_URL}/cart/items/${productId}`,
        { qty }
      )

      if (response.data.success) {
        cart.value = response.data.data
        saveLocalCart()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeItem(productId: string, isAuthenticated: boolean = false) {
    // For non-authenticated users, remove locally
    if (!isAuthenticated && cart.value) {
      cart.value.items = cart.value.items.filter(i => i.productId !== productId)
      
      if (cart.value.items.length === 0) {
        cart.value = null
        localStorage.removeItem(LOCAL_CART_KEY)
      } else {
        const prices = calculatePrices(cart.value.items)
        cart.value = { ...cart.value, ...prices }
        saveLocalCart()
      }
      return true
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`${API_URL}/cart/items/${productId}`)

      if (response.data.success) {
        cart.value = response.data.data
        saveLocalCart()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`${API_URL}/cart`)

      if (response.data.success) {
        cart.value = response.data.data
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to clear cart'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize cart on store creation
  loadLocalCart()

  return {
    cart,
    loading,
    error,
    itemCount,
    isEmpty,
    fetchCart,
    addItem,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    syncCartToBackend,
  }
})
