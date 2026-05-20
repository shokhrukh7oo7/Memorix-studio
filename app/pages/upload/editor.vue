<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "#app";
import BaseButton from "~/components/ui/BaseButton.vue";

// Импорт иконок из твоего проекта
import arrowLeft from "~/assets/images/arrow-left.svg";
import dotsImage from "~/assets/images/dots.svg";
import arrowUndo from "~/assets/images/arrow-undo.svg";
import arrowRedo from "~/assets/images/arrow-redo.svg";
import historyIcon from "~/assets/images/history.svg";
import allPageIcon from "~/assets/images/all-page.svg";
import moreDotsImage from "~/assets/images/more-dots.svg";

import galleryIcon from "~/assets/images/photos.svg";
import ideasIcon from "~/assets/images/ideas.svg";
import backgroundIcon from "~/assets/images/background.svg";
import stickerIcon from "~/assets/images/sticker.svg";
import smartIcon from "~/assets/images/smart.svg";

import {
  loadUploadedPhotos,
  loadBookDraft,
  type UploadedPhoto,
} from "~/utils/albumStorage";

const router = useRouter();

// --- СОСТОЯНИЕ ДАННЫХ ---
const photos = ref<UploadedPhoto[]>([]);
const totalPages = ref(10);
const currentSpreadIndex = ref(0); // 0 = Обложка/Разворот 1, 1 = Разворот 2 и т.д.

// Перечень доступных стилей макетов страниц
const layoutStyles = [
  { name: "Collage", slots: 3, class: "layout-collage" },
  { name: "Photo Grid", slots: 4, class: "layout-grid" },
  { name: "Moodboard", slots: 5, class: "layout-moodboard" },
  { name: "Scrapbook", slots: 2, class: "layout-scrapbook" },
  { name: "Polaroid Collage", slots: 3, class: "layout-polaroid" },
  { name: "Photo Dump", slots: 6, class: "layout-dump" },
  { name: "Film Strip", slots: 3, class: "layout-film" },
  { name: "Magazine Style", slots: 1, class: "layout-magazine" },
  { name: "Pinterest Style", slots: 4, class: "layout-pinterest" },
  { name: "Aesthetic Collage", slots: 3, class: "layout-aesthetic" },
];

interface PageState {
  pageNumber: number;
  layoutTitle: string;
  layoutClass: string;
  photoIndices: number[]; // Индексы фото из массива `photos`
  textTitle: string;
  textContent: string;
}

interface SpreadState {
  id: number;
  leftPage: PageState | null; // null если это самая первая обложка (в зависимости от логики, но на макете слева неизменяемый форзац)
  rightPage: PageState;
}

const bookSpreads = ref<SpreadState[]>([]);

// --- СИСТЕМА UNDO / REDO / HISTORY ---
const historyStack = ref<string[]>([]);
const historyPointer = ref(-1);

function saveToHistory() {
  // Обрезаем стек, если мы что-то отменили и делаем новое действие
  if (historyPointer.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, historyPointer.value + 1);
  }
  historyStack.value.push(JSON.stringify(bookSpreads.value));
  historyPointer.value++;
}

const canUndo = computed(() => historyPointer.value > 0);
const canRedo = computed(
  () => historyPointer.value < historyStack.value.length - 1,
);

function handleUndo() {
  if (!canUndo.value) return;
  historyPointer.value--;
  bookSpreads.value = JSON.parse(historyStack.value[historyPointer.value]);
}

function handleRedo() {
  if (!canRedo.value) return;
  historyPointer.value++;
  bookSpreads.value = JSON.parse(historyStack.value[historyPointer.value]);
}

// --- ОТКРЫТИЕ ВСПЛЫВАЮЩИХ МЕНЮ (МЕНЮ ИЗ МАКЕТА) ---
const activeMenu = ref<"document" | "more" | "history" | "pages-select" | null>(
  null,
);

