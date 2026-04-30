<script setup lang="ts">
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// props (по желанию можно расширять)
const props = defineProps<{
  slidesPerView?: number;
  spaceBetween?: number;
}>();

const modules = [Autoplay];
</script>

<template>
  <ClientOnly>
    <Swiper
      :modules="modules"
      :slides-per-view="props.slidesPerView || 1"
      :space-between="props.spaceBetween || 10"
      :loop="true"
      :autoplay="{
        delay: 2000,
        disableOnInteraction: false,
      }"
      navigation
      pagination
      class="my-swiper"
    >
      <!-- slot для слайдов -->
      <slot />
    </Swiper>
  </ClientOnly>
</template>

<style scoped>
.my-swiper {
  width: 100%;
}
</style>
