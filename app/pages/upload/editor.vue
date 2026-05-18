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

const selectBottomTab = (tab: BottomTab) => {
  bottomTab.value = tab;
  if (tab === "photos") void openPinturaForCurrent();
};
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
      <button
        v-for="tab in [
          ['photos', 'Photos'],
          ['ideas', 'Ideas'],
          ['background', 'Background'],
          ['sticker', 'Sticker'],
          ['smart', 'Smart'],
        ] as const"
        :key="tab[0]"
        type="button"
        class="editor-tab"
        :class="{ active: bottomTab === tab[0] }"
        @click="selectBottomTab(tab[0])"
      >
        {{ tab[1] }}
      </button>
    </nav>

    <p class="editor-hint">
      Photos opens filters and tools (Pintura) for the current page image.
    </p>
  </div>
</template>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 32px;
}

.editor-page .editor-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.editor-page .editor-top .editor-icon-btn:hover {
  background-color: transparent;
}

.editor-page .editor-top .editor-order-btn {
  width: auto;
  padding: 12px 50px;
}

.editor-page .editor-middle-container {
  background-color: var(--temp-border-color);
  padding: 12px;
  border-radius: var(--border-radius-circular);
}

.editor-page .editor-middle-container .editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.editor-page .editor-middle-container .editor-toolbar .toolbar-left {
  display: flex;
  gap: 4px;
}
.editor-page .editor-middle-container .editor-toolbar .toolbar-right {
  display: flex;
  gap: 4px;
}
.editor-page
  .editor-middle-container
  .editor-toolbar
  .toolbar-left
  .editor-tool,
.editor-page
  .editor-middle-container
  .editor-toolbar
  .toolbar-right
  .editor-tool {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  background-color: var(--white-color);
  padding: 8px;
  border-radius: var(--border-radius-circular);
}
.editor-page
  .editor-middle-container
  .editor-toolbar
  .toolbar-left
  .editor-tool
  img,
.editor-page
  .editor-middle-container
  .editor-toolbar
  .toolbar-right
  .editor-tool
  img {
  width: 24px;
}
.editor-page
  .editor-middle-container
  .editor-toolbar
  .toolbar-left
  .editor-tool,
.editor-middle-container .editor-toolbar .toolbar-right .editor-tool {
  font-size: 10px;
  font-weight: 400;
  font-family: var(--font-jet);
}

.editor-page .editor-middle-container .editor-spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 125px 0;
}
.editor-page .editor-middle-container .editor-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-family: var(--font-jet);
}

.editor-page .editor-middle-container .editor-pager .editor-pager-link,
.editor-page .editor-middle-container .editor-pager .editor-pager-current {
  font-size: 12px !important;
  font-weight: 400 !important;
  font-family: var(--font-jet) !important;
  border: none;
  background: none;
  color: var(--black-color);
  font: inherit;
  cursor: pointer;
  padding: 4px;
}

.editor-icon-btn {
  padding: 0;
  width: auto;
  min-width: auto;
  background: transparent;
}

.editor-icon-btn.ghost {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: var(--black-color);
  cursor: pointer;
  padding: 4px 8px;
}

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

.editor-bottom-tabs {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid var(--temp-border-color);
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

.editor-hint {
  font-size: 12px;
  color: var(--black-grey-color);
  font-family: var(--font-work);
  margin: 0;
  line-height: 130%;
}
</style>
