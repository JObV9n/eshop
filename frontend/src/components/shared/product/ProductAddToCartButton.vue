<template>
    <Button class="w-full" :disabled="stock === 0 || loading" @click.prevent="add">
        {{ stock === 0 ? "Out of Stock" : loading ? "Adding..." : "Add to Cart" }}
    </Button>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { ref } from 'vue'

const props = defineProps<{
    productId: string
    name: string
    slug: string
    image: string
    price: string
    stock: number
    qty?: number
}>()

const loading = ref(false)

const authStore = useAuthStore()
const cartStore = useCartStore()
const toast = useToast()

const add = async () => {
    if (props.stock === 0) return

    loading.value = true
    try {
        await cartStore.addToCart(
            {
                productId: props.productId,
                name: props.name,
                slug: props.slug,
                qty: props.qty ?? 1, // default set to one for Adding from the Home page 
                image: props.image,
                price: props.price,
            },
            authStore.isAuthenticated
        )
        toast.success('Product added to cart')
    } catch (e) { }
    finally {
        loading.value = false
    }
}
</script>
