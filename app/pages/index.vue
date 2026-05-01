<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseSwiper from "~/components/ui/BaseSwiper.vue";
import BestSellerCard from "~/components/ui/BestSellerCard.vue";
import BaseActionCard from "~/components/ui/BaseActionCard.vue";
import { SwiperSlide } from "swiper/vue";
import { useTimer } from "~/composables/useTimer";
import BaseAccordion from "~/components/ui/BaseAccordion.vue";

import BookCard from "~/components/ui/BookCard.vue";
import DetailSheet from "~/components/ui/DetailSheet.vue";
import type { BookCard as BookCardType } from "~/types";

const slidesBrightness = ref<Record<number, string>>({});

// Best seller swiper detail code
const isSheetOpen = ref(false);
const selectedCard = ref<BookCardType | null>(null);

const openDetails = (card: BookCardType) => {
  selectedCard.value = card;
  isSheetOpen.value = true;
};
const bestSellersSlides = ref<BookCardType[]>([
  {
    id: 1,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [bestSeller1, bestSeller2, bestSeller3],
  },
  {
    id: 2,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [bestSeller2, bestSeller3, bestSeller1],
  },
  {
    id: 3,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [bestSeller3, bestSeller2, bestSeller1],
  },
  {
    id: 4,
    title: "Always you",
    colorName: "Burgundy",
    description: "Most popular template for your travel book",
    images: [bestSeller1, bestSeller2, bestSeller3],
  },
  // ... другие карточки
]);

// 8 марта (год можно менять динамически)
const targetDate = new Date("2026-03-08T00:00:00");
// const targetDate = new Date("2026-12-31T23:59:59");

const { days, hours, minutes, seconds } = useTimer(targetDate);

// импорт фоток
import bannerImg from "~/assets/images/banner.png";

import tempCard1 from "~/assets/images/temp-1.png";
import tempCard2 from "~/assets/images/temp-2.png";

import cat1 from "~/assets/images/swiper/cat-1.png";
import cat2 from "~/assets/images/swiper/cat-2.png";
import cat3 from "~/assets/images/swiper/cat-3.png";
import cat4 from "~/assets/images/swiper/cat-4.png";

import country1 from "~/assets/images/swiper/country-1.png";
import country2 from "~/assets/images/swiper/country-2.png";
import country3 from "~/assets/images/swiper/country-3.png";
import country4 from "~/assets/images/swiper/country-4.png";

import bestSeller1 from "~/assets/images/swiper/bestSeller-1.png";
import bestSeller2 from "~/assets/images/swiper/bestSeller-2.png";
import bestSeller3 from "~/assets/images/swiper/bestSeller-3.png";

import st1 from "~/assets/images/swiper/st-1.png";
import st2 from "~/assets/images/swiper/st-2.png";
import st3 from "~/assets/images/swiper/st-3.png";

import delivery1 from "~/assets/images/swiper/delivery-1.jpg";
import delivery2 from "~/assets/images/swiper/location-2.png";

import quality from "~/assets/images/quality.png";
import icon from "~/assets/images/shooting-star.svg";
import comingSoon from "~/assets/images/coming-soon.png";

const templateCard = [
  {
    id: 1,
    image: tempCard1,
    text: "Use templates",
    buttonText: "Choose template",
    action: () => {
      navigateTo("/auth/OtpPage");
    },
  },
  {
    id: 2,
    image: tempCard2,
    text: "Start from scratch",
    buttonText: "Upload images",
    action: () => {
      console.log("upload image opened");
      // тут потом открываешь file input
    },
  },
];

const categorySlides = [
  { id: 1, image: cat1, text: "Travel" },
  { id: 2, image: cat2, text: "Event" },
  { id: 3, image: cat3, text: "Birthday" },
  { id: 4, image: cat4, text: "Wedding" },
  { id: 5, image: cat1, text: "Travel" },
  { id: 6, image: cat2, text: "Event" },
];

const countrySlides = [
  { id: 1, image: country1, text: "Egypt" },
  { id: 2, image: country2, text: "Thailand" },
  { id: 3, image: country3, text: "Turkey" },
  { id: 4, image: country4, text: "Vietnam" },
  { id: 5, image: country1, text: "Egypt" },
  { id: 6, image: country2, text: "Thailand" },
];

