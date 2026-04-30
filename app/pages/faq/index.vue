<script setup lang="ts">
import { useRouter } from "#app";
import BaseAccordion from "~/components/ui/BaseAccordion.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";

const router = useRouter();
const goBack = () => {
  router.back();
};

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
</script>

<template>
  <!-- faq section start -->
  <div class="faq-wrapper">
    <div class="faq-header">
      <BaseButton @click="goBack">
        <img :src="arrowLeft" alt="icon" />
      </BaseButton>
      <h2>Templates</h2>
    </div>

    <div class="faq-accordion">
      <BaseAccordion :items="accordionData" :defaultOpenIndex="0" />
    </div>
  </div>
  <!-- faq section end -->
</template>

<style lang="scss" scoped></style>
