<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import {
  loadUploadedPhotos,
  loadBookDraft,
  saveCart,
  type CartLine,
  type UploadedPhoto,
} from "~/utils/albumStorage";

import addToCardIcon from "~/assets/images/add-to-card.svg";

const router = useRouter();

const photos = ref<UploadedPhoto[]>([]);
const activeIndex = ref(0);

const draft = computed(() => loadBookDraft());

const activePhoto = computed(() => photos.value[activeIndex.value] ?? null);

const bookPages = computed(() => draft.value?.bookPages ?? 20);

onMounted(() => {
  photos.value = loadUploadedPhotos();
  if (!photos.value.length) {
    router.replace("/upload");
    return;
  }
  activeIndex.value = 0;
});

const goBack = () => {
  router.push("/upload/editor");
};

const addToCart = () => {
  const list = photos.value;
  if (!list.length) return;

  const d = draft.value;
  const title = d
    ? `${d.templateTitle} / ${d.colorName}`
    : "Custom travel book";

  const line: CartLine = {
    id: `cart-${Date.now()}`,
    coverDataUrl: String(list[0].url),
    title,
    bookPages: d?.bookPages ?? 20,
    photoCount: list.length,
    oldPrice: "$65.98",
    newPrice: "$32.99",
  };

  saveCart([line]);
  router.push("/cart");
};
</script>

<template>
  <div class="preview-design-page">
    <div class="template-page-container">
      <div class="template-back-header">
        <div class="template-btn-wrapper">
          <BaseButton @click="goBack">
            <img :src="arrowLeft" alt="Back" />
          </BaseButton>
          <h2>Back</h2>
        </div>
      </div>
    </div>

    <h1 class="preview-title">Preview your design</h1>
    <p class="preview-sub">
      Final checks before adding to cart — printed exactly as shown.
    </p>

    <div v-if="activePhoto" class="preview-spread">
      <div class="preview-spread-inner">
        <div class="preview-spread-left">
          <span>THIS PAGE CAN NOT BE EDITED.</span>
        </div>
        <div class="preview-spread-right">
          <img :src="String(activePhoto.url)" :alt="activePhoto.name" />
          <span class="preview-cap">Title</span>
          <span class="preview-cap muted">Enter text</span>
        </div>
      </div>
    </div>

    <div class="preview-strip" role="tablist" aria-label="Pages">
      <button
        v-for="(p, i) in photos"
        :key="`${p.name}-${i}`"
        type="button"
        class="preview-strip-item"
        :class="{ active: i === activeIndex }"
        @click="activeIndex = i"
      >
        <img :src="String(p.url)" :alt="p.name" />
      </button>
    </div>

    <div class="preview-sheet">
      <h6 class="preview-sheet-header">Order summary</h6>
      <div class="preview-book-info-wrapper">
        <div class="preview-book-info">
          <p class="preview-sheet-left">Book type & size</p>
          <p class="preview-sheet-right">{{ bookPages }} pages</p>
        </div>

        <div class="preview-book-info">
          <p class="preview-sheet-right">11.5" x 8.5" vertical hardcover</p>
          <p class="preview-sheet-left">$32.99</p>
        </div>
      </div>

      <div class="preview-book-info-wrapper">
        <div class="preview-book-info">
          <p class="preview-sheet-left">Additional pages</p>
          <p class="preview-sheet-right">0</p>
        </div>

        <div class="preview-book-info">
          <p class="preview-sheet-right">0 x gloss paper</p>
          <p class="preview-sheet-left">$0</p>
        </div>
      </div>
      <!-- <p class="preview-sheet-line">
        <strong>11.5″ × 8.5″ vertical hardcover</strong>
      </p>
      <p class="preview-sheet-line">{{ bookPages }} pages</p>
      <p class="preview-sheet-line price">$32.99</p>
      <p class="preview-sheet-muted">Additional pages: 0 × gloss paper — $0</p> -->

      <BaseButton class="preview-add-cart" @click="addToCart">
        <img :src="addToCardIcon" alt="icon" />
        Add to cart
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.preview-title {
  font-size: 24px;
  font-weight: 500;
  font-family: var(--font-work);
  color: var(--black-color);
  margin: 8px 0;
  line-height: 100%;
}

.preview-sub {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-work);
  color: var(--black-grey-color);
  width: 100%;
  max-width: 250px;
  line-height: 100%;
}

.preview-spread {
  display: flex;
  gap: 2px;
  background: var(--bg-color);
  border-radius: var(--border-radius-circular);
  padding: 4px;
  width: 100%;
  max-width: 760px;
  margin: 35px 0;
  aspect-ratio: 16 / 13.5;
}

.preview-spread-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 180px;
}

.preview-spread-left {
  background-color: var(--bg-color-card) !important;
  color: var(--white-color);
  border-top-left-radius: var(--border-radius-circular);
  border-bottom-left-radius: var(--border-radius-circular);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.preview-spread-right {
  flex: 1;
  background: #ececec;
  position: relative;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 180px;
}

.preview-spread-right img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}

.preview-cap {
  position: relative;
  z-index: 1;
  font-size: 16px;
  font-weight: 500;
  font-family: var(--font-work);
  color: var(--black-color);
}

.preview-cap.muted {
  font-size: 12px;
  font-weight: 400;
  color: var(--black-color);
  margin-top: 4px;
}

.preview-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-snap-type: x mandatory;
}

.preview-strip-item {
  flex: 0 0 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  scroll-snap-align: start;
  background: #fff;
}

.preview-strip-item.active {
  border-color: var(--btn-color);
}

.preview-strip-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-sheet {
  margin-top: 8px;
  padding: 20px 16px;
  border-radius: var(--border-radius-default);
  border: 1px solid var(--temp-border-color);
  background: var(--white-color);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
}

.preview-sheet-header {
  font-size: 14px;
  font-weight: 400;
  color: var(--black-grey-color);
  font-family: var(--font-jet);
  line-height: 100%;
}

.preview-book-info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0;
  padding: 5px 0;
  border-bottom: 1px solid var(--temp-border-color);
}
.preview-book-info-wrapper .preview-book-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.preview-book-info-wrapper .preview-book-info .preview-sheet-left {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-work);
  color: var(--black-color);
}

.preview-book-info-wrapper .preview-book-info .preview-sheet-right {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-work);
  color: var(--black-color);
}

/* .preview-sheet-line {
  margin: 0 0 4px;
  font-size: 14px;
  font-family: var(--font-work);
  color: var(--black-color);
}

.preview-sheet-line.price {
  font-weight: 700;
  margin-top: 8px;
}

.preview-sheet-muted {
  font-size: 12px;
  color: var(--black-grey-color);
  font-family: var(--font-work);
  margin: 8px 0 16px;
} */

.preview-add-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 14px;
  margin-top: 24px;
}

.preview-add-cart :deep(.btn) {
  width: 100%;
}
</style>