function toggleMenu(menu: "document" | "more" | "history" | "pages-select") {
  activeMenu.value = activeMenu.value === menu ? null : menu;
}

function closeAllMenus() {
  activeMenu.value = null;
}

// --- НИЖНИЕ ИНСТРУМЕНТЫ (BOTTOM TABS) ---
type ToolTab = "photos" | "ideas" | "background" | "sticker" | "smart";
const activeTool = ref<ToolTab>("photos");

// Данные для фильтрации/отображения в панелях инструментов
const selectedBackground = ref("#ececec");
const activeFilter = ref("all");

// --- НАВИГАЦИЯ < COVER | PAGE X v | NEXT PAGE > ---
const totalSpreadsCount = computed(() => bookSpreads.value.length);
const currentSpread = computed(
  () => bookSpreads.value[currentSpreadIndex.value] || null,
);

function goToPrev() {
  if (currentSpreadIndex.value > 0) {
    currentSpreadIndex.value--;
    closeAllMenus();
  }
}

function goToNext() {
  if (currentSpreadIndex.value < totalSpreadsCount.value - 1) {
    currentSpreadIndex.value++;
    closeAllMenus();
  }
}

function selectSpreadFromDropdown(idx: number) {
  currentSpreadIndex.value = idx;
  activeMenu.value = null;
}

// --- ИНИЦИАЛИЗАЦИЯ И СБОРКА КНИГИ ---
onMounted(() => {
  photos.value = loadUploadedPhotos();
  const draft = loadBookDraft();
  if (draft?.bookPages) {
    totalPages.value = Number(draft.bookPages);
  }

  generateInitialLayouts();
  // Сохраняем стартовую точку в историю изменений
  historyStack.value.push(JSON.stringify(bookSpreads.value));
  historyPointer.value = 0;
});

function generateInitialLayouts() {
  const spreadsCount = Math.ceil(totalPages.value / 2);
  const tempSpreads: SpreadState[] = [];
  let photoGlIdx = 0;

  for (let i = 0; i < spreadsCount; i++) {
    const leftPageNum = i * 2 + 1;
    const rightPageNum = i * 2 + 2;

    const leftStyle = layoutStyles[leftPageNum % layoutStyles.length];
    const rightStyle = layoutStyles[rightPageNum % layoutStyles.length];

    // Распределяем фотографии по пустым контейнерам
    const leftIndices: number[] = [];
    for (let s = 0; s < leftStyle.slots; s++) {
      leftIndices.push(photoGlIdx < photos.value.length ? photoGlIdx++ : -1);
    }

    const rightIndices: number[] = [];
    for (let s = 0; s < rightStyle.slots; s++) {
      rightIndices.push(photoGlIdx < photos.value.length ? photoGlIdx++ : -1);
    }

    tempSpreads.push({
      id: i,
      leftPage: {
        pageNumber: leftPageNum,
        layoutTitle: leftStyle.name,
        layoutClass: leftStyle.class,
        photoIndices: leftIndices,
        textTitle: "Title",
        textContent: "Enter text",
      },
      rightPage: {
        pageNumber: rightPageNum,
        layoutTitle: rightStyle.name,
        layoutClass: rightStyle.class,
        photoIndices: rightIndices,
        textTitle: "Title",
        textContent: "Enter text",
      },
    });
  }
  bookSpreads.value = tempSpreads;
}

// Изменение текста или замена фото (пример триггера сохранения истории)
function updateText(
  pageSide: "left" | "right",
  type: "title" | "content",
  value: string,
) {
  if (!currentSpread.value) return;
  if (pageSide === "left" && currentSpread.value.leftPage) {
    if (type === "title") currentSpread.value.leftPage.textTitle = value;
    else currentSpread.value.leftPage.textContent = value;
  } else {
    if (type === "title") currentSpread.value.rightPage.textTitle = value;
    else currentSpread.value.rightPage.textContent = value;
  }
  saveToHistory();
}

