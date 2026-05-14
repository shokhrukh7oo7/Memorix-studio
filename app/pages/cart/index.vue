<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import giftImage from "~/assets/images/gift.png";
import {
  loadCart,
  clearCart,
  prependActiveOrder,
  savePendingOrder,
  loadBookDraft,
  type CartLine,
} from "~/utils/albumStorage";

const router = useRouter();

const cart = ref<CartLine[]>([]);
const qty = ref(1);
const giftWrapped = ref(true);
const showPayModal = ref(false);
const agreedLowQuality = ref(false);

onMounted(() => {
  cart.value = loadCart();
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

  prependActiveOrder({
    image: line.value.coverDataUrl,
    title: line.value.title,
    status: "In review",
    price: line.value.newPrice,
  });

  savePendingOrder({
    coverDataUrl: line.value.coverDataUrl,
    photoCount: line.value.photoCount,
    title: line.value.title,
    orderId,
  });

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
        <BaseButton @click="goBack">
          <img :src="arrowLeft" alt="Back" />
        </BaseButton>
        <h2>Cart</h2>
      </div>
    </div>

    <template v-if="line">
      <div class="cart-card">
        <div class="cart-card-row">
          <div class="cart-thumb">
            <img :src="line.coverDataUrl" alt="" />
          </div>
          <div class="cart-card-body">
            <h3>{{ line.title }}</h3>
            <p class="cart-prices">
              <span class="old">{{ line.oldPrice }}</span>
              <span class="new">{{ line.newPrice }}</span>
            </p>
            <div class="cart-row-actions">
              <div class="qty">
                <button type="button" @click="qty = Math.max(1, qty - 1)">
                  −
                </button>
                <span>{{ qty }}</span>
                <button type="button" @click="qty += 1">+</button>
              </div>
              <button
                type="button"
                class="cart-trash"
                aria-label="Remove"
                @click="removeFromCart"
              >
                🗑
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
        Go to checkout →
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
.cart-page {
  padding-bottom: 40px;
}

.cart-card {
  border: 1px solid var(--temp-border-color);
  border-radius: var(--border-radius-default);
  padding: 12px;
  margin-bottom: 16px;
}

.cart-card-row {
  display: flex;
  gap: 12px;
}

.cart-thumb {
  width: 100px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-color);
}

.cart-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-card-body h3 {
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-work);
  margin: 0 0 8px;
}

.cart-prices {
  margin: 0 0 10px;
}

.cart-prices .old {
  text-decoration: line-through;
  color: var(--grey-color);
  margin-right: 8px;
  font-size: 14px;
}

.cart-prices .new {
  font-weight: 700;
  font-size: 15px;
}

.cart-row-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qty {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-jet);
}

.qty button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--display-grey-color);
  border-radius: 8px;
  background: var(--white-color);
  cursor: pointer;
}

.cart-trash {
  border: none;
  background: var(--btn-color);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
}

.cart-details {
  margin-top: 8px;
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
