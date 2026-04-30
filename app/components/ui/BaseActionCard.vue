<script setup lang="ts">
import BaseButton from "./BaseButton.vue";

defineProps<{
  image: string;
  text: string;
  buttonText: string;
}>();

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>

<template>
  <div class="template-container">
    <div class="template-content-wrapper">
      <h1>{{ text }}</h1>
      <BaseButton size="sm" @click="emit('action')">
        {{ buttonText }}
      </BaseButton>
    </div>
    <div class="template-image-wrapper">
      <img :src="image" :alt="text" />
    </div>
  </div>
</template>

<style></style>
