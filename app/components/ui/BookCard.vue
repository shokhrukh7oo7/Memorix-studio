<script setup lang="ts">
import { computed } from "vue";
import arrow from "~/assets/images/arrows-out.svg";
import type { BookCard } from "~/types";

const props = defineProps<{ card: BookCard }>();
defineEmits(["details"]);

const colorMap: Record<string, string> = {
  Burgundy: "#7B2D42",
  "Rose Pink": "#E8748A",
  "Navy Blue": "#1B3A6B",
  Golden: "#C49A2A",
  "Forest Green": "#2D6A4F",
  Coral: "#FF6B6B",
};

const accentColor = computed(
  () => colorMap[props.card.colorName] ?? "#ff4a35",
);
</script>

<template>
  <div class="best-seller-container" @click="$emit('details', card)">
    <div class="template-accent-bar" :style="{ background: accentColor }"></div>

    <div class="best-seller-image-wrapper">
      <img :src="card.images[0]" :alt="card.title" />
      <button class="expand-btn" @click.stop="$emit('details', card)">
        <img :src="arrow" alt="icon" class="arrow-icon" />
      </button>
    </div>

    <div v-if="card.images.length > 1" class="template-spreads-preview">
      <div
        v-for="(img, idx) in card.images.slice(1, 3)"
        :key="idx"
        class="spread-thumb"
      >
        <img :src="img" :alt="`Spread ${idx + 1}`" />
      </div>
    </div>

    <div class="best-seller-content-wrapper">
      <div class="template-name-row">
        <h6 class="slide-text">{{ card.title }}</h6>
        <span class="color-dot" :style="{ background: accentColor }"></span>
      </div>
      <p class="slide-description">{{ card.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.template-accent-bar {
  width: 100%;
  height: 4px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 8px;
}

.template-spreads-preview {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.spread-thumb {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebebeb;
}

.spread-thumb img {
  width: 100%;
  height: 38px;
  object-fit: cover;
  display: block;
}

.template-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
