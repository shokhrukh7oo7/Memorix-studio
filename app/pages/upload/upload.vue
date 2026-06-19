<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import trash from "~/assets/images/trash.svg";
import arrowsOut from "~/assets/images/arrows-out.svg";

import { useRouter } from "#app";
import { loadBookDraft } from "~/utils/albumStorage";
import { useAlbums, type ApiPhoto } from "~/composables/useAlbums";
import { useApi } from "~/composables/useApi";

const router = useRouter();
const { listPhotos, deletePhoto, uploadPhotos, replacePhoto } = useAlbums();
const { errorMessage } = useApi();

const MIN_PHOTOS = 10;
const MAX_PHOTOS = 350;

const goBack = () => {
  router.back();
};

const photos = ref<ApiPhoto[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const albumId = ref<string>("");
const busy = ref(false);

const photoSrc = (p: ApiPhoto) => p.thumbnailUrl || p.originalUrl || "";

async function refresh() {
  if (!albumId.value) return;
  photos.value = await listPhotos(albumId.value);
}

onMounted(async () => {
  const draft = loadBookDraft();
  if (!draft?.albumId) {
    router.replace("/upload");
    return;
  }
  albumId.value = draft.albumId;
  try {
    await refresh();
  } catch (e) {
    console.error(e);
  }
});

const removePhoto = async (photo: ApiPhoto) => {
  try {
    await deletePhoto(albumId.value, photo.id);
    photos.value = photos.value.filter((p) => p.id !== photo.id);
  } catch (e) {
    Swal.fire({ icon: "error", title: "Xatolik", text: errorMessage(e), width: "395px" });
  }
};

const openUpload = () => {
  fileInput.value?.click();
};

const addPhotos = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files) return;
  const selectedFiles = Array.from(target.files);
  target.value = "";
  if (!selectedFiles.length) return;

  const remaining = MAX_PHOTOS - photos.value.length;
  if (remaining <= 0) {
    Swal.fire({
      icon: "info",
      title: "Limit",
      text: `Bitta albomga koʻpi bilan ${MAX_PHOTOS} ta rasm yuklash mumkin.`,
      width: "395px",
    });
    return;
  }
  const toUpload = selectedFiles.slice(0, remaining);
  if (toUpload.length < selectedFiles.length) {
    Swal.fire({
      icon: "info",
      title: "Limit",
      text: `Faqat ${toUpload.length} ta rasm qoʻshildi (jami limit: ${MAX_PHOTOS}).`,
      width: "395px",
    });
  }

  busy.value = true;
  try {
    await uploadPhotos(albumId.value, toUpload);
    await refresh();
  } catch (err) {
    Swal.fire({ icon: "error", title: "Yuklashda xatolik", text: errorMessage(err), width: "395px" });
  } finally {
    busy.value = false;
  }
};

const editPhoto = async (photo: ApiPhoto) => {
  const src = photoSrc(photo);
  if (!src || typeof window === "undefined") return;

  try {
    const { openDefaultEditor } = await import("@pqina/pintura");
    await import("@pqina/pintura/pintura.css");

    openDefaultEditor({
      src,
      imageWriter: { mimeType: "image/jpeg", quality: 0.92 },
      onProcess: async (res: any) => {
        const file = res?.dest as File | undefined;
        if (!file) return;
        try {
          await replacePhoto(albumId.value, photo.id, file);
          await refresh();
        } catch (e) {
          Swal.fire({ icon: "error", title: "Xatolik", text: errorMessage(e), width: "395px" });
        }
      },
    });
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Editor error",
      text: "Could not open the photo editor. Please try again.",
      width: "395px",
    });
  }
};

const createAlbum = () => {
  if (photos.value.length < MIN_PHOTOS) {
    Swal.fire({
      icon: "info",
      title: "Rasm yetarli emas",
      text: `Albom yaratish uchun kamida ${MIN_PHOTOS} ta rasm yuklang.`,
      width: "395px",
    });
    return;
  }

  router.push("/upload/processing");
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
        <BaseButton size="md" :disabled="busy" @click="openUpload">
          {{ busy ? "..." : "+ Add photos" }}
        </BaseButton>
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

  <div class="upload-counter">
    <span :class="{ ok: photos.length >= MIN_PHOTOS }">
      {{ photos.length }} / {{ MAX_PHOTOS }}
    </span>
  </div>

  <div class="upload-gallery">
    <div v-for="photo in photos" :key="photo.id" class="photo-card">
      <button class="delete-btn" @click="removePhoto(photo)">
        <img :src="trash" alt="icon" />
      </button>

      <img :src="photoSrc(photo)" :alt="photo.fileName" />

      <button class="edit-btn" @click="editPhoto(photo)" aria-label="Edit photo">
        <img :src="arrowsOut" alt="edit" />
      </button>
    </div>
  </div>

  <div class="create-photo-album">
    <BaseButton @click="createAlbum">Create photo album</BaseButton>
  </div>
</template>

<style scoped>
.upload-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.upload-counter span {
  font-weight: 600;
  color: var(--danger-color, #e11d48);
}

.upload-counter span.ok {
  color: var(--success-color, #16a34a);
}

.upload-counter small {
  color: var(--gray-color, #6b7280);
  font-size: 12px;
}

.photo-card {
  position: relative;
}

.edit-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: var(--white-color);
  cursor: pointer;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-btn img {
  width: 16px;
  height: 16px;
}
</style>
