<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import {
  loadUploadedPhotos,
  saveUploadedPhotos,
  type UploadedPhoto,
} from "~/utils/albumStorage";

import dotsImage from "~/assets/images/dots.svg";
import arrowUndo from "~/assets/images/arrow-undo.svg";
import arrowRedo from "~/assets/images/arrow-redo.svg";
import history from "~/assets/images/history.svg";
import allPage from "~/assets/images/all-page.svg";
import moreDotsImage from "~/assets/images/more-dots.svg";

import gallery from "~/assets/images/photos.svg";
import ideas from "~/assets/images/ideas.svg";
import background from "~/assets/images/background.svg";
import sticker from "~/assets/images/sticker.svg";
import smart from "~/assets/images/smart.svg";

const router = useRouter();

const photos = ref<UploadedPhoto[]>([]);
/** Index of photo shown on the editable (right) page */
const spreadIndex = ref(0);

type BottomTab = "photos" | "ideas" | "background" | "sticker" | "smart";
const bottomTab = ref<BottomTab>("photos");

const rightPageUrl = computed(() => {
  const p = photos.value[spreadIndex.value];
  return p?.url ? String(p.url) : "";
});

const persist = () => saveUploadedPhotos(photos.value);

async function openPinturaForCurrent() {
  const src = rightPageUrl.value;
  if (!src || typeof window === "undefined") return;

  try {
    const { openDefaultEditor } = await import("@pqina/pintura");
    await import("@pqina/pintura/pintura.css");

    const idx = spreadIndex.value;

    openDefaultEditor({
      src,
      imageWriter: {
        mimeType: "image/jpeg",
        quality: 0.92,
      },
      onProcess: (res: { dest?: Blob }) => {
        const file = res?.dest;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const cur = photos.value[idx];
          if (!cur) return;
          photos.value[idx] = { ...cur, url: reader.result };
          persist();
        };
        reader.readAsDataURL(file);
      },
    });
  } catch {
    // Editor SDK failed — stay on layout
  }
}

onMounted(() => {
  photos.value = loadUploadedPhotos();
  if (!photos.value.length) {
    router.replace("/upload");
    return;
  }
  spreadIndex.value = 0;
  void openPinturaForCurrent();
});

const goBack = () => {
  router.push("/upload/upload");
};

const goOrder = () => {
  // router.push("/upload/preview");
  router.push("/orders");
};

const prevSpread = () => {
  if (spreadIndex.value > 0) spreadIndex.value -= 1;
};

const nextSpread = () => {
  if (spreadIndex.value < photos.value.length - 1) spreadIndex.value += 1;
};

// const selectBottomTab = (tab: BottomTab) => {
//   bottomTab.value = tab;
//   if (tab === "photos") void openPinturaForCurrent();
// };
</script>

<template>
  <div class="editor-page">
    <div class="editor-top">
      <BaseButton class="editor-icon-btn" @click="goBack">
        <img :src="arrowLeft" alt="Back" />
      </BaseButton>
      <BaseButton
        class="editor-order-btn"
        variant="primary"
        size="sm"
        @click="goOrder"
      >
        Order
      </BaseButton>
      <button type="button" class="editor-icon-btn ghost" aria-label="Remove">
        <img :src="dotsImage" alt="icon" />
      </button>
    </div>

    <div class="editor-middle-container">
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <span class="editor-tool">
            <img :src="arrowUndo" alt="icon" />
            Undo
          </span>
          <span class="editor-tool">
            <img :src="arrowRedo" alt="icon" />
            Redo
          </span>
          <span class="editor-tool">
            <img :src="history" alt="icon" />
            History
          </span>
        </div>
        <div class="toolbar-right">
          <span class="editor-tool">
            <img :src="allPage" alt="icon" />
            All page
          </span>
          <span class="editor-tool">
            <img :src="moreDotsImage" alt="icon" />
            More
          </span>
        </div>
      </div>

      <div class="editor-spread">
        <div class="editor-page-side editor-page-fixed">
          <p>THIS PAGE CAN NOT BE EDITED.</p>
        </div>
        <div class="editor-page-side editor-page-edit">
          <img
            v-if="rightPageUrl"
            class="editor-page-photo"
            :src="rightPageUrl"
            alt=""
          />
          <p class="editor-placeholder-title">Title</p>
          <p class="editor-placeholder-text">Enter text</p>
        </div>
      </div>

      <nav class="editor-pager" aria-label="Spread navigation">
        <button type="button" class="editor-pager-link" @click="prevSpread">
          < Cover
        </button>
        <span class="editor-pager-current">Page {{ spreadIndex + 1 }} ▾</span>
        <button
          type="button"
          class="editor-pager-link"
          :disabled="spreadIndex >= photos.length - 1"
          @click="nextSpread"
        >
          Next page >
        </button>
      </nav>
    </div>

    <nav class="editor-bottom-tabs" aria-label="Editor tools">
      <BaseButton>
        <img :src="gallery" alt="icon" />
        Photos
      </BaseButton>
      <BaseButton>
        <img :src="ideas" alt="icon" />
        Ideas
      </BaseButton>
      <BaseButton>
        <img :src="background" alt="icon" />
        Background
      </BaseButton>
      <BaseButton>
        <img :src="sticker" alt="icon" />
        Sticker
      </BaseButton>
      <BaseButton>
        <img :src="smart" alt="icon" />
        Smart
      </BaseButton>
    </nav>
  </div>
</template>

<style scoped>
/* .editor-order-btn :deep(.btn) {
  min-width: 88px;
} */

.editor-page-side {
  min-height: 160px;
  border-radius: var(--border-radius-default);
  border: 1px solid var(--temp-border-color);
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 11px;
  font-family: var(--font-jet);
}

.editor-page-fixed {
  background: #4a4a4a;
  color: #e5e5e5;
}

.editor-page-edit {
  background: #ececec;
  color: var(--black-color);
  position: relative;
  overflow: hidden;
}

.editor-page-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
}

.editor-placeholder-title {
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-work);
  margin: 0 0 8px;
}

.editor-placeholder-text {
  position: relative;
  z-index: 1;
  font-size: 12px;
  color: var(--black-grey-color);
  margin: 0;
}

.editor-pager-link:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.editor-pager-current {
  font-weight: 600;
}

.editor-tab {
  flex: 1;
  border: none;
  background: var(--temp-border-color);
  border-radius: 999px;
  padding: 10px 4px;
  font-size: 10px;
  font-weight: 500;
  font-family: var(--font-jet);
  color: var(--black-color);
  cursor: pointer;
}

.editor-tab.active {
  background: var(--btn-color);
  color: var(--white-color);
}
</style>