function changeBackground(color: string) {
  selectedBackground.value = color;
  saveToHistory();
}

const goBack = () => router.push("/upload/upload");
const goOrder = () => router.push("/orders");
</script>

<template>
  <div class="editor-page" @click="closeAllMenus">
    <div class="editor-top" @click.stop>
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

      <button
        type="button"
        class="editor-icon-btn ghost"
        @click="toggleMenu('document')"
      >
        <img :src="dotsImage" alt="Menu" />
      </button>

      <div
        v-if="activeMenu === 'document'"
        class="dropdown-menu document-dropdown"
      >
        <div class="input-group">
          <label>Project name</label>
          <input type="text" value="Custom travel book 11213" />
        </div>
        <ul>
          <li class="menu-info-item">
            <img :src="allPageIcon" />
            <div>
              <p>All page</p>
              <span>Last saved: 21 Feb 2026, 12:17:23</span>
            </div>
          </li>
          <li><span class="icon">⚠️</span> Notices</li>
          <li><span class="icon">👁️</span> Preview</li>
          <li class="danger-action" @click="goBack">
            <span class="icon">🚪</span> Leave editor and back to home page
          </li>
        </ul>
      </div>
    </div>

    <div class="editor-middle-container" @click.stop>
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <button class="editor-tool" :disabled="!canUndo" @click="handleUndo">
            <img :src="arrowUndo" alt="Undo" /> Undo
          </button>
          <button class="editor-tool" :disabled="!canRedo" @click="handleRedo">
            <img :src="arrowRedo" alt="Redo" /> Redo
          </button>
          <button class="editor-tool" @click="toggleMenu('history')">
            <img :src="historyIcon" alt="History" /> History
          </button>
        </div>

        <div class="toolbar-right">
          <button class="editor-tool" @click="toggleMenu('document')">
            <img :src="allPageIcon" alt="All page" /> All page
          </button>
          <button class="editor-tool" @click="toggleMenu('more')">
            <img :src="moreDotsImage" alt="More" /> More
          </button>
        </div>

        <div v-if="activeMenu === 'more'" class="dropdown-menu more-dropdown">
          <ul>
            <li>➕ Add spreads</li>
            <li class="disabled-li">❌ Remove spread</li>
            <li class="disabled-li">📋 Duplicate spread</li>
          </ul>
        </div>

        <div
          v-if="activeMenu === 'history'"
          class="dropdown-menu history-dropdown"
        >
          <!-- <p class="menu-title">History Actions</p> -->
          <ul>
            <li
              v-for="(h, idx) in historyStack"
              :key="idx"
              :class="{ active: idx === historyPointer }"
            >
              Action #{{ idx + 1 }}
              {{ idx === historyPointer ? "(Current)" : "" }}
            </li>
          </ul>
        </div>
      </div>

      <div class="editor-spread" v-if="currentSpread">
        <div
          class="editor-page-side page-left"
          :class="{ 'fixed-cover-style': currentSpreadIndex === 0 }"
          :style="{
            backgroundColor: currentSpreadIndex !== 0 ? selectedBackground : '',
          }"
        >
          <template v-if="currentSpreadIndex === 0">
            <div class="fixed-cover-content">
              <p>THIS PAGE CAN NOT BE EDITED</p>
            </div>
          </template>

          <template v-else-if="currentSpread.leftPage">
            <div
              class="page-layout-grid"
              :class="currentSpread.leftPage.layoutClass"
            >
              <div
                v-for="(photoIdx, pIdx) in currentSpread.leftPage.photoIndices"
                :key="pIdx"
                class="grid-photo-slot"
              >
                <img
                  v-if="photoIdx !== -1"
                  :src="String(photos[photoIdx]?.url)"
                />
                <div v-else class="empty-slot-placeholder"><span>+</span></div>
              </div>
            </div>
            <input
              class="page-title-input"
              :value="currentSpread.leftPage.textTitle"
              @input="
                (e) =>
                  updateText(
                    'left',
                    'title',
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
            <input
              class="page-desc-input"
              :value="currentSpread.leftPage.textContent"
              @input="
                (e) =>
                  updateText(
                    'left',
                    'content',
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
          </template>
        </div>

        <div
          class="editor-page-side page-right"
          :style="{ backgroundColor: selectedBackground }"
        >
          <div
            class="page-layout-grid"
            :class="currentSpread.rightPage.layoutClass"
          >
            <div
              v-for="(photoIdx, pIdx) in currentSpread.rightPage.photoIndices"
              :key="pIdx"
              class="grid-photo-slot"
            >
              <img
                v-if="photoIdx !== -1"
                :src="String(photos[photoIdx]?.url)"
              />
              <div v-else class="empty-slot-placeholder"><span>+</span></div>
            </div>
          </div>

          <input
            class="page-title-input"
            :value="currentSpread.rightPage.textTitle"
            @input="
              (e) =>
                updateText(
                  'right',
                  'title',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
          <input
            class="page-desc-input"
            :value="currentSpread.rightPage.textContent"
            @input="
              (e) =>
                updateText(
                  'right',
                  'content',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </div>
      </div>

      <nav class="editor-pager" aria-label="Spread navigation">
        <button
          type="button"
          class="editor-pager-link"
          :disabled="currentSpreadIndex === 0"
          @click="goToPrev"
        >
          &lt; Cover
        </button>

        <div class="pager-dropdown-wrap">
          <span
            class="editor-pager-current"
            @click="toggleMenu('pages-select')"
          >
            Page {{ currentSpreadIndex * 2 + 1 }}-{{
              currentSpreadIndex * 2 + 2
            }}
            ▾
          </span>

          <div
            v-if="activeMenu === 'pages-select'"
            class="dropdown-menu pager-select-dropdown"
          >
            <ul>
              <li
                v-for="(spread, index) in bookSpreads"
                :key="spread.id"
                :class="{ active: index === currentSpreadIndex }"
                @click="selectSpreadFromDropdown(index)"
              >
                Spread {{ index + 1 }} (Pages {{ index * 2 + 1 }}-{{
                  index * 2 + 2
                }})
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          class="editor-pager-link"
          :disabled="currentSpreadIndex >= totalSpreadsCount - 1"
          @click="goToNext"
        >
          Next page &gt;
        </button>
      </nav>
    </div>

    <div class="bottom-tools-section" @click.stop>
      <div class="tool-content-panel">
        <div v-if="activeTool === 'photos'" class="tool-pane internal-photos">
          <div class="filter-bar">
            <span
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'"
              >All photos</span
            >
            <span
              :class="{ active: activeFilter === 'unused' }"
              @click="activeFilter = 'unused'"
              >Unused</span
            >
          </div>
          <div class="horizontal-scroll-gallery">
            <div v-for="(img, idx) in photos" :key="idx" class="scroll-thumb">
              <img :src="String(img.url)" />
            </div>
          </div>
        </div>

        <div v-if="activeTool === 'ideas'" class="tool-pane internal-ideas">
          <div class="horizontal-scroll-gallery">
            <div
              v-for="style in layoutStyles"
              :key="style.name"
              class="style-idea-card"
              @click="
                () => {
                  if (currentSpread) {
                    currentSpread.rightPage.layoutClass = style.class;
                    currentSpread.rightPage.layoutTitle = style.name;
                    saveToHistory();
                  }
                }
              "
            >
              <div class="mini-grid-preview"></div>
              <span>{{ style.name }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeTool === 'background'" class="tool-pane internal-bg">
          <div class="color-picker-scroll">
            <div
              class="color-circle"
              style="background: #ececec"
              @click="changeBackground('#ececec')"
            ></div>
            <div
              class="color-circle"
              style="background: #ffffff"
              @click="changeBackground('#ffffff')"
            ></div>
            <div
              class="color-circle"
              style="background: #fef08a"
              @click="changeBackground('#fef08a')"
            ></div>
            <div
              class="color-circle"
              style="background: #bfdbfe"
              @click="changeBackground('#bfdbfe')"
            ></div>
            <div
              class="color-circle"
              style="background: #bbf7d0"
              @click="changeBackground('#bbf7d0')"
            ></div>
            <div
              class="color-circle"
              style="background: #fbcfe8"
              @click="changeBackground('#fbcfe8')"
            ></div>
          </div>
        </div>

        <div
          v-if="activeTool === 'sticker'"
          class="tool-pane internal-stickers"
        >
          <div class="horizontal-scroll-gallery">
            <div class="sticker-item">❤️</div>
            <div class="sticker-item">✈️</div>
            <div class="sticker-item">✨</div>
            <div class="sticker-item">📸</div>
            <div class="sticker-item">🌍</div>
          </div>
        </div>

        <div v-if="activeTool === 'smart'" class="tool-pane internal-smart">
          <button class="ai-rearrange-btn" @click="generateInitialLayouts">
            🪄 Auto-shuffle Album Layouts via AI
          </button>
        </div>
      </div>

      <nav class="editor-bottom-tabs" aria-label="Editor tools">
        <button
          class="tab-btn-item"
          :class="{ active: activeTool === 'photos' }"
          @click="activeTool = 'photos'"
        >
          <img :src="galleryIcon" alt="Photos" /> <span>Photos</span>
        </button>
        <button
          class="tab-btn-item"
          :class="{ active: activeTool === 'ideas' }"
          @click="activeTool = 'ideas'"
        >
          <img :src="ideasIcon" alt="Ideas" /> <span>Ideas</span>
        </button>
        <button
          class="tab-btn-item"
          :class="{ active: activeTool === 'background' }"
          @click="activeTool = 'background'"
        >
          <img :src="backgroundIcon" alt="Background" /> <span>Background</span>
        </button>
        <button
          class="tab-btn-item"
          :class="{ active: activeTool === 'sticker' }"
          @click="activeTool = 'sticker'"
        >
          <img :src="stickerIcon" alt="Sticker" /> <span>Sticker</span>
        </button>
        <button
          class="tab-btn-item"
          :class="{ active: activeTool === 'smart' }"
          @click="activeTool = 'smart'"
        >
          <img :src="smartIcon" alt="Smart" /> <span>Smart</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  position: relative;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ВЕРХНЯЯ ПАНЕЛЬ */
.editor-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

/* ВСПЛЫВАЮЩИЕ МЕНЮ (DROPDOWNS НА МАКЕТЕ) */
.dropdown-menu {
  position: absolute;
  left: 0;
  top: 60px;
  padding: 10px;
  background: white;
  border-radius: var(--border-radius-circular);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 50;
  width: 100%;
}
.document-dropdown {
  
  right: 16px;
  padding: 12px 16px;
}
.document-dropdown .input-group {
  padding: 0 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.document-dropdown .input-group label {
  font-size: 11px;
  color: #64748b;
  display: block;
  margin-bottom: 4px;
}
.document-dropdown .input-group input {
  width: 100%;
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.document-dropdown ul,
.more-dropdown ul,
.history-dropdown ul,
.pager-select-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.document-dropdown li,
.more-dropdown li,
.history-dropdown li,
.pager-select-dropdown li {
  padding: 10px 0;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.document-dropdown li:hover,
.more-dropdown li:hover,
.pager-select-dropdown li:hover {
  background: #f8fafc;
}
.menu-info-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.menu-info-item p {
  font-weight: 500;
  margin: 0;
}
.menu-info-item span {
  font-size: 10px;
  color: #94a3b8;
}
.danger-action {
  color: #ef4444;
  border-top: 1px solid #f1f5f9;
}

.more-dropdown {
  top: 60px;
  right: 0;
}
.disabled-li {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager-select-dropdown {
  bottom: 35px;
  left: 70%;
  transform: translateX(-50%);
  /* max-height: 200px; */
  overflow-y: auto;
  width: 339px;
  top: auto;
}
.pager-select-dropdown li.active {
  background: var(--btn-color, #ff4d35);
  color: white;
}

/* ТУЛБАР */
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f1f5f9;
  position: relative;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}
.editor-tool {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
}
.editor-tool:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.editor-tool img {
  width: 14px;
  height: 14px;
}

/* РАЗВОРОТ КНИГИ */
.editor-spread {
  display: flex;
  gap: 2px;
  background: #cbd5e1;
  padding: 8px;
  width: 100%;
  max-width: 760px;
  margin: 20px auto;
  aspect-ratio: 16 / 10;
}
.editor-page-side {
  flex: 1;
  background: #ececec;
  position: relative;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.fixed-cover-style {
  background-color: #334155 !important;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.fixed-cover-content {
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

/* ДИНАМИЧЕСКИЕ СЕТКИ ФОТО */
.page-layout-grid {
  display: grid;
  gap: 6px;
  flex-grow: 1;
  margin-bottom: 12px;
}
.layout-magazine {
  grid-template-columns: 1fr;
}
.layout-minimal {
  grid-template-columns: 1fr 1fr;
}
.layout-collage {
  grid-template-columns: repeat(2, 1fr);
}
.layout-collage .grid-photo-slot:nth-child(1) {
  grid-column: span 2;
}
.layout-grid {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.layout-dump {
  grid-template-columns: repeat(3, 1fr);
}

.grid-photo-slot {
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.grid-photo-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.empty-slot-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 20px;
  border: 1px dashed #cbd5e1;
}

/* ИНПУТЫ ТЕКСТА НА СТРАНИЦАХ */
.page-title-input {
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  width: 100%;
  outline: none;
  margin-bottom: 2px;
}
.page-desc-input {
  background: transparent;
  border: none;
  font-size: 12px;
  color: #64748b;
  text-align: center;
  width: 100%;
  outline: none;
}

/* ПЕЙДЖЕР НАВИГАЦИИ */
.editor-pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}
.pager-dropdown-wrap {
  position: relative;
  cursor: pointer;
}
.editor-pager-current {
  font-weight: 600;
  font-size: 13px;
}
.editor-pager-link {
  background: none;
  border: none;
  color: #334155;
  font-size: 13px;
  cursor: pointer;
}
.editor-pager-link:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* НИЖНЯЯ ПАНЕЛЬ ИНСТРУМЕНТОВ */
.bottom-tools-section {
  margin-top: auto;
  background: white;
  border-top: 1px solid #e2e8f0;
}
.tool-content-panel {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  min-height: 85px;
  display: flex;
  align-items: center;
  padding: 10px 16px;
}
.tool-pane {
  width: 100%;
}
.filter-bar {
  display: flex;
  gap: 16px;
  font-size: 12px;
  margin-bottom: 8px;
  color: #64748b;
}
.filter-bar span {
  cursor: pointer;
}
.filter-bar span.active {
  color: black;
  font-weight: bold;
  border-bottom: 2px solid black;
}

.horizontal-scroll-gallery {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.scroll-thumb img {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
}

.style-idea-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  cursor: pointer;
}
.mini-grid-preview {
  width: 45px;
  height: 45px;
  background: #e2e8f0;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
}

.color-picker-scroll {
  display: flex;
  gap: 12px;
}
.color-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  cursor: pointer;
}

.sticker-item {
  font-size: 26px;
  cursor: pointer;
}
.ai-rearrange-btn {
  width: 100%;
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

/* ТАБ БАР С КНОПКАМИ */
.editor-bottom-tabs {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}
.tab-btn-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  cursor: pointer;
}
.tab-btn-item.active {
  color: var(--btn-color, #ff4d35);
}
.tab-btn-item img {
  width: 20px;
  height: 20px;
}
</style>