const deliverySlides = [
  {
    id: 1,
    image: delivery1,
    text: "FREE DELIVERY TO YOUR REGION",
    btnText: "Show list",
    isDark: true,
  },
  {
    id: 2,
    image: delivery2,
    text: "DELIVERY TERMS",
    btnText: "Read more",
    isDark: false,
  },
  {
    id: 3,
    image: delivery1,
    text: "FREE DELIVERY TO YOUR REGION",
    btnText: "Show list",
    isDark: false,
  },
  {
    id: 4,
    image: delivery2,
    text: "DELIVERY TERMS",
    btnText: "Read more",
    isDark: false,
  },
];

const templateSlides = [
  {
    id: 1,
    image: st1,
    text: "Choose your template",
    description:
      "You can fully customize every template in our easy to use editor online! No app needed!",
  },
  {
    id: 2,
    image: st2,
    text: "upload your photos",
    description:
      "We’ll instantly organize your photos into a cohesive, well-designed story. You can also use Auto Create for faster uploads!",
  },
  {
    id: 3,
    image: st3,
    text: "Customize your book",
    description:
      "Easily change fonts, backgrounds, colors, shapes, stickers, and more to make it truly yours and memorable!",
  },
  {
    id: 4,
    image: st1,
    text: "Choose your template",
    description:
      "You can fully customize every template in our easy to use editor online! No app needed!",
  },
];
// для подключение к API - просто заменяем categorySlides
// const { data: categorySlides } = await useFetch('/api/slides')
onMounted(async () => {
  for (const item of deliverySlides) {
    const brightness = await getBrightness(item.image);
    slidesBrightness.value[item.id] = brightness;
  }
});

