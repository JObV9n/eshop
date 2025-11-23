<template>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <Card class="p-6">
      <h1 class="text-2xl font-bold mb-6">Sign In</h1>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <Label for="email">Email</Label>
          <Input id="email" v-model="form.email" type="email" required />
        </div>

        <div>
          <Label for="password">Password</Label>
          <Input id="password" v-model="form.password" type="password" required />
        </div>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </Button>

        <p class="text-sm text-center text-muted-foreground">
          Don't have an account?
          <RouterLink to="/sign-up" class="text-primary hover:underline">
            Sign Up
          </RouterLink>
        </p>
      </form>

      <p v-if="error" class="text-sm text-destructive mt-4">{{ error }}</p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value.email, form.value.password)
    
    // Sync local cart to backend after login
    await cartStore.syncCartToBackend()
    
    // Redirect to the intended page or home
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
