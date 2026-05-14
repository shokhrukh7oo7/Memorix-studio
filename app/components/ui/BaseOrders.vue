<script setup lang="ts">
import type { OrderStatus } from "~/utils/albumStorage";

const props = defineProps<{
  image: string;
  title: string;
  status: OrderStatus;
  price: string;
}>();

function statusClass(status: OrderStatus): string {
  if (status === "Completed") return "completed";
  if (status === "Cancelled") return "cancelled";
  if (status === "Pending" || status === "Packing") return "pending";
  return "progress";
}
</script>

<template>
  <div class="my-orders-container">
    <NuxtLink to="/order-info" class="my-orders-item">
      <div class="my-order-image-wrapper">
        <img :src="image" alt="image" />
      </div>

      <div class="my-order-content-wrapper">
        <h6>{{ title }}</h6>

        <p :class="['status', statusClass(props.status)]">
          {{ status }}
        </p>

        <p class="price">{{ price }}</p>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
.status.progress {
  background-color: #fff7ed;
  color: #c2410c;
}

.status.cancelled {
  background-color: #fef2f2;
  color: #dc2626;
}
</style>


<!-- <script setup lang="ts">
defineProps<{
  image: string;
  title: string;
  status: "Pending" | "Completed";
  price: string;
}>();
</script>

<template>
  <div class="my-orders-container">
    <NuxtLink to="/order-info" class="my-orders-item">
      <div class="my-order-image-wrapper">
        <img :src="image" alt="image" />
      </div>

      <div class="my-order-content-wrapper">
        <h6>{{ title }}</h6>

        <p :class="['status', status === 'Pending' ? 'pending' : 'completed']">
          {{ status }}
        </p>

        <p class="price">{{ price }}</p>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped></style> -->
