<script setup lang="ts">
import arrow from "~/assets/images/arrows-out.svg";

import type { BookCard } from "~/types";
defineProps<{ card: BookCard }>();
defineEmits(["details"]);
</script>

<template>
  <div class="best-seller-container" @click="$emit('details', card)">
    <div class="best-seller-image-wrapper">
      <img :src="card.images[0]" :alt="card.title" />
      <button class="expand-btn">
        <img :src="arrow" alt="icon" class="arrow-icon" />
      </button>
    </div>
    <div class="best-seller-content-wrapper">
      <h6 class="slide-text">{{ card.title }} / {{ card.colorName }}</h6>
      <p class="slide-description">{{ card.description }}</p>
    </div>
  </div>
</template>

<style scoped></style>
