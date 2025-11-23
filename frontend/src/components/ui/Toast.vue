<template>
  <Teleport to="body">
    <div class="fixed bottom-0 right-0 z-50 p-4 w-full max-w-sm space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'p-4 rounded-lg shadow-lg border',
            variantClasses[toast.variant || 'default']
          ]"
        >
          <div class="flex items-start gap-3">
            <component
              v-if="toast.variant"
              :is="getIcon(toast.variant)"
              class="w-5 h-5 flex-shrink-0 mt-0.5"
            />
            <div class="flex-1">
              <p v-if="toast.title" class="font-semibold mb-1">{{ toast.title }}</p>
              <p class="text-sm">{{ toast.message }}</p>
            </div>
            <button
              @click="removeToast(toast.id)"
              class="p-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

export interface Toast {
  id: string
  message: string
  title?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Props {
  toasts: Toast[]
}

defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const variantClasses = {
  default: 'bg-background border-border',
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

const getIcon = (variant: string) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    default: Info,
  }
  return icons[variant as keyof typeof icons] || Info
}

const removeToast = (id: string) => {
  emit('remove', id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
