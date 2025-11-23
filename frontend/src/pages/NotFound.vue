<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">404 - Page Not Found</h1>
    <p class="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
    <Button @click="$router.push('/')">Go Home</Button>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
</script>
