<script setup lang="ts">
import { ref } from "vue";
import BookCard from "~/components/ui/BookCard.vue";
import DetailSheet from "~/components/ui/DetailSheet.vue";
import BaseAccordion from "~/components/ui/BaseAccordion.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { useRouter } from "#app";
import type { BookCard as BookCardType } from "~/types";

const router = useRouter();

const goBack = () => {
  router.back();
};

// Импорт изображений для карточек
import best1 from "~/assets/images/swiper/bestSeller-1.png";
import best2 from "~/assets/images/swiper/bestSeller-2.png";
import best3 from "~/assets/images/swiper/bestSeller-3.png";
import arrowLeft from "~/assets/images/arrow-left.svg";
import searchIcon from "~/assets/images/search.svg";

const searchQuery = ref("");

// Состояние табов
type TabName = "Popular" | "Categories";
const activeTab = ref<TabName>("Popular");

// Состояние для DetailSheet (карточки)
const isSheetOpen = ref(false);
const selectedCard = ref<BookCardType | null>(null);

// Данные для таба "Popular"
const cards = ref<BookCardType[]>([
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best1, best2, best3],
  },
  {
    id: 2,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best2, best3, best1],
  },
  {
    id: 3,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best3, best2, best1],
  },
  {
    id: 4,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best1, best2, best3],
  },
]);

// Данные для таба "Categories" (Аккордеон)
const accordionData = [
  {
    title: "Travel",
    content: ["Kazakhstan", "Turkey", "Egypt", "Thailand", "Vietnam", "China"],
  },
  {
    title: "Family",
    content: "Detailed guide on how to manage your books...",
  },
  {
    title: "Events",
    content: ["Feature 1", "Feature 2", "Feature 3"],
  }, // Пример со списком
  {
    title: "Holidays",
    content: "We offer various flexible plans for everyone.",
  },
];

const openDetails = (card: BookCardType) => {
  selectedCard.value = card;
  isSheetOpen.value = true;
};
</script>

<template>
  <div class="template-page-container">
    <!-- назад -->
    <div class="template-back-header">
      <BaseButton @click="goBack">
        <img :src="arrowLeft" alt="icon" />
      </BaseButton>
      <h2>Templates</h2>
    </div>

    <!-- таб -->
    <div class="tabs-nav">
      <button
        :class="['tab-btn', { active: activeTab === 'Popular' }]"
        @click="activeTab = 'Popular'"
      >
        Popular
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'Categories' }]"
        @click="activeTab = 'Categories'"
      >
        Categories
      </button>
    </div>

    <!-- Контент таб -->
    <div class="tabs-content">
      <!-- ТАБ: POPULAR ( Карточки) -->
      <div v-if="activeTab === 'Popular'" class="template-grid-fade">
        <div class="template-page-wrapper">
          <BookCard
            v-for="item in cards"
            :key="item.id"
            :card="item"
            @details="openDetails"
          />
        </div>
      </div>

      <!-- ТАБ: CATEGORIES (Аккордеон) -->
      <div v-if="activeTab === 'Categories'" class="categories-fade">
        <!-- ПОИСК: Теперь он только здесь, между табами и аккордеоном -->
        <div class="search-wrapper">
          <div class="search-input-container">
            <img :src="searchIcon" alt="search" class="search-icon" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search..."
              class="search-input"
            />
          </div>
        </div>

        <div class="faq-wrapper">
          <div class="faq-accordion">
            <BaseAccordion :items="accordionData" :defaultOpenIndex="0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Общие компоненты -->
    <DetailSheet
      :is-open="isSheetOpen"
      :card="selectedCard"
      @close="isSheetOpen = false"
    />
  </div>
</template>

<style scoped></style>
<!-- <script setup lang="ts">
import BookCard from "~/components/ui/BookCard.vue";
import DetailSheet from "~/components/ui/DetailSheet.vue";
import type { BookCard as BookCardType } from "~/types";

import best1 from "~/assets/images/swiper/bestSeller-1.png";
import best2 from "~/assets/images/swiper/bestSeller-2.png";
import best3 from "~/assets/images/swiper/bestSeller-3.png";

const isSheetOpen = ref(false);
const selectedCard = ref<BookCardType | null>(null);

// Пример данных
const cards = ref<BookCardType[]>([
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best1, best2, best3],
  },
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best2, best3, best1],
  },
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best3, best2, best1],
  },
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best1, best2, best3],
  },
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best2, best2, best1],
  },
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [best3, best2, best1],
  },
  // ... другие карточки
]);

const openDetails = (card: BookCardType) => {
  selectedCard.value = card;
  isSheetOpen.value = true;
};
</script>

<template>
  <div class="template-page-wrapper">
    <BookCard
      v-for="item in cards"
      :key="item.id"
      :card="item"
      @details="openDetails"
    />
  </div>

  <DetailSheet
    :is-open="isSheetOpen"
    :card="selectedCard"
    @close="isSheetOpen = false"
  />
</template>

<style scoped></style> -->
