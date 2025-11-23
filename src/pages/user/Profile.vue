<template>
  <MainLayout>
    <div class="container max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">My Profile</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Profile Navigation -->
        <aside class="md:col-span-1">
          <Card class="p-4">
            <nav class="space-y-2">
              <RouterLink
                to="/user/profile"
                class="block px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground"
              >
                Profile
              </RouterLink>
              <RouterLink
                to="/user/orders"
                class="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                My Orders
              </RouterLink>
            </nav>
          </Card>
        </aside>

        <!-- Profile Form -->
        <div class="md:col-span-2">
          <Card class="p-6">
            <h2 class="text-2xl font-semibold mb-6">Profile Information</h2>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Name -->
              <div>
                <Label for="name">Name</Label>
                <Input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  placeholder="John Doe"
                  required
                  class="mt-1"
                />
              </div>

              <!-- Email -->
              <div>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  class="mt-1"
                />
              </div>

              <!-- Password Section -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold mb-4">Change Password</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Leave password fields empty if you don't want to change your password
                </p>

                <!-- Current Password -->
                <div class="mb-4">
                  <Label for="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    v-model="formData.currentPassword"
                    type="password"
                    placeholder="••••••••"
                    class="mt-1"
                  />
                </div>

                <!-- New Password -->
                <div class="mb-4">
                  <Label for="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    v-model="formData.newPassword"
                    type="password"
                    placeholder="••••••••"
                    :minlength="8"
                    class="mt-1"
                  />
                </div>

                <!-- Confirm Password -->
                <div>
                  <Label for="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    class="mt-1"
                  />
                </div>
              </div>

              <!-- Error/Success Messages -->
              <div v-if="error" class="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {{ error }}
              </div>
              <div v-if="success" class="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                Profile updated successfully!
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                :disabled="loading"
                class="w-full"
              >
                {{ loading ? 'Updating...' : 'Update Profile' }}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = false

    // Validate password fields if any password is entered
    if (formData.value.newPassword || formData.value.currentPassword || formData.value.confirmPassword) {
      if (!formData.value.currentPassword) {
        error.value = 'Current password is required to change password'
        return
      }
      if (formData.value.newPassword !== formData.value.confirmPassword) {
        error.value = 'Passwords do not match'
        return
      }
      if (formData.value.newPassword.length < 8) {
        error.value = 'Password must be at least 8 characters'
        return
      }
    }

    // Prepare update data
    const updateData: any = {
      name: formData.value.name,
      email: formData.value.email,
    }

    if (formData.value.newPassword) {
      updateData.currentPassword = formData.value.currentPassword
      updateData.newPassword = formData.value.newPassword
    }

    await authStore.updateProfile(updateData)
    success.value = true

    // Clear password fields
    formData.value.currentPassword = ''
    formData.value.newPassword = ''
    formData.value.confirmPassword = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await authStore.fetchProfile()
    if (authStore.user) {
      formData.value.name = authStore.user.name
      formData.value.email = authStore.user.email
    }
  } catch (err) {
    error.value = 'Failed to load profile'
  }
})
</script>
