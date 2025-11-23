<template>
  <MainLayout>
    <div class="container max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">My Orders</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Profile Navigation -->
        <aside class="md:col-span-1">
          <Card class="p-4">
            <nav class="space-y-2">
              <RouterLink
                to="/user/profile"
                class="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Profile
              </RouterLink>
              <RouterLink
                to="/user/orders"
                class="block px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground"
              >
                My Orders
              </RouterLink>
            </nav>
          </Card>
        </aside>

        <!-- Orders List -->
        <div class="md:col-span-2">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <p class="text-muted-foreground">Loading orders...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-destructive">{{ error }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="orders.length === 0" class="text-center py-12">
            <p class="text-muted-foreground mb-4">You haven't placed any orders yet</p>
            <RouterLink to="/search">
              <Button>Start Shopping</Button>
            </RouterLink>
          </div>

          <!-- Orders List -->
          <div v-else class="space-y-4">
            <Card
              v-for="order in orders"
              :key="order.id"
              class="p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sm text-muted-foreground">Order ID</p>
                  <p class="font-semibold">{{ order.id.substring(0, 8) }}...</p>
                </div>
                <Badge
                  :variant="
                    order.isPaid ? 'default' : 
                    order.isDelivered ? 'secondary' : 
                    'outline'
                  "
                >
                  {{ getOrderStatus(order) }}
                </Badge>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Order Date</p>
                  <p>{{ formatDate(order.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Total</p>
                  <p class="font-semibold">${{ formatCurrency(order.totalPrice) }}</p>
                </div>
              </div>

              <div class="mb-4">
                <p class="text-sm text-muted-foreground mb-2">
                  {{ order.items?.length || 0 }} item(s)
                </p>
                <div class="flex -space-x-2">
                  <div
                    v-for="(item, index) in order.items?.slice(0, 3)"
                    :key="index"
                    class="w-12 h-12 rounded-lg overflow-hidden border-2 border-background"
                  >
                    <img
                      :src="item.product?.images?.[0] || '/images/placeholder.jpg'"
                      :alt="item.product?.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-if="(order.items?.length || 0) > 3"
                    class="w-12 h-12 rounded-lg bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold"
                  >
                    +{{ (order.items?.length || 0) - 3 }}
                  </div>
                </div>
              </div>

              <RouterLink :to="`/user/orders/${order.id}`">
                <Button variant="outline" class="w-full">
                  View Order Details
                </Button>
              </RouterLink>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { formatCurrency } from '@/lib/utils'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Card from '@/components/ui/Card.vue'

const orderStore = useOrderStore()

const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getOrderStatus = (order: any) => {
  if (order.isDelivered) return 'Delivered'
  if (order.isPaid) return 'Paid'
  return 'Pending Payment'
}

onMounted(async () => {
  try {
    loading.value = true
    orders.value = await orderStore.fetchOrders()
  } catch (err: any) {
    error.value = 'Failed to load orders'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
