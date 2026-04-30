<script setup lang="ts">
import arrow from "~/assets/images/arrow.svg";
defineProps<{
  title: string;
  //   content: string;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
}>();
</script>

<template>
  <div class="accordion-item">
    <div
      class="accordion-header"
      :class="{ active: isOpen }"
      @click="emit('toggle')"
    >
      <h6>{{ title }}</h6>

      <span class="icon">
        <img :src="arrow" alt="arrow" :class="{ rotate: isOpen }" />
      </span>
    </div>

    <transition name="accordion">
      <div v-if="isOpen" class="accordion-content">
        <!-- {{ content }} -->
        <slot />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.accordion-item {
  border-bottom: 1px solid var(--display-grey-color);
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  padding: 14px 10px;
  cursor: pointer;
  transition: 0.3s;
}

.accordion-header.active {
  background: #ff4a351a;
}

.accordion-header h6 {
  font-size: 16px;
  font-weight: 500;
  color: var(--black-color);
  font-family: var(--font-work);
}

.accordion-header img {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.accordion-content {
  padding: 10px;
  font-size: 12px;
  font-weight: 400;
  font-family: var(--font-work);
  color: var(--black-color);
}

.rotate {
  transform: rotate(180deg);
}

/* анимация */
/* .accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
} */

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
