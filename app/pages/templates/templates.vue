<script setup lang="ts">
import { ref } from "vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import logoBlack from "~/assets/images/logo-black.png";
import { useRouter } from "#app";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="template-page-container">
    <div class="template-back-header">
      <div class="template-btn-wrapper">
        <BaseButton @click="goBack">
          <img :src="arrowLeft" alt="icon" />
        </BaseButton>

        <h2>Back</h2>
      </div>

      <div class="template-logo-wrapper">
        <img :src="logoBlack" alt="logo" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
