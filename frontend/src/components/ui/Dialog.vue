<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>
        
        <!-- Dialog Content -->
        <div
          class="relative bg-background rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-auto"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div v-if="$slots.header" class="p-6 pb-0">
            <slot name="header"></slot>
          </div>

          <!-- Body -->
          <div class="p-6">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="p-6 pt-0">
            <slot name="footer"></slot>
          </div>

          <!-- Close Button -->
          <button
            v-if="showClose"
            @click="handleClose"
            class="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showClose: true,
})

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  if (props.showClose) {
    emit('close')
  }
}
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 0.2s ease;
}

.dialog-enter-from .relative,
.dialog-leave-to .relative {
  transform: scale(0.95);
}
</style>
