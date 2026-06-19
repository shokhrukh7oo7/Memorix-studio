<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#app";
import BaseAccordion from "~/components/ui/BaseAccordion.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import { useContent } from "~/composables/useContent";

const router = useRouter();
const { getFaq } = useContent();
const goBack = () => {
  router.back();
};

const accordionData = ref<{ title: string; content: string }[]>([]);

onMounted(async () => {
  try {
    const faq = await getFaq();
    accordionData.value = faq.map((f) => ({ title: f.question, content: f.answer }));
  } catch (e) {
    console.error(e);
  }
});
</script>

<template>
  <!-- faq section start -->
  <div class="faq-wrapper">
    <div class="faq-header">
      <BaseButton @click="goBack">
        <img :src="arrowLeft" alt="icon" />
      </BaseButton>
      <h2>FAQ</h2>
    </div>

    <div class="faq-accordion">
      <BaseAccordion :items="accordionData" :defaultOpenIndex="0" />
    </div>
  </div>
  <!-- faq section end -->
</template>

<style lang="scss" scoped></style>
