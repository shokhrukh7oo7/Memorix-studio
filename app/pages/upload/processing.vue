<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "#app";
import { loadUploadedPhotos } from "~/utils/albumStorage";

const router = useRouter();

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

let raf = 0;
const started = ref(0);

onMounted(() => {
  const photos = loadUploadedPhotos();
  if (!photos.length) {
    router.replace("/upload");
    return;
  }
  thumbSrc.value = photos[0]?.url ? String(photos[0].url) : "";

  started.value = performance.now();
  const duration = 3200000;

  const tick = (now: number) => {
    const t = Math.min(1, (now - started.value) / duration);
    progress.value = Math.round(t * 100);
    if (t >= 1) {
      router.replace("/upload/editor");
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf);
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
