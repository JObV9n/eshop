<template>
    <div class="flex items-center space-x-2">
        <div class="flex items-center">
            <Star v-for="i in 5" :key="i" :size="16" :class="[
                'fill-current',
                i <= Math.floor(parseFloat(rating))
                    ? 'text-yellow-400'
                    : 'text-gray-300'
            ]" />
        </div>

        <span class="text-sm text-muted-foreground">
            {{ rating }} ({{ numReviews }})
        </span>
    </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps<{
    rating: string
    numReviews: number
}>()
</script>
