<script setup lang="ts">
import { ref } from "vue";
import Swal from "sweetalert2";
import arrowLeft from "~/assets/images/arrow-left.svg";
import logoBlack from "~/assets/images/logo-black.png";
import BaseButton from "~/components/ui/BaseButton.vue";

import { useRouter } from "#app";

const router = useRouter();

const goBack = () => {
  router.back();
};

const pageCount = ref<number | null>(null);

const fileInput = ref<HTMLInputElement | null>(null);

const openUpload = () => {
  if (!pageCount.value || pageCount.value <= 0) return;

  fileInput.value?.click();
};

const onUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (!target.files) return;

  const selectedFiles = Array.from(target.files);

  // Проверяем количество
  if (selectedFiles.length !== pageCount.value) {
    Swal.fire({
      icon: "warning",
      title: "Wrong photo count",
      text: `Please select exactly ${pageCount.value} photos`,
      width: "395px",
    });
    return;
  }

  // Конвертируем в base64 для передачи
  const readers = selectedFiles.map((file) => {
    return new Promise((resolve) => {
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

  Promise.all(readers).then((images) => {
    localStorage.setItem("uploadedPhotos", JSON.stringify(images));

    router.push("/upload/upload");
  });
};
</script>

<template>
  <div class="template-page-container">
    <!-- назад -->
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

  <div class="upload-page">
    <div class="upload-content">
      <h6>Upload your photos</h6>

      <p>Upload your photos and our AI will instantly craft your photo book.</p>
    </div>

    <div class="upload-number">
      <label for="number">Number of photos</label>

      <input v-model="pageCount" type="number" min="1" />
    </div>

    <div class="upload-add-photos">
      <BaseButton @click="openUpload"> + Add photos </BaseButton>

      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        hidden
        @change="onUpload"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
