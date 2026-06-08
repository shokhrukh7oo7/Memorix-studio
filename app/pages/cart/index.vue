<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import giftImage from "~/assets/images/gift.png";
import {
  loadCart,
  loadUploadedPhotos,
  clearCart,
  prependActiveOrder,
  savePendingOrder,
  loadBookDraft,
  type CartLine,
} from "~/utils/albumStorage";
import trashIcon from "~/assets/images/trash.svg";
import arrowLeftCircleIcon from "~/assets/images/arrow-circle.svg";

const router = useRouter();

const cart = ref<CartLine[]>([]);
const qty = ref(1);
const giftWrapped = ref(true);
const showPayModal = ref(false);
const agreedLowQuality = ref(false);
const uploadedPhotos = ref<{ url: string | ArrayBuffer | null }[]>([]);

onMounted(() => {
  cart.value = loadCart();
  uploadedPhotos.value = loadUploadedPhotos();
});

const coverSrc = computed(() => {
  if (line.value?.coverDataUrl) return line.value.coverDataUrl;
  const first = uploadedPhotos.value[0];
  return first ? String(first.url) : "";
});

const line = computed(() => cart.value[0] ?? null);

const cartTotal = computed(() => {
  if (!line.value) return "$0";
  const base = 32.99;
  const gift = giftWrapped.value ? 2.99 : 0;
  const total = (base + gift) * qty.value;
  return `$${total.toFixed(2)}`;
});

const goBack = () => {
  router.back();
};

const openCheckoutModal = () => {
  if (!line.value) return;
  showPayModal.value = true;
  agreedLowQuality.value = false;
};

const removeFromCart = () => {
  clearCart();
  cart.value = [];
};

const confirmCheckout = () => {
  if (!line.value || !agreedLowQuality.value) return;

  const orderId = `MX-${Date.now().toString(36).toUpperCase().slice(-10)}`;

  // prependActiveOrder({
  //   image: coverSrc.value,
  //   title: line.value.title,
  //   status: "In review",
  //   price: line.value.newPrice,
  // });
  try {
    prependActiveOrder({
      image: coverSrc.value,
      title: line.value.title,
      status: "In review",
      price: line.value.newPrice,
    });
  } catch {
    prependActiveOrder({
      image: "",
      title: line.value.title,
      status: "In review",
      price: line.value.newPrice,
    });
  }

  // savePendingOrder({
  //   coverDataUrl: coverSrc.value,
  //   photoCount: line.value.photoCount,
  //   title: line.value.title,
  //   orderId,
  // });
  try {
    savePendingOrder({
      coverDataUrl: coverSrc.value,
      photoCount: line.value.photoCount,
      title: line.value.title,
      orderId,
    });
  } catch {
    savePendingOrder({
      coverDataUrl: "",
      photoCount: line.value.photoCount,
      title: line.value.title,
      orderId,
    });
  }

  clearCart();
  cart.value = [];
  showPayModal.value = false;
  router.push("/orders");
};

const bookDraft = computed(() => loadBookDraft());
</script>

<template>
  <div class="cart-page">
    <div class="template-page-container">
      <div class="template-back-header">
        <div class="template-btn-wrapper">
          <BaseButton @click="goBack">
            <img :src="arrowLeft" alt="Back" />
          </BaseButton>
          <h2>Cart</h2>
        </div>
      </div>
    </div>

    <template v-if="line">
      <div class="cart-card">
        <div class="cart-card-row">
          <div class="cart-thumb">
            <img :src="coverSrc" alt="" />
          </div>
          <div class="cart-card-body">
            <div class="cart-card-body-content">
              <h3>{{ line.title }}</h3>
              <p class="cart-prices">
                <span class="old">{{ line.oldPrice }}</span>
                <span class="new">{{ line.newPrice }}</span>
              </p>
            </div>
            <div class="cart-row-actions">
              <div class="qty">
                <p class="qty-title">Qty</p>
                <div class="qty-counter-wrapper">
                  <button type="button" @click="qty = Math.max(1, qty - 1)">
                    −
                  </button>
                  <span>{{ qty }}</span>
                  <button type="button" @click="qty += 1">+</button>
                </div>
              </div>
              <button
                type="button"
                class="cart-trash"
                aria-label="Remove"
                @click="removeFromCart"
              >
                <img :src="trashIcon" alt="icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="order-details cart-details">
        <h4>More details</h4>
        <ul>
          <li>Cover type: Hardcover</li>
          <li>Size: 11.5″ × 8.5″ Vertical</li>
          <li>Paper finish: Gloss paper</li>
          <li>
            Template:
            {{
              bookDraft
                ? `${bookDraft.templateTitle} / ${bookDraft.colorName}`
                : "Your photos"
            }}
          </li>
          <li>Book pages: {{ line.bookPages }}</li>
        </ul>
      </div>

      <div class="extra-services">
        <h4>Extra services</h4>
        <div class="gift-card">
          <div class="gift-content">
            <label>
              <input v-model="giftWrapped" type="checkbox" />
              Gift wrapped
            </label>
            <p>Select this option to surprise the recipient.</p>
            <strong>Additional cost: $2.99</strong>
          </div>
          <div class="gift-image">
            <img :src="giftImage" alt="" />
          </div>
        </div>
      </div>

      <div class="cart-total">
        <h3>Cart Total</h3>
        <h3>{{ cartTotal }}</h3>
      </div>

      <BaseButton class="cart-checkout-btn" @click="openCheckoutModal">
        Go to checkout
        <img :src="arrowLeftCircleIcon" alt="icon" />
      </BaseButton>
    </template>

    <p v-else class="cart-empty">Your cart is empty.</p>

    <Teleport to="body">
      <div
        v-if="showPayModal"
        class="cart-modal-overlay"
        @click.self="showPayModal = false"
      >
        <div class="cart-modal" role="dialog" aria-labelledby="pay-title">
          <button
            type="button"
            class="cart-modal-close"
            aria-label="Close"
            @click="showPayModal = false"
          >
            ×
          </button>
          <h3 id="pay-title" class="cart-modal-title">Before you pay</h3>
          <p class="cart-modal-warn">
            ⚠ The uploaded files may include low-quality photos that can affect
            printing. We are not responsible for photo quality.
          </p>
          <label class="cart-modal-check">
            <input v-model="agreedLowQuality" type="checkbox" />
            <span>I am okay with it</span>
          </label>
          <BaseButton
            class="cart-modal-submit"
            :disabled="!agreedLowQuality"
            @click="confirmCheckout"
          >
            Go to checkout
          </BaseButton>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.cart-card .cart-card-row {
  display: flex;
  gap: 16px;
}

