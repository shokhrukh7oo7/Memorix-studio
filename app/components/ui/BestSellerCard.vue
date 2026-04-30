<script setup lang="ts">
defineProps<{
  image: string;
  text: string;
  description?: string;
}>();
</script>

<template>
  <div class="best-seller-container">
    <div class="best-seller-image-wrapper">
      <img :src="image" :alt="text" />
    </div>

    <div class="best-seller-content-wrapper">
      <h6 class="slide-text">{{ text }}</h6>
      <p v-if="description" class="slide-description">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style></style>
