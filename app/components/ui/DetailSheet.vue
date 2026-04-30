<script setup lang="ts">
// import type { BookCard } from '~/types'
import type { BookCard } from "~/types/index";

const props = defineProps<{
  isOpen: boolean;
  card: BookCard | null;
}>();

const emit = defineEmits(["close"]);
const activeIndex = ref(0);

// Сброс индекса при открытии новой карточки
watch(
  () => props.card,
  () => (activeIndex.value = 0),
);

const close = () => emit("close");
</script>

<template>
  <div class="detail-page-wrapper">
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" class="overlay" @click="close"></div>
      </Transition>

      <Transition name="slide">
        <div v-if="isOpen" class="sheet">
          <div class="drag-handle"></div>

          <div class="content" v-if="card">
            <div class="main-image">
              <img :src="card.images[activeIndex]" :alt="card.title" />
            </div>

            <div class="thumbnails">
              <div
                v-for="(img, idx) in card.images"
                :key="idx"
                class="thumb"
                :class="{ active: activeIndex === idx }"
                @click="activeIndex = idx"
              >
                <img :src="img" />
              </div>
            </div>

            <div class="details">
              <h2>{{ card.title }} / {{ card.colorName }}</h2>
              <p class="desc">{{ card.description }}</p>

              <div class="pages-selector">
                <span>Number of pages</span>
                <div class="chips">
                  <button
                    v-for="p in [20, 30, 40]"
                    :key="p"
                    :class="{ active: p === 20 }"
                  >
                    {{ p }}
                  </button>
                </div>
              </div>

              <button class="details-submit-btn">Choose template</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}
.sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  height: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 101;
  padding: 16px;
  width: 100%;
  max-width: 395px;
}
.drag-handle {
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 0 auto 20px;
}
.main-image {
  width: 100%;
  /* height: 300px; */
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.main-image img {
  width: 100%;
  max-width: 361px;
  height: 100%;
  object-fit: contain;
}

.thumbnails {
  display: flex;
  gap: 8px;
  justify-content: start;
  margin-bottom: 24px;
}
.thumb {
  /* width: 64px;
  height: 64px; */
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
.thumb.active {
  border-color: #ff4d35;
}
.thumb img {
  /* width: 100%;
  height: 100%; */
  width: 64px;
  height: 64px;
  display: flex;
  object-fit: contain;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translate(-50%, 100%);
}

.details h2 {
  font-size: 24px;
  font-weight: 500;
  font-family: var(--font-work);
  line-height: 100%;
  color: var(--black-color);
  margin-bottom: 12px;
}
.details p {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-work);
  line-height: 120%;
  color: var(--black-grey-color);
}
.pages-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
}
.pages-selector span {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-work);
  color: var(--black-color);
  line-height: 120%;
}
.pages-selector .chips {
  display: flex;
  flex-direction: row;
  gap: 8px;
}
.pages-selector .chips button {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-jet);
  padding: 12px;
  background-color: var(--white-color);
  border: 1px solid var(--btn-color);
}
.pages-selector .chips button.active {
  background-color: var(--btn-color);
  color: var(--white-color);
}

.details-submit-btn {
  width: 100%;
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-jet);
  background: var(--btn-color);
  color: var(--white-color);
  border: none;
  padding: 12px;
}
</style>
