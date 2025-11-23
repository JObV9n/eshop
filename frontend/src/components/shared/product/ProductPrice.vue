<template>
    <div class="flex items-center justify-between">
        <p class="text-lg font-bold text-primary">
            {{ formatCurrency(price) }}
        </p>

        <Badge v-if="stock === 0" variant="destructive">Out of Stock</Badge>
        <Badge v-else-if="stock < 5" variant="outline">Low Stock</Badge>
    </div>
</template>

<script setup lang="ts">
import Badge from '@/components/ui/Badge.vue'
import { formatCurrency } from '@/lib/utils'

defineProps<{
    price: string
    stock: number
}>()
</script>
