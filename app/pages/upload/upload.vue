<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import trash from "~/assets/images/trash.svg";
import arrowsOut from "~/assets/images/arrows-out.svg";

import { useRouter } from "#app";
import { saveUploadedPhotos, loadUploadedPhotos, type UploadedPhoto as StoredPhoto } from "~/utils/albumStorage";

const router = useRouter();

const goBack = () => {
  router.back();
};

const photos = ref<StoredPhoto[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const persist = () => saveUploadedPhotos(photos.value);

onMounted(() => {
  photos.value = loadUploadedPhotos();
});

const removePhoto = (index: number) => {
  photos.value.splice(index, 1);

  persist();
};

const openUpload = () => {
  fileInput.value?.click();
};

const addPhotos = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (!target.files) return;

  const selectedFiles = Array.from(target.files);

  const readers = selectedFiles.map((file) => {
    return new Promise<StoredPhoto>((resolve) => {
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

    persist();
  });
};

const editPhoto = async (index: number) => {
  const src = photos.value[index]?.url;
  if (!src) return;

  if (typeof window === "undefined") return;

  try {
    const { openDefaultEditor } = await import("@pqina/pintura");
    await import("@pqina/pintura/pintura.css");

    openDefaultEditor({
      src: String(src),
      imageWriter: {
        mimeType: "image/jpeg",
        quality: 0.92,
      },
      onProcess: (res: any) => {
        const file = res?.dest;
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          photos.value[index] = {
            ...photos.value[index],
            url: reader.result,
          };
          persist();
        };
        reader.readAsDataURL(file);
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
  if (!photos.value.length) {
    Swal.fire({
      icon: "info",
      title: "No photos yet",
      text: "Please upload at least 1 photo to create an album.",
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

      <!-- <button class="edit-btn" @click="editPhoto(index)" aria-label="Edit photo">
        <img :src="arrowsOut" alt="edit" />
      </button> -->
    </div>
  </div>

  <div class="create-photo-album">
    <BaseButton @click="createAlbum">Create photo album</BaseButton>
  </div>
</template>

<style scoped>
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
