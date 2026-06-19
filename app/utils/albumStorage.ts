export const UPLOADED_PHOTOS_KEY = "uploadedPhotos";

export const PENDING_ORDER_KEY = "memorix_pending_order";

export const BOOK_DRAFT_KEY = "memorix_book_draft";

export const CART_KEY = "memorix_cart";

export const ACTIVE_ORDERS_KEY = "memorix_orders_active";

export interface UploadedPhoto {
  name: string;
  url: string | ArrayBuffer | null;
}

export interface PendingOrder {
  coverDataUrl: string;
  photoCount: number;
  title: string;
  orderId: string;
}

/** Selected template + book page count (10 / 20 / 30) from DetailSheet */
export interface BookDraft {
  bookPages: number;
  templateTitle: string;
  colorName: string;
  templateId: string | null;
  coverImage?: string;
  albumId?: string;
}

export interface CartLine {
  id: string;
  coverDataUrl: string;
  title: string;
  bookPages: number;
  photoCount: number;
  oldPrice: string;
  newPrice: string;
}

export type OrderStatus =
  | "Pending"
  | "In review"
  | "In progress"
  | "Packing"
  | "Delivering"
  | "Completed"
  | "Cancelled";

export interface StoredOrder {
  image: string;
  title: string;
  status: OrderStatus;
  price: string;
}

export function loadUploadedPhotos(): UploadedPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UPLOADED_PHOTOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UploadedPhoto[]) : [];
  } catch {
    return [];
  }
}

export function saveUploadedPhotos(photos: UploadedPhoto[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(UPLOADED_PHOTOS_KEY, JSON.stringify(photos));
}

export function savePendingOrder(order: PendingOrder) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
}

export function loadPendingOrder(): PendingOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingOrder;
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_ORDER_KEY);
}

export function saveBookDraft(draft: BookDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOK_DRAFT_KEY, JSON.stringify(draft));
}

export function loadBookDraft(): BookDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BOOK_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookDraft;
  } catch {
    return null;
  }
}

export function saveCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export function loadCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function loadActiveOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVE_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

export function prependActiveOrder(order: StoredOrder) {
  if (typeof window === "undefined") return;
  const cur = loadActiveOrders();
  cur.unshift(order);
  localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(cur));
}
// ========================================================================================
// Очистка после обновнение
export function clearUploadedPhotos() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UPLOADED_PHOTOS_KEY);
}

export function clearBookDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BOOK_DRAFT_KEY);
}

/* Полная очистка временных данных редактора
 * (Оставляем корзину CART_KEY и заказы ACTIVE_ORDERS_KEY, чтобы не злить пользователя)
 */
export function clearEditorSessionData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UPLOADED_PHOTOS_KEY);
  localStorage.removeItem(BOOK_DRAFT_KEY);
  localStorage.removeItem(PENDING_ORDER_KEY);
}