<script setup lang="ts">
import { ref, onMounted } from "vue";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import trash from "~/assets/images/trash.svg";

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
const fileInput = ref<HTMLInputElement | null>(null);

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

const openUpload = () => {
  fileInput.value?.click();
};

const addPhotos = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (!target.files) return;

  const selectedFiles = Array.from(target.files);

  const readers = selectedFiles.map((file) => {
    return new Promise<UploadedPhoto>((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          name: file.name,
          url: reader.result,
        });
      };

      reader.readAsDataURL(file);
    });
  });

  Promise.all(readers).then((newImages) => {
    // добавляем новые фото рядом со старыми
    photos.value = [...photos.value, ...newImages];

    localStorage.setItem("uploadedPhotos", JSON.stringify(photos.value));
  });
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
        <BaseButton size="md" @click="openUpload"> + Add photos </BaseButton>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          hidden
          @change="addPhotos"
        />
      </div>
    </div>
  </div>

  <div class="upload-gallery">
    <div v-for="(photo, index) in photos" :key="index" class="photo-card">
      <button class="delete-btn" @click="removePhoto(index)">
        <img :src="trash" alt="icon" />
      </button>

      <img :src="String(photo.url)" :alt="photo.name" />
    </div>
  </div>

  <div class="create-photo-album">
    <BaseButton>Create photo album</BaseButton>
  </div>
</template>

<style scoped></style>
