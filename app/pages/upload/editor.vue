<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import BaseButton from "~/components/ui/BaseButton.vue";

// Импорты иконок
import arrowLeft from "~/assets/images/arrow-left.svg";
import dotsImage from "~/assets/images/dots.svg";
import arrowUndo from "~/assets/images/arrow-undo.svg";
import arrowRedo from "~/assets/images/arrow-redo.svg";
import historyIcon from "~/assets/images/history.svg";
import allPageIcon from "~/assets/images/all-page.svg";
import moreDotsImage from "~/assets/images/more-dots.svg";
import allPageTwoIcon from "~/assets/images/all-page-2.svg";
import noticeIcon from "~/assets/images/notice.svg";
import previewIcon from "~/assets/images/preview.svg";
import leaveIcon from "~/assets/images/logout.svg";
import listImage from "~/assets/images/list.svg";
import trashIcon from "~/assets/images/trashIcon.svg";
import duplicateIcon from "~/assets/images/duplicate.svg";

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

// --- СОСТОЯНИЕ СТИКЕРОВ ---
const activeStickerId = ref<string | null>(null);

function selectSticker(stickerId: string) {
  activeStickerId.value =
    activeStickerId.value === stickerId ? null : stickerId;
}

function zoomSticker(sticker: StickerState, direction: "in" | "out") {
  const delta = direction === "in" ? 0.2 : -0.2;
  sticker.scale = Math.max(0.5, Math.min(3, sticker.scale + delta));
  saveToHistory();
}

// --- СОСТОЯНИЕ ДАННЫХ ---
const photos = ref<UploadedPhoto[]>([]);
const totalPages = ref(10);
const currentSpreadIndex = ref(0);
const selectedPhotoIndex = ref<number>(-1);

const layoutStyles = [
  { name: "Magazine Style", slots: 1, class: "layout-magazine" },
  { name: "Collage", slots: 3, class: "layout-collage" },
  { name: "Photo Grid", slots: 4, class: "layout-grid" },
  { name: "Moodboard", slots: 5, class: "layout-moodboard" },
  { name: "Scrapbook", slots: 2, class: "layout-scrapbook" },
  { name: "Polaroid Collage", slots: 3, class: "layout-polaroid" },
  { name: "Photo Dump", slots: 6, class: "layout-dump" },
  { name: "Pinterest Style", slots: 4, class: "layout-pinterest" },
  { name: "Aesthetic Collage", slots: 3, class: "layout-aesthetic" },
];

