import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { User } from '@vue-eshop/shared'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  async function register(data: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_URL}/auth/register`, data)
      
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        localStorage.setItem('token', token.value!)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        localStorage.setItem('token', token.value!)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return

    loading.value = true
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      if (response.data.success) {
        user.value = response.data.data
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err)
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: { name: string; email: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`${API_URL}/users/profile`, data, {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      if (response.data.success) {
        user.value = response.data.data
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // Initialize auth on store creation
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    fetchProfile()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    fetchProfile,
    updateProfile,
    logout,
  }
})
