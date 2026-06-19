<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import BookCard from "~/components/ui/BookCard.vue";
import DetailSheet from "~/components/ui/DetailSheet.vue";
import BaseAccordion from "~/components/ui/BaseAccordion.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { useRouter } from "#app";
import type { BookCard as BookCardType } from "~/types";
import { useContent, type ApiTemplate } from "~/composables/useContent";

const router = useRouter();
const { getTemplates } = useContent();

const goBack = () => {
  router.back();
};

import arrowLeft from "~/assets/images/arrow-left.svg";
import searchIcon from "~/assets/images/search.svg";

const searchQuery = ref("");

// Состояние табов
type TabName = "Popular" | "Categories";
const activeTab = ref<TabName>("Popular");

// Состояние для DetailSheet (карточки)
const isSheetOpen = ref(false);
const selectedCard = ref<BookCardType | null>(null);

// Все шаблоны из API
const allTemplates = ref<ApiTemplate[]>([]);

const toCard = (t: ApiTemplate): BookCardType => ({
  id: t.id,
  title: t.title,
  colorName: t.colorName,
  description: t.description,
  images: t.images,
  pageOptions: t.pageOptions,
});

// Popular tab — qidiruv bo'yicha filtrlanadi
const cards = computed<BookCardType[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = allTemplates.value;
  const filtered = q
    ? list.filter((t) => t.title.toLowerCase().includes(q))
    : list;
  return filtered.map(toCard);
});

// Categories tab — kategoriyalar bo'yicha guruhlangan akkordeon (qidiruv bo'yicha filtrlanadi)
const accordionData = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const groups = new Map<string, string[]>();
  for (const t of allTemplates.value) {
    const cat = t.category?.name ?? "Boshqa";
    const matches =
      !q || t.title.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
    if (!matches) continue;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(t.title);
  }
  return Array.from(groups.entries()).map(([title, content]) => ({ title, content }));
});

const openDetails = (card: BookCardType) => {
  selectedCard.value = card;
  isSheetOpen.value = true;
};

onMounted(async () => {
  try {
    allTemplates.value = await getTemplates();
  } catch (e) {
    console.error("Shablonlarni yuklashda xatolik", e);
  }
});
</script>

<template>
  <div class="template-page-container">
    <div class="template-btn-wrapper">
      <!-- назад -->
      <div class="template-back-header">
        <BaseButton @click="goBack">
          <img :src="arrowLeft" alt="icon" />
        </BaseButton>
        <h2>Templates</h2>
      </div>
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