interface StickerState {
  id: string;
  type: "emoji" | "svg" | "image";
  value: string;
  char: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface PageState {
  pageNumber: number;
  layoutTitle: string;
  layoutClass: string;
  photoIndices: number[];
  textTitle: string;
  textContent: string;
  stickers?: StickerState[];
}

interface SpreadState {
  id: number;
  leftPage: PageState | null;
  rightPage: PageState;
  stickers?: StickerState[];
}

const bookSpreads = ref<SpreadState[]>([]);

// --- СИСТЕМА UNDO / REDO ---
const historyStack = ref<string[]>([]);
const historyPointer = ref(-1);

function saveToHistory() {
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

// --- МЕНЮ И НАВИГАЦИЯ ---
const activeMenu = ref<"document" | "more" | "history" | "pages-select" | null>(
  null,
);
function toggleMenu(menu: "document" | "more" | "history" | "pages-select") {
  activeMenu.value = activeMenu.value === menu ? null : menu;
}
function closeAllMenus() {
  activeMenu.value = null;
}

type ToolTab = "photos" | "ideas" | "background" | "sticker" | "smart";
const activeTool = ref<ToolTab>("photos");
const selectedBackground = ref("#ececec");
const activeFilter = ref("all");

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

// --- ИНИЦИАЛИЗАЦИЯ КНИГИ ---
onMounted(() => {
  photos.value = loadUploadedPhotos();
  const draft = loadBookDraft();
  if (draft?.bookPages) {
    totalPages.value = Number(draft.bookPages);
  }

  generateInitialLayouts();
  historyStack.value.push(JSON.stringify(bookSpreads.value));
  historyPointer.value = 0;
});

function generateInitialLayouts() {
  const totalPagesCount = totalPages.value;
  const tempSpreads: SpreadState[] = [];
  let photoGlIdx = 0;

  const firstRightStyle = layoutStyles[0];
  const firstRightIndices: number[] = [];
  for (let s = 0; s < firstRightStyle.slots; s++) {
    firstRightIndices.push(
      photoGlIdx < photos.value.length ? photoGlIdx++ : -1,
    );
  }

  tempSpreads.push({
    id: 0,
    leftPage: null,
    rightPage: {
      pageNumber: 1,
      layoutTitle: firstRightStyle.name,
      layoutClass: firstRightStyle.class,
      photoIndices: firstRightIndices,
      textTitle: "Title",
      textContent: "Enter text",
      stickers: [],
    },
    stickers: [],
  });

  let currentPageNum = 2;
  while (currentPageNum <= totalPagesCount) {
    const leftPageNum = currentPageNum;
    const rightPageNum = currentPageNum + 1;

    const leftStyle = layoutStyles[leftPageNum % layoutStyles.length];
    const leftIndices: number[] = [];
    for (let s = 0; s < leftStyle.slots; s++) {
      leftIndices.push(photoGlIdx < photos.value.length ? photoGlIdx++ : -1);
    }

    let rightPageData: PageState | null = null;
    if (rightPageNum <= totalPagesCount) {
      const rightStyle = layoutStyles[rightPageNum % layoutStyles.length];
      const rightIndices: number[] = [];
      for (let s = 0; s < rightStyle.slots; s++) {
        rightIndices.push(photoGlIdx < photos.value.length ? photoGlIdx++ : -1);
      }
      rightPageData = {
        pageNumber: rightPageNum,
        layoutTitle: rightStyle.name,
        layoutClass: rightStyle.class,
        photoIndices: rightIndices,
        textTitle: "Title",
        textContent: "Enter text",
        stickers: [],
      };
    } else {
      rightPageData = {
        pageNumber: rightPageNum,
        layoutTitle: "Empty",
        layoutClass: "layout-magazine",
        photoIndices: [-1],
        textTitle: "",
        textContent: "",
        stickers: [],
      };
    }

    tempSpreads.push({
      id: tempSpreads.length,
      leftPage: {
        pageNumber: leftPageNum,
        layoutTitle: leftStyle.name,
        layoutClass: leftStyle.class,
        photoIndices: leftIndices,
        textTitle: "Title",
        textContent: "Enter text",
        stickers: [],
      },
      rightPage: rightPageData,
      stickers: [],
    });

    currentPageNum += 2;
  }

  bookSpreads.value = tempSpreads;
}

// Выбор фотографии в галерее внизу
function handleSelectPhoto(idx: number) {
  selectedPhotoIndex.value = selectedPhotoIndex.value === idx ? -1 : idx;
}

// Клик по слоту на странице (вставка выбранного фото)
function handleSlotClick(pageSide: "left" | "right", slotIndex: number) {
  const targetSpread = bookSpreads.value[currentSpreadIndex.value];
  if (!targetSpread) return;

  const targetPage =
    pageSide === "left" ? targetSpread.leftPage : targetSpread.rightPage;
  if (!targetPage) return;

  if (selectedPhotoIndex.value !== -1) {
    targetPage.photoIndices[slotIndex] = selectedPhotoIndex.value;
    saveToHistory();
    selectedPhotoIndex.value = -1;
  } else if (targetPage.photoIndices[slotIndex] !== -1) {
    targetPage.photoIndices[slotIndex] = -1;
    saveToHistory();
  }
}

function updateText(
  pageSide: "left" | "right",
  type: "title" | "content",
  value: string,
) {
  const targetSpread = bookSpreads.value[currentSpreadIndex.value];
  if (!targetSpread) return;

  if (pageSide === "left" && targetSpread.leftPage) {
    if (type === "title") targetSpread.leftPage.textTitle = value;
    else targetSpread.leftPage.textContent = value;
  } else if (pageSide === "right" && targetSpread.rightPage) {
    if (type === "title") targetSpread.rightPage.textTitle = value;
    else targetSpread.rightPage.textContent = value;
  }
  saveToHistory();
}

function changeBackground(color: string) {
  selectedBackground.value = color;
  saveToHistory();
}

// Применение стиля/сетки к текущей странице книги
// Applies to BOTH left and right pages for all spreads except spread 0 (pages 1-2 cover)
function applyLayoutToRightPage(styleClass: string, styleName: string) {
  const targetSpread = bookSpreads.value[currentSpreadIndex.value];
  if (!targetSpread) return;

  const currentStyle = layoutStyles.find((s) => s.class === styleClass);

  function applyToPage(page: PageState) {
    page.layoutClass = styleClass;
    page.layoutTitle = styleName;
    if (currentStyle) {
      const currentLength = page.photoIndices.length;
      if (currentLength < currentStyle.slots) {
        while (page.photoIndices.length < currentStyle.slots) {
          page.photoIndices.push(-1);
        }
      } else if (currentLength > currentStyle.slots) {
        page.photoIndices = page.photoIndices.slice(0, currentStyle.slots);
      }
    }
  }

  // Always apply to right page
  applyToPage(targetSpread.rightPage);

  // Apply to left page too, but skip spread 0 (the cover — pages 1-2)
  if (currentSpreadIndex.value > 0 && targetSpread.leftPage) {
    applyToPage(targetSpread.leftPage);
  }

  saveToHistory();
}

// --- ФУНКЦИОНАЛЬНОСТЬ СТИКЕРОВ ---

const stickerCategories = [
  {
    name: "😀",
    items: [
      { type: "emoji", value: "😀" },
      { type: "emoji", value: "😂" },
      { type: "emoji", value: "😍" },
      { type: "emoji", value: "😎" },
      { type: "emoji", value: "🤩" },
      { type: "emoji", value: "🥳" },
      { type: "emoji", value: "😢" },
      { type: "emoji", value: "😡" },
      { type: "emoji", value: "🤔" },
      { type: "emoji", value: "🫡" },
      { type: "emoji", value: "😁" },
      { type: "emoji", value: "😏" },
      { type: "emoji", value: "😛" },
      { type: "emoji", value: "🫤" },
      { type: "emoji", value: "😓" },
      { type: "emoji", value: "🫠" },
      { type: "emoji", value: "🙃" },
      { type: "emoji", value: "😭" },
      { type: "emoji", value: "🥵" },
      { type: "emoji", value: "🥶" },
    ],
  },
  {
    name: "🙌",
    items: [
      { type: "emoji", value: "🙌" },
      { type: "emoji", value: "💪" },
      { type: "emoji", value: "🦵" },
      { type: "emoji", value: "👂" },
      { type: "emoji", value: "🦻" },
      { type: "emoji", value: "👃" },
      { type: "emoji", value: "🤏" },
      { type: "emoji", value: "👇" },
      { type: "emoji", value: "👆" },
      { type: "emoji", value: "🫵" },
      { type: "emoji", value: "☝️" },
      { type: "emoji", value: "👉" },
      { type: "emoji", value: "👈" },
      { type: "emoji", value: "✌️" },
      { type: "emoji", value: "🤞" },
      { type: "emoji", value: "🖖" },
      { type: "emoji", value: "🫱" },
      { type: "emoji", value: "🫲" },
      { type: "emoji", value: "🫳" },
      { type: "emoji", value: "🫴" },
      { type: "emoji", value: "🫷" },
      { type: "emoji", value: "🫸" },
      { type: "emoji", value: "🤘" },
      { type: "emoji", value: "🤙" },
      { type: "emoji", value: "🖐️" },
    ],
  },
  {
    name: "🍕",
    items: [
      { type: "emoji", value: "🍕" },
      { type: "emoji", value: "🍔" },
      { type: "emoji", value: "🍟" },
      { type: "emoji", value: "🌭" },
      { type: "emoji", value: "🍿" },
      { type: "emoji", value: "🧂" },
      { type: "emoji", value: "🥓" },
      { type: "emoji", value: "🥚" },
      { type: "emoji", value: "🥗" },
      { type: "emoji", value: "🍗" },
      { type: "emoji", value: "🥩" },
      { type: "emoji", value: "☕" },
      { type: "emoji", value: "🍷" },
      { type: "emoji", value: "🍹" },
      { type: "emoji", value: "🍸" },
      { type: "emoji", value: "🍉" },
      { type: "emoji", value: "🥭" },
      { type: "emoji", value: "🍍" },
      { type: "emoji", value: "🍌" },
      { type: "emoji", value: "🍋" },
      { type: "emoji", value: "🍒" },
      { type: "emoji", value: "🍓" },
      { type: "emoji", value: "🌽" },
      { type: "emoji", value: "🍆" },
    ],
  },
  {
    name: "❤️",
    items: [
      { type: "emoji", value: "❤️" },
      { type: "emoji", value: "✨" },
      { type: "emoji", value: "🔥" },
      { type: "emoji", value: "🎉" },
      { type: "emoji", value: "👑" },
      { type: "emoji", value: "💘" },
      { type: "emoji", value: "💖" },
      { type: "emoji", value: "💗" },
      { type: "emoji", value: "💓" },
      { type: "emoji", value: "💞" },
      { type: "emoji", value: "💔" },
    ],
  },
  {
    name: "✈️",
    items: [
      { type: "emoji", value: "✈️" },
      { type: "emoji", value: "🌍" },
      { type: "emoji", value: "📸" },
      { type: "emoji", value: "🏖️" },
      { type: "emoji", value: "🧳" },
      { type: "emoji", value: "🗺️" },
    ],
  },
  {
    name: "🔔",
    items: [
      { type: "emoji", value: "☀️" },
      { type: "emoji", value: "🌙" },
      { type: "emoji", value: "⭐" },
      { type: "emoji", value: "⚡" },
      { type: "emoji", value: "💤" },
      { type: "emoji", value: "🌈" },
    ],
  },
];

const activeStickerCategory = ref(0);

function addStickerToCurrentPage(stickerItem: { type: string; value: string }) {
  const targetSpread = bookSpreads.value[currentSpreadIndex.value];
  if (!targetSpread) return;

  if (!targetSpread.stickers) targetSpread.stickers = [];

  targetSpread.stickers.push({
    id: "sticker_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    type: stickerItem.type as "emoji" | "svg" | "image",
    value: stickerItem.value,
    char: stickerItem.value,
    x: 40,
    y: 35,
    scale: 1,
    rotation: 0,
  });

  saveToHistory();
}

function deleteSticker(page: PageState | SpreadState, stickerId: string) {
  if (!page.stickers) return;
  page.stickers = page.stickers.filter((s) => s.id !== stickerId);
  saveToHistory();
}

function rotateSticker(sticker: StickerState) {
  sticker.rotation = (sticker.rotation + 45) % 360;
  saveToHistory();
}

function handleStickerWheel(event: WheelEvent, sticker: StickerState) {
  event.preventDefault();
  const delta = event.deltaY < 0 ? 0.1 : -0.1;
  sticker.scale = Math.max(0.5, Math.min(3, sticker.scale + delta));
  saveToHistory();
}

// Перетаскивание стикеров (Мышь и Touch события)
let activeDragSticker: StickerState | null = null;
let startX = 0;
let startY = 0;
let startStickerX = 0;
let startStickerY = 0;
let dragContainer: HTMLElement | null = null;

function startDrag(
  event: MouseEvent | TouchEvent,
  sticker: StickerState,
  pageClass?: string,
) {
  if (event instanceof MouseEvent && event.button !== 0) return;

  activeDragSticker = sticker;

  const targetElement = event.currentTarget as HTMLElement;
  dragContainer = targetElement.closest(".editor-spread") as HTMLElement;

  const clientX =
    event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  const clientY =
    event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

  startX = clientX;
  startY = clientY;
  startStickerX = sticker.x;
  startStickerY = sticker.y;

  if (event instanceof MouseEvent) {
    window.addEventListener("mousemove", onDragging);
    window.addEventListener("mouseup", stopDrag);
  } else {
    window.addEventListener("touchmove", onDragging, { passive: false });
    window.addEventListener("touchend", stopDrag);
  }
}

function onDragging(event: MouseEvent | TouchEvent) {
  if (!activeDragSticker || !dragContainer) return;

  if (event instanceof TouchEvent) {
    event.preventDefault();
  }

  const clientX =
    event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  const clientY =
    event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  const containerWidth = dragContainer.clientWidth;
  const containerHeight = dragContainer.clientHeight;

  const pctDeltaX = (deltaX / containerWidth) * 100;
  const pctDeltaY = (deltaY / containerHeight) * 100;

  activeDragSticker.x = Math.max(0, Math.min(90, startStickerX + pctDeltaX));
  activeDragSticker.y = Math.max(0, Math.min(90, startStickerY + pctDeltaY));
}

function stopDrag(event: MouseEvent | TouchEvent) {
  if (event instanceof MouseEvent) {
    window.removeEventListener("mousemove", onDragging);
    window.removeEventListener("mouseup", stopDrag);
  } else {
    window.removeEventListener("touchmove", onDragging);
    window.removeEventListener("touchend", stopDrag);
  }
  if (activeDragSticker) {
    activeDragSticker = null;
    saveToHistory();
  }
}

const goBack = () => router.push("/upload/upload");
const goOrder = () => router.push("/orders");
const goPreview = () => router.push("/upload/preview");
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
            <img :src="allPageTwoIcon" />
            <div>
              <p>All page</p>
              <span>Last saved: 21 Feb 2026, 12:17:23</span>
            </div>
          </li>
          <li>
            <span class="icon"><img :src="noticeIcon" alt="icon" /></span>
            Notices
          </li>
          <li>
            <span class="icon"><img :src="previewIcon" alt="icon" /></span>
            Preview
          </li>
          <li class="danger-action" @click="goBack">
            <span class="icon"><img :src="leaveIcon" alt="icon" /></span>
            Leave editor and back to home page
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
          <button class="editor-tool">
            <img :src="allPageIcon" alt="All page" /> All page
          </button>
          <button class="editor-tool" @click="toggleMenu('more')">
            <img :src="moreDotsImage" alt="More" /> More
          </button>
        </div>

        <div v-if="activeMenu === 'more'" class="dropdown-menu more-dropdown">
          <ul>
            <li><img :src="listImage" alt="icon" /> Add spreads</li>
            <li class="disabled-li">
              <img :src="trashIcon" alt="icon" /> Remove spread
            </li>
            <li class="disabled-li">
              <img :src="duplicateIcon" alt="icon" /> Duplicate spread
            </li>
          </ul>
        </div>

        <div
          v-if="activeMenu === 'history'"
          class="dropdown-menu history-dropdown"
        >
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
        <!-- LEFT PAGE -->
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
            <div class="page-content-wrapper">
              <div
                class="page-layout-grid"
                :class="currentSpread.leftPage.layoutClass"
              >
                <div
                  v-for="(photoIdx, pIdx) in currentSpread.leftPage.photoIndices"
                  :key="pIdx"
                  class="grid-photo-slot"
                  @click="handleSlotClick('left', pIdx)"
                >
                  <img
                    v-if="photoIdx !== -1 && photos[photoIdx]"
                    :src="String(photos[photoIdx]?.url)"
                  />
                  <div v-else class="empty-slot-placeholder">
                    <span>+</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-for="sticker in currentSpread.leftPage.stickers"
              :key="sticker.id"
              class="absolute-sticker"
              :style="{
                left: sticker.x + '%',
                top: sticker.y + '%',
                transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              }"
              @mousedown="startDrag($event, sticker, 'left')"
              @touchstart="startDrag($event, sticker, 'left')"
              @wheel="handleStickerWheel($event, sticker)"
              @dblclick="rotateSticker(sticker)"
              @contextmenu.prevent="
                deleteSticker(currentSpread.leftPage, sticker.id)
              "
            >
              {{ sticker.char }}
            </div>
          </template>
        </div>

