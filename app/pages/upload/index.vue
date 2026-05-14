<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Swal from "sweetalert2";
import arrowLeft from "~/assets/images/arrow-left.svg";
import logoBlack from "~/assets/images/logo-black.png";
import BaseButton from "~/components/ui/BaseButton.vue";
import {
  saveUploadedPhotos,
  loadBookDraft,
  type UploadedPhoto,
} from "~/utils/albumStorage";

import { useRoute, useRouter } from "#app";

const route = useRoute();
const router = useRouter();

const goBack = () => {
  router.back();
};

/** Book page count (10 / 20 / 30) from template or manual edit */
const pageCount = ref<number | null>(null);

const fileInput = ref<HTMLInputElement | null>(null);

function syncPageCountFromRouteOrDraft() {
  const q = route.query.pages;
  const fromQuery = typeof q === "string" ? Number(q) : NaN;
  if (Number.isFinite(fromQuery) && fromQuery > 0) {
    pageCount.value = fromQuery;
    return;
  }
  const draft = loadBookDraft();
  if (draft?.bookPages) pageCount.value = draft.bookPages;
}

onMounted(() => {
  syncPageCountFromRouteOrDraft();
});

watch(
  () => route.query.pages,
  () => syncPageCountFromRouteOrDraft(),
);

const openUpload = () => {
  const n = Number(pageCount.value);
  if (!Number.isFinite(n) || n <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Number of pages",
      text: "Enter how many pages your book should have (from your template or manually).",
      width: "395px",
    });
    return;
  }

  fileInput.value?.click();
};

const onUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (!target.files) return;

  const bookPages = Number(pageCount.value);
  if (!Number.isFinite(bookPages) || bookPages <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Number of pages",
      text: "Set the number of pages first.",
      width: "395px",
    });
    target.value = "";
    return;
  }

  const selectedFiles = Array.from(target.files);
  if (selectedFiles.length < 1) {
    target.value = "";
    return;
  }

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

  Promise.all(readers).then((images) => {
    saveUploadedPhotos(images);
    router.push("/upload/upload");
  });

  target.value = "";
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

  <div class="upload-page">
    <div class="upload-content">
      <h6>Upload your photos</h6>

      <p class="upload-lead">
        Upload your photos and our AI will craft your photo book: it picks the
        best shots, skips duplicates and low-quality images, and organizes them
        into a clear story.
      </p>
    </div>

    <div class="upload-number">
      <label for="upload-pages-input">Number of pages</label>

      <input
        id="upload-pages-input"
        v-model.number="pageCount"
        type="number"
        min="1"
        placeholder="10"
      />
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
.upload-lead {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-work);
  line-height: 140%;
  color: var(--black-grey-color);
  margin: 0;
}
</style>
