<template>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <Card class="p-6">
      <h1 class="text-2xl font-bold mb-6">Sign Up</h1>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" required />
        </div>

        <div>
          <Label for="email">Email</Label>
          <Input id="email" v-model="form.email" type="email" required />
        </div>

        <div>
          <Label for="password">Password</Label>
          <Input id="password" v-model="form.password" type="password" required />
        </div>

        <div>
          <Label for="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" v-model="form.confirmPassword" type="password" required />
        </div>

        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </Button>

        <p class="text-sm text-center text-muted-foreground">
          Already have an account?
          <RouterLink to="/sign-in" class="text-primary hover:underline">
            Sign In
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
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
