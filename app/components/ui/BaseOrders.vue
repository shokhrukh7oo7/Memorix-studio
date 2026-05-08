<script setup lang="ts">
defineProps<{
  image: string;
  title: string;
  status: "Pending" | "Completed";
  price: string;
}>();
</script>

<template>
  <div class="my-orders-container">
    <div class="my-orders-item">
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
    </div>
  </div>
</template>

<style scoped></style>
