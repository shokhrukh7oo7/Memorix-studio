<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "#app";
import Swal from "sweetalert2";
import { loadBookDraft } from "~/utils/albumStorage";
import { useAlbums } from "~/composables/useAlbums";
import { useApi } from "~/composables/useApi";

const router = useRouter();
const { startProcessing, getAlbum, listPhotos } = useAlbums();
const { errorMessage } = useApi();

const thumbSrc = ref("");

const progress = ref(0);

const steps = [
  { id: "ready", label: "Getting your images ready" },
  { id: "pick", label: "Picking the best images" },
  { id: "story", label: "Creating a beautiful story" },
] as const;

type StepState = "done" | "active" | "pending";

const stepStates = computed<StepState[]>(() => {
  const p = progress.value;
  if (p >= 100) return ["done", "done", "done"];
  if (p >= 66) return ["done", "done", "active"];
  if (p >= 33) return ["done", "active", "pending"];
  return ["active", "pending", "pending"];
});

let pollTimer: ReturnType<typeof setTimeout> | null = null;
let smoothTimer: ReturnType<typeof setInterval> | null = null;
const albumId = ref("");

async function poll() {
  try {
    const album = await getAlbum(albumId.value);
    const backendProgress = (album as { processingProgress?: number }).processingProgress ?? 0;
    if (backendProgress > progress.value) progress.value = Math.min(99, backendProgress);

    if (album.status === "ready" || album.status === "ordered") {
      progress.value = 100;
      cleanup();
      router.replace("/upload/editor");
      return;
    }
    if (album.status === "draft") {
      // processing xato bilan tugadi
      cleanup();
      Swal.fire({ icon: "error", title: "Xatolik", text: "Ishlov berishda xatolik", width: "395px" });
      router.replace("/upload/upload");
      return;
    }
  } catch (e) {
    console.error(e);
  }
  pollTimer = setTimeout(poll, 1000);
}

function cleanup() {
  if (pollTimer) clearTimeout(pollTimer);
  if (smoothTimer) clearInterval(smoothTimer);
}

onMounted(async () => {
  const draft = loadBookDraft();
  if (!draft?.albumId) {
    router.replace("/upload");
    return;
  }
  albumId.value = draft.albumId;
  thumbSrc.value = draft.coverImage ?? "";

  // Cover bo'lmasa — birinchi rasmni olishga harakat
  if (!thumbSrc.value) {
    try {
      const photos = await listPhotos(albumId.value);
      thumbSrc.value = photos[0]?.thumbnailUrl || photos[0]?.originalUrl || "";
    } catch {
      /* ixtiyoriy */
    }
  }

  // Animatsiya silliq bo'lishi uchun progressni asta oshirib turamiz
  smoothTimer = setInterval(() => {
    if (progress.value < 95) progress.value += 1;
  }, 120);

  try {
    await startProcessing(albumId.value);
  } catch (e) {
    cleanup();
    Swal.fire({ icon: "error", title: "Xatolik", text: errorMessage(e), width: "395px" });
    router.replace("/upload/upload");
    return;
  }
  poll();
});

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div class="processing-page">
    <p class="processing-breadcrumb">Uploading</p>

    <div class="processing-ring-wrap" aria-live="polite">
      <div
        class="processing-ring"
        :style="{
          background: `conic-gradient(from -90deg, #22c55e ${progress * 3.6}deg, #e5e5e5 0deg)`,
        }"
      >
        <div v-if="thumbSrc" class="processing-thumb">
          <img :src="thumbSrc" alt="" />
          <span class="processing-pct">{{ progress }}%</span>
        </div>
      </div>
    </div>

    <ul class="processing-steps">
      <li
        v-for="(step, i) in steps"
        :key="step.id"
        class="processing-step"
        :data-state="stepStates[i]"
      >
        <span class="processing-step-icon" aria-hidden="true">
          <template v-if="stepStates[i] === 'done'">✓</template>
          <template v-else-if="stepStates[i] === 'active'">↻</template>
          <template v-else>○</template>
        </span>
        <span class="processing-step-label">{{ step.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.processing-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 40px;
  gap: 28px;
  min-height: 60vh;
}

.processing-breadcrumb {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-jet);
  color: var(--black-grey-color);
  margin: 0;
}

.processing-ring-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.processing-ring {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.processing-thumb {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.processing-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  font-family: var(--font-work);
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.processing-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.processing-step {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-work);
  color: var(--black-color);
}

.processing-step[data-state="pending"] {
  color: var(--grey-color);
}

.processing-step[data-state="active"] {
  color: #ea580c;
}

.processing-step[data-state="done"] {
  color: #16a34a;
}

.processing-step-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}
</style>
