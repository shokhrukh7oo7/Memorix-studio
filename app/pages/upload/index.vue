<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Swal from "sweetalert2";
import arrowLeft from "~/assets/images/arrow-left.svg";
import logoBlack from "~/assets/images/logo-black.png";
import BaseButton from "~/components/ui/BaseButton.vue";
import {
  loadBookDraft,
  saveBookDraft,
} from "~/utils/albumStorage";
import { useAlbums } from "~/composables/useAlbums";
import { useApi } from "~/composables/useApi";

import { useRoute, useRouter } from "#app";

const route = useRoute();
const router = useRouter();
const { createAlbum, uploadPhotos } = useAlbums();
const { errorMessage } = useApi();
const uploading = ref(false);

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

const onUpload = async (e: Event) => {
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

  let selectedFiles = Array.from(target.files);
  target.value = "";
  if (selectedFiles.length < 1) return;

  const MAX_PHOTOS = 350;
  if (selectedFiles.length > MAX_PHOTOS) {
    selectedFiles = selectedFiles.slice(0, MAX_PHOTOS);
    Swal.fire({
      icon: "info",
      title: "Limit",
      text: `Faqat ${MAX_PHOTOS} ta rasm qoʻshildi (albom limiti).`,
      width: "395px",
    });
  }

  uploading.value = true;
  try {
    const draft = loadBookDraft();
    // Albom mavjud bo'lmasa — yaratamiz (templateId draftdan, bo'lmasa null)
    let albumId = draft?.albumId;
    if (!albumId) {
      const album = await createAlbum({
        templateId: draft?.templateId ?? null,
        pageCount: bookPages,
      });
      albumId = album.id;
    }

    // Haqiqiy fayllarni serverga yuklash
    await uploadPhotos(albumId, selectedFiles);

    // Draftga albom va sahifa sonini saqlaymiz
    saveBookDraft({
      bookPages,
      templateTitle: draft?.templateTitle ?? "",
      colorName: draft?.colorName ?? "",
      templateId: draft?.templateId ?? null,
      coverImage: draft?.coverImage,
      albumId,
    });

    router.push("/upload/upload");
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Yuklashda xatolik",
      text: errorMessage(err, "Rasmlarni yuklab bo'lmadi"),
      width: "395px",
    });
  } finally {
    uploading.value = false;
  }
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
      <BaseButton :disabled="uploading" @click="openUpload">
        {{ uploading ? "Yuklanmoqda..." : "+ Add photos" }}
      </BaseButton>

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
