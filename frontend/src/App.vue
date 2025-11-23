<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div id="app">
    <RouterView />
    <Toast :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<style>
/* Global styles are in assets/index.css */
</style>
