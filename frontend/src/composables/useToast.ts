import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  title?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])

let toastId = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastId}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    }

    toasts.value.push(newToast)

    // Auto remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, title?: string) => {
    return addToast({ message, title, variant: 'success' })
  }

  const error = (message: string, title?: string) => {
    return addToast({ message, title, variant: 'error' })
  }

  const warning = (message: string, title?: string) => {
    return addToast({ message, title, variant: 'warning' })
  }

  const info = (message: string, title?: string) => {
    return addToast({ message, title, variant: 'info' })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
