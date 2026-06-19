<script setup lang="ts">
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { computed, useSlots } from "vue";

// props (по желанию можно расширять)
const props = defineProps<{
  slidesPerView?: number;
  spaceBetween?: number;
}>();

const modules = [Autoplay];

const slots = useSlots();
const slideCount = computed(() => {
  const nodes = slots.default?.() ?? [];
  let count = 0;
  for (const node of nodes) {
    if (Array.isArray(node.children)) count += node.children.length;
    else count += 1;
  }
  return count;
});
const enableLoop = computed(() => slideCount.value > (props.slidesPerView || 1) * 2);
</script>

<template>
  <ClientOnly>
    <Swiper
      :modules="modules"
      :slides-per-view="props.slidesPerView || 1"
      :space-between="props.spaceBetween || 10"
      :loop="enableLoop"
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
