import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface Order {
  id: string
  userId: string
  shippingAddress: any
  paymentMethod: string
  itemsPrice: string
  shippingPrice: string
  taxPrice: string
  totalPrice: string
  isPaid: boolean
  paidAt: Date | null
  isDelivered: boolean
  deliveredAt: Date | null
  createdAt: Date
  items?: any[]
}

export const useOrderStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function createOrder(orderData: any) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_URL}/orders`, orderData)

      if (response.data.success) {
        return response.data.data
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create order'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOrders() {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/orders`)

      if (response.data.success) {
        orders.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
      console.error('Fetch orders error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderById(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/orders/${id}`)

      if (response.data.success) {
        currentOrder.value = response.data.data
        return response.data.data
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Order not found'
      console.error('Fetch order error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateOrderPayment(orderId: string, paymentResult: any) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/pay`,
        { paymentResult }
      )

      if (response.data.success) {
        currentOrder.value = response.data.data
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    fetchOrders,
    fetchOrderById,
    updateOrderPayment,
  }
})
