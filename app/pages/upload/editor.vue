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
  router.push("/upload/preview");
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
    <header class="editor-top">
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
        −
      </button>
    </header>

    <div class="editor-toolbar">
      <span class="editor-tool">Undo</span>
      <span class="editor-tool">Redo</span>
      <span class="editor-tool">History</span>
      <span class="editor-tool">All page</span>
      <span class="editor-tool">More</span>
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
        &lt; Cover
      </button>
      <span class="editor-pager-current"
        >Page {{ spreadIndex + 1 }} ▾</span
      >
      <button
        type="button"
        class="editor-pager-link"
        :disabled="spreadIndex >= photos.length - 1"
        @click="nextSpread"
      >
        Next page &gt;
      </button>
    </nav>

    <nav class="editor-bottom-tabs" aria-label="Editor tools">
      <button
        v-for="tab in (
          [
            ['photos', 'Photos'],
            ['ideas', 'Ideas'],
            ['background', 'Background'],
            ['sticker', 'Sticker'],
            ['smart', 'Smart'],
          ] as const
        )"
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

.editor-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.editor-order-btn :deep(.btn) {
  min-width: 88px;
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

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--temp-border-color);
}

.editor-tool {
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-jet);
  color: var(--black-grey-color);
}

.editor-spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

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

.editor-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-family: var(--font-work);
  padding: 8px 0;
}

.editor-pager-link {
  border: none;
  background: none;
  color: var(--btn-color);
  font: inherit;
  cursor: pointer;
  padding: 4px;
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