.cart-card .cart-card-row .cart-thumb {
  padding: 15px;
  border-radius: var(--border-radius-circular);
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-color);
}

.cart-card .cart-card-row .cart-thumb img {
  width: 100%;
  height: 100%;
  max-width: 110px;
  min-height: 140px;
  object-fit: cover;
  border-radius: var(--border-radius-circular);
}

.cart-card .cart-card-row .cart-card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cart-card .cart-card-row .cart-card-body h3 {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-work);
  color: var(--black-color);
  margin: 0 0 8px;
}

.cart-card .cart-card-row .cart-card-body .cart-prices {
  margin: 0 0 10px;
}

.cart-card .cart-card-row .cart-card-body .cart-prices .old {
  text-decoration: line-through;
  color: var(--grey-color);
  margin-right: 8px;
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-work);
}

.cart-card .cart-card-row .cart-card-body .cart-prices .new {
  font-size: 16px;
  font-weight: 400;
  color: var(--black-color);
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions .qty {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-jet);
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions .qty .qty-title {
  font-size: 10px;
  font-weight: 400;
  color: var(--black-color);
  font-family: var(--font-work);
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions .qty .qty-counter-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--display-grey-color);
  border-radius: var(--border-radius-circular);
  padding: 4px;
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions .qty .qty-counter-wrapper button {
  border: none;
  background: var(--white-color);
  cursor: pointer;
  padding: 5px 10px;
  font-size: clamp(10px, 1vw, 16px);
  color: var(--black-color);
}
.cart-card .cart-card-row .cart-card-body .cart-row-actions .qty .qty-counter-wrapper button:first-child {
  border-right: 1px solid var(--display-grey-color);
}
.cart-card .cart-card-row .cart-card-body .cart-row-actions .qty .qty-counter-wrapper button:last-child {
  border-left: 1px solid var(--display-grey-color);
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions .cart-trash {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 14px 8px 8px;
}

.cart-card .cart-card-row .cart-card-body .cart-row-actions .cart-trash img {
  width: 24px;
  height: 24px;
}

.cart-page .cart-details {
  padding: 24px 0;
  border-bottom: 1px solid var(--black-color);
}

.cart-page .cart-details h4 {
  font-size: 14px;
  font-weight: 400;
  color: var(--black-color);
  font-family: var(--font-jet);
  margin-bottom: 8px;
}

.cart-page .cart-details ul li {
  font-size: 14px;
  font-weight: 400;
  color: var(--black-grey-color);
  font-family: var(--font-work);
}

.cart-page .cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cart-page .cart-total h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--black-color);
  font-family: var(--font-work);
}

.cart-page .extra-services {
  margin: 16px 0;
}
.cart-page .extra-services h4 {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-jet);
  color: var(--black-color);
  margin-bottom: 16px;
}
.cart-page .extra-services .gift-card {
  border: 1px solid var(--temp-border-color);
  border-radius: var(--border-radius-default);
  padding: 12px;
  display: flex;
  align-items: center;
  position: relative;
}
.cart-page .extra-services .gift-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  width: 50%;
}
.cart-page .extra-services .gift-content label {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-jet);
  color: var(--black-color);
}
.cart-page .extra-services .gift-content p {
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-work);
  color: var(--black-grey-color);
  line-height: 120%;
}
.cart-page .extra-services .gift-content strong {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-work);
  color: var(--black-color);
}
.cart-page .extra-services .gift-card .gift-image {
  width: 144px;
  height: 144px;
  position: absolute;
  right: -10px;
}
.cart-page .extra-services .gift-card .gift-image img {
  width: 100%;
}
.cart-checkout-btn {
  margin-top: 20px;
}

.cart-checkout-btn :deep(.btn) {
  width: 100%;
}

.cart-empty {
  text-align: center;
  color: var(--black-grey-color);
  padding: 40px 16px;
}

.cart-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.cart-modal {
  position: relative;
  width: 100%;
  max-width: 340px;
  background: var(--white-color);
  border-radius: 16px;
  padding: 20px 18px 18px;
}

.cart-modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--black-color);
}

.cart-modal-title {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-work);
  margin: 0 28px 12px 0;
}

.cart-modal-warn {
  font-size: 13px;
  line-height: 140%;
  color: var(--black-color);
  margin: 0 0 16px;
}

.cart-modal-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-family: var(--font-work);
  margin-bottom: 16px;
  cursor: pointer;
}

.cart-modal-check input {
  width: 20px;
  height: 20px;
  accent-color: var(--btn-color);
}

.cart-modal-submit :deep(.btn) {
  width: 100%;
}

.cart-modal-submit :deep(.btn.is-disabled),
.cart-modal-submit :deep(button:disabled) {
  opacity: 0.45;
}
</style>