        <!-- RIGHT PAGE -->
        <div
          class="editor-page-side page-right"
          :style="{ backgroundColor: selectedBackground }"
        >
          <div class="page-content-wrapper">
            <div
              class="page-layout-grid"
              :class="currentSpread.rightPage.layoutClass"
            >
              <div
                v-for="(photoIdx, pIdx) in currentSpread.rightPage.photoIndices"
                :key="pIdx"
                class="grid-photo-slot"
                @click="handleSlotClick('right', pIdx)"
              >
                <img
                  v-if="photoIdx !== -1 && photos[photoIdx]"
                  :src="String(photos[photoIdx]?.url)"
                />
                <div v-else class="empty-slot-placeholder"><span>+</span></div>
              </div>
            </div>
          </div>

          <div
            v-for="sticker in currentSpread.stickers"
            :key="sticker.id"
            class="absolute-sticker-wrapper"
            :style="{
              left: sticker.x + '%',
              top: sticker.y + '%',
              transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
            }"
            :class="{ 'is-active-sticker': activeStickerId === sticker.id }"
            @mousedown="startDrag($event, sticker)"
            @touchstart="startDrag($event, sticker)"
            @wheel="handleStickerWheel($event, sticker)"
            @click.stop="selectSticker(sticker.id)"
            @contextmenu.prevent="deleteSticker(currentSpread, sticker.id)"
          >
            <div
              v-if="activeStickerId === sticker.id"
              class="sticker-controls"
              @click.stop
            >
              <button
                type="button"
                class="ctrl-btn"
                @click="zoomSticker(sticker, 'in')"
              >
                +
              </button>
              <button
                type="button"
                class="ctrl-btn"
                @click="zoomSticker(sticker, 'out')"
              >
                -
              </button>
              <button
                type="button"
                class="ctrl-btn"
                @click="rotateSticker(sticker)"
              >
                🔄
              </button>
              <button
                type="button"
                class="ctrl-btn danger"
                @click="deleteSticker(currentSpread, sticker.id)"
              >
                ❌
              </button>
            </div>

            <div
              class="sticker-body"
              :class="{ 'text-badge': sticker.value.length > 4 }"
            >
              <template v-if="sticker.type === 'emoji'">
                {{ sticker.value }}
              </template>
              <template v-else-if="sticker.type === 'svg'">
                <img
                  :src="sticker.value"
                  style="width: 100%; height: 100%; object-fit: contain"
                  alt="sticker"
                />
              </template>
            </div>
          </div>

          <template v-if="currentSpreadIndex === 0">
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
          </template>
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
            <div
              v-for="(img, idx) in photos"
              :key="idx"
              class="scroll-thumb"
              :class="{ 'selected-thumb': idx === selectedPhotoIndex }"
              @click="handleSelectPhoto(idx)"
            >
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
              @click="applyLayoutToRightPage(style.class, style.name)"
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
          <div class="sticker-categories-tabs">
            <button
              v-for="(cat, idx) in stickerCategories"
              :key="idx"
              type="button"
              class="sticker-cat-btn"
              :class="{ active: activeStickerCategory === idx }"
              @click="activeStickerCategory = idx"
            >
              {{ cat.name }}
            </button>
          </div>

          <div class="horizontal-scroll-gallery stickers-grid">
            <div
              v-for="(item, idx) in stickerCategories[activeStickerCategory]
                .items"
              :key="idx"
              class="sticker-picker-item"
              @click="addStickerToCurrentPage(item)"
            >
              <template v-if="item.type === 'emoji'">
                {{ item.value }}
              </template>
              <template v-else-if="item.type === 'svg'">
                <img :src="item.value" alt="sticker" />
              </template>
            </div>
          </div>
        </div>

        <div v-if="activeTool === 'smart'" class="tool-pane internal-smart">
          <button class="ai-rearrange-btn" @click="generateInitialLayouts">
            Auto-shuffle Album Layouts via AI
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

      <div class="preview-design-btn-wrapper">
        <BaseButton @click="goPreview"> Preview your design </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ВСПЛЫВАЮЩИЕ МЕНЮ (DROPDOWNS НА МАКЕТЕ) */
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
  overflow-y: auto;
  width: 339px;
  top: auto;
}
.pager-select-dropdown li.active {
  background: var(--btn-color, #ff4d35);
  color: white;
}

/* ТУЛБАР */
.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

/* ДИНАМИЧЕСКИЕ СЕТКИ ФОТО */
.page-layout-grid {
  display: grid;
  gap: 6px;
  flex-grow: 1;
  margin-bottom: 12px;
  height: 100%;
  min-height: 0;
}
.layout-magazine {
  grid-template-columns: 1fr;
}
.layout-minimal {
  grid-template-columns: 1fr 1fr;
}
.layout-collage {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1fr;
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
  display: flex;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.grid-photo-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
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
  padding: 4px 8px;
  user-select: none;
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
.scroll-thumb {
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
  cursor: pointer;
}
.scroll-thumb.selected-thumb {
  border-color: #6366f1;
  transform: scale(1.05);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius-circular);
  padding: 0 2px;
}

.editor-page-side {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

/* --- СТИЛИ ДЛЯ ПОДДЕРЖКИ СТИКЕРОВ --- */
.page-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.absolute-sticker {
  position: absolute;
  font-size: 32px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: move;
  user-select: none;
  touch-action: none;
  z-index: 10;
  transform-origin: center center;
  transition: transform 0.05s linear;
}

/* Панель категорий стикеров */
.sticker-categories-tabs {
  display: flex;
  gap: 5px;
  padding: 8px;
  border-bottom: 1px solid #f1f5f9;
  overflow-x: auto;
}

.sticker-cat-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 20px;
  padding: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.sticker-cat-btn.active {
  background: #6366f1;
  color: white;
  padding: 6px 12px;
}

.stickers-grid {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: center;
}

.sticker-picker-item {
  font-size: 28px;
  cursor: pointer;
  padding: 6px;
  user-select: none;
  transition: transform 0.1s ease;
  white-space: nowrap;
}

.sticker-picker-item:hover {
  transform: scale(1.15);
}

.sticker-picker-item img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

/* Стилизация текстовых плашек на самом холсте */
.absolute-sticker.text-badge {
  font-size: 18px;
  font-weight: bold;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  font-family: "Arial", sans-serif;
  color: #1e293b;
}

.absolute-sticker-wrapper {
  position: absolute;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.absolute-sticker-wrapper:active {
  cursor: grabbing;
}

/* Рамка вокруг активного стикера */
.is-active-sticker .sticker-body {
  outline: 2px dashed #ff4d35;
  outline-offset: 4px;
  border-radius: 4px;
}

/* Контейнер с кнопками управления */
.sticker-controls {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.ctrl-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ctrl-btn:active {
  background: #e2e8f0;
}

.ctrl-btn.danger {
  background: #fee2e2;
  color: #ef4444;
}
</style>