const accordionData = [
  {
    title: "How it works?",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Step-by-step guide",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Features overview",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "User benefits",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Technical details",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Common FAQs",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Troubleshooting tips",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Security measures",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Integration options",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Pricing plans",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
  {
    title: "Customer testimonials",
    content:
      "Online album generators let you create photo albums quickly by uploading your pictures, choosing a layout, and customizing the design. They automatically arrange your photos and provide easy sharing options.",
  },
];

const goTemplate = () => {
  navigateTo("/templates");
};
</script>

<template>
    <!-- banner section end -->
    <div class="banner-wrapper">
      <div class="banner">
        <img :src="bannerImg" alt="banner" class="banner-img" />

        <div class="banner-overlay">
          <h2 class="banner-title">International Woman’s Day</h2>
          <p class="banner-subtitle">
            Celebrate women with a gift as special as she is
          </p>

          <div class="banner-btn-wrapper">
            <BaseButton class="banner-btn" size="sm" @click="goTemplate"
              >Shop now</BaseButton
            >
          </div>

          <div class="date-wrapper">
            <p class="banner-promo">
              30% off with promo code <strong>8MARCH</strong>
            </p>

            <div class="banner-timer">
              <div class="time-box">{{ days }}d</div>
              <div class="time-box">{{ hours }}h</div>
              <div class="time-box">{{ minutes }}m</div>
              <div class="time-box">{{ seconds }}s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- banner section start -->

    <!-- template section start -->
    <div class="template-wrapper">
      <BaseActionCard
        v-for="item in templateCard"
        :key="item.id"
        :image="item.image"
        :text="item.text"
        :button-text="item.buttonText"
        @action="item.action"
      />
    </div>
    <!-- template section end -->
  <!-- swiper section start -->
  <div class="swiper-container-wrapper">
    <!-- Categories section start -->
    <div class="category-swiper-wrapper">
      <div class="category-swiper-header">
        <h3>Categories</h3>
      </div>

      <BaseSwiper :slidesPerView="3.5" :spaceBetween="20">
        <SwiperSlide v-for="item in categorySlides" :key="item.id">
          <img :src="item.image" :alt="item.text" />
          <div class="slide-text">{{ item.text }}</div>
        </SwiperSlide>
      </BaseSwiper>
    </div>
    <!-- Categories section start -->

    <!-- Countries section start -->
    <div class="country-swiper-wrapper">
      <div class="country-swiper-header">
        <h3>Countries</h3>
      </div>

      <BaseSwiper :slidesPerView="3.5" :spaceBetween="20">
        <SwiperSlide v-for="item in countrySlides" :key="item.id">
          <img :src="item.image" :alt="item.text" />
          <div class="slide-text">{{ item.text }}</div>
        </SwiperSlide>
      </BaseSwiper>
    </div>
    <!-- Countries section end -->

    <!-- Best sellers section start -->
    <div class="best-sellers-swiper-wrapper">
      <div class="best-sellers-swiper-header">
        <h3>Best Sellers</h3>
      </div>

      <BaseSwiper :slidesPerView="2.2" :spaceBetween="10">
        <SwiperSlide v-for="item in bestSellersSlides" :key="item.id">
          <BookCard :card="item" @details="openDetails" />
        </SwiperSlide>
      </BaseSwiper>
      <DetailSheet
        :is-open="isSheetOpen"
        :card="selectedCard"
        @close="isSheetOpen = false"
      />
    </div>
    <!-- Best sellers section end -->

    <!-- Delivery section start -->
    <div class="delivery-swiper-wrapper">
      <BaseSwiper :slidesPerView="1.1" :spaceBetween="20">
        <SwiperSlide v-for="item in deliverySlides" :key="item.id">
          <img :src="item.image" :alt="item.text" />
          <div class="best-seller-content-wrapper">
            <h6 :class="['slide-text', slidesBrightness[item.id]]">
              {{ item.text }}
            </h6>
            <BaseButton>{{ item.btnText }}</BaseButton>
          </div>
        </SwiperSlide>
      </BaseSwiper>
    </div>
    <!-- Delivery section end -->
  </div>
  <!-- swiper section end -->

  <!-- quality album section start -->
  <div class="quality-album-wrapper">
    <div class="quality-container">
      <img :src="quality" alt="quality" class="quality-image" />
      <div class="quality-content-wrapper">
        <div class="quality-top">
          <img :src="icon" alt="icon" />
          <p>High Quality Prints</p>
        </div>

        <h2>Beautiful quality for beautiful moments</h2>
        <p class="quality-description">
          Oreserve your cherished momets in a beautifully crafted photobook that
          captures the essence of your adventures.
        </p>
      </div>
    </div>
  </div>
  <!-- quality album section end -->

  <!-- coming soon section start -->
  <div class="coming-soon-wrapper">
    <div class="coming-soon-container">
      <img :src="comingSoon" alt="coming soon" />
      <div class="coming-soon-content-wrapper">
        <h2>Personalized photo books and gifts</h2>
        <BaseButton size="sm">COMING SOON </BaseButton>
      </div>
    </div>
  </div>
  <!-- coming soon section end -->

  <!-- swiper template section start -->
  <div class="swiper-template-wrapper">
    <div class="swiper-template-content-wrapper">
      <h2>It's easy as 1, 2, 3 to create your photobook</h2>
      <p>
        With Memorix, you can easily transform your holiday photos into a
        stunning photobook that captures the essence of your journey. Simply
        upload your images, customize the layout, and add captions to create a
        unique keepsake that will transport you back to those special moments.
      </p>
    </div>

    <div class="swiper-container-wrapper">
      <div class="best-sellers-swiper-wrapper">
        <BaseSwiper :slidesPerView="1.1" :spaceBetween="10">
          <SwiperSlide v-for="item in templateSlides" :key="item.id">
            <BestSellerCard
              :image="item.image"
              :text="item.text"
              :description="item.description"
            />
          </SwiperSlide>
        </BaseSwiper>
      </div>
    </div>
  </div>
  <!-- swiper template section end -->

  <!-- faq section start -->
  <div class="faq-wrapper">
    <div class="faq-header">
      <h2>FAQ</h2>
    </div>

    <div class="faq-accordion">
      <BaseAccordion :items="accordionData" :defaultOpenIndex="0" />
    </div>
  </div>
  <!-- faq section end -->
</template>

<style scoped></style>
