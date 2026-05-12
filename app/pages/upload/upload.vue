<script setup lang="ts">
import { ref, onMounted } from "vue";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import logoBlack from "~/assets/images/logo-black.png";

import { useRouter } from "#app";

const router = useRouter();

const goBack = () => {
  router.back();
};

interface UploadedPhoto {
  name: string;
  url: string | ArrayBuffer | null;
}

const photos = ref<UploadedPhoto[]>([]);

onMounted(() => {
  const savedPhotos = localStorage.getItem("uploadedPhotos");

  if (savedPhotos) {
    photos.value = JSON.parse(savedPhotos);
  }
});

const removePhoto = (index: number) => {
  photos.value.splice(index, 1);

  localStorage.setItem("uploadedPhotos", JSON.stringify(photos.value));
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

  <div class="upload-gallery">
    <div v-for="(photo, index) in photos" :key="index" class="photo-card">
      <button class="delete-btn" @click="removePhoto(index)">🗑</button>

      <img :src="String(photo.url)" :alt="photo.name" />
    </div>
  </div>
</template>

<style scoped>
.upload-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 30px;
}

.photo-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
}

.photo-card img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.delete-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  z-index: 2;
}
</style>
