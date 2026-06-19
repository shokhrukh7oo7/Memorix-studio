<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import Swal from "sweetalert2";
import BaseButton from "~/components/ui/BaseButton.vue";
import arrowLeft from "~/assets/images/arrow-left.svg";
import giftImage from "~/assets/images/gift.png";
import { clearEditorSessionData } from "~/utils/albumStorage";
import { formatMoney } from "~/utils/money";
import { useCart, type CartView } from "~/composables/useCart";
import { useContent, type ApiRegion, type ApiPricing } from "~/composables/useContent";
import { useOrders } from "~/composables/useOrders";
import { useAuth } from "~/composables/useAuth";
import { useApi } from "~/composables/useApi";
import trashIcon from "~/assets/images/trash.svg";
import arrowLeftCircleIcon from "~/assets/images/arrow-circle.svg";

const router = useRouter();
const { getCart, updateItem, removeItem } = useCart();
const { getRegions, getPricing } = useContent();
const { createOrder } = useOrders();
const { user } = useAuth();
const { errorMessage } = useApi();

const cartView = ref<CartView | null>(null);
const regions = ref<ApiRegion[]>([]);
const pricing = ref<ApiPricing | null>(null);

const giftPrice = computed(
  () => pricing.value?.extraServices.find((s) => s.id === "gift_wrap")?.price ?? 15000,
);
const giftCostLabel = computed(() => formatMoney(giftPrice.value));
const showPayModal = ref(false);
const agreedLowQuality = ref(false);
const submitting = ref(false);

// Checkout form
const form = ref({
  receiverName: "",
  receiverPhone: "",
  regionId: "",
  address: "",
});

const items = computed(() => cartView.value?.items ?? []);
const line = computed(() => items.value[0] ?? null);
const summary = computed(() => cartView.value?.summary ?? null);

const coverSrc = computed(() => line.value?.album.coverUrl ?? "");

// Gift wrap — barcha itemlarda gift_wrap bormi
const giftWrapped = computed({
  get: () => items.value.some((i) => i.extraServices.some((s) => s.id === "gift_wrap")),
  set: (val: boolean) => void toggleGift(val),
});

const cartTotal = computed(() => formatMoney(summary.value?.total));

async function loadCart() {
  cartView.value = await getCart();
}

onMounted(async () => {
  try {
    const [cv, rg, pr] = await Promise.all([getCart(), getRegions(), getPricing()]);
    cartView.value = cv;
    regions.value = rg;
    pricing.value = pr;
    if (user.value) {
      form.value.receiverName = user.value.fullName ?? "";
      form.value.receiverPhone = user.value.phone ?? "";
    }
    if (rg[0]) form.value.regionId = rg[0].id;
  } catch (e) {
    console.error(e);
  }
});

async function changeQty(itemId: string, delta: number) {
  const item = items.value.find((i) => i.id === itemId);
  if (!item) return;
  const next = Math.max(1, item.quantity + delta);
  if (next === item.quantity) return;
  try {
    cartView.value = await updateItem(itemId, { quantity: next });
  } catch (e) {
    Swal.fire({ icon: "error", title: "Xatolik", text: errorMessage(e), width: "395px" });
  }
}

async function toggleGift(val: boolean) {
  try {
    for (const item of items.value) {
      const services = val ? ["gift_wrap"] : [];
      cartView.value = await updateItem(item.id, { extraServices: services });
    }
  } catch (e) {
    Swal.fire({ icon: "error", title: "Xatolik", text: errorMessage(e), width: "395px" });
  }
}

const goBack = () => {
  router.back();
};

const openCheckoutModal = () => {
  if (!line.value) return;
  showPayModal.value = true;
  agreedLowQuality.value = false;
};

const removeFromCart = async (itemId: string) => {
  try {
    cartView.value = await removeItem(itemId);
  } catch (e) {
    Swal.fire({ icon: "error", title: "Xatolik", text: errorMessage(e), width: "395px" });
  }
};

const confirmCheckout = async () => {
  if (!line.value || !agreedLowQuality.value || submitting.value) return;
  // Validatsiya
  if (!form.value.receiverName || form.value.receiverName.length < 2) {
    Swal.fire({ icon: "warning", title: "Ism", text: "Qabul qiluvchi ismini kiriting", width: "395px" });
    return;
  }
  if (!/^\+998\d{9}$/.test(form.value.receiverPhone)) {
    Swal.fire({ icon: "warning", title: "Telefon", text: "Telefon: +998XXXXXXXXX", width: "395px" });
    return;
  }
  if (!form.value.regionId) {
    Swal.fire({ icon: "warning", title: "Hudud", text: "Hududni tanlang", width: "395px" });
    return;
  }
  if (!form.value.address || form.value.address.length < 5) {
    Swal.fire({ icon: "warning", title: "Manzil", text: "Manzilni kiriting", width: "395px" });
    return;
  }

  submitting.value = true;
  try {
    await createOrder({
      paymentMethod: "cash",
      receiverName: form.value.receiverName,
      receiverPhone: form.value.receiverPhone,
      regionId: form.value.regionId,
      address: form.value.address,
      agreedLowQuality: agreedLowQuality.value,
    });
    clearEditorSessionData();
    showPayModal.value = false;
    cartView.value = null;
    router.push("/orders");
  } catch (e) {
    Swal.fire({ icon: "error", title: "Buyurtma xatosi", text: errorMessage(e), width: "395px" });
  } finally {
    submitting.value = false;
  }
};

const bookDraft = computed(() => (line.value ? { title: line.value.album.title } : null));
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
              <h3>{{ line.album.title }}</h3>
              <p class="cart-prices">
                <span v-if="line.oldPrice" class="old">{{ formatMoney(line.oldPrice) }}</span>
                <span class="new">{{ formatMoney(line.unitPrice) }}</span>
              </p>
            </div>
            <div class="cart-row-actions">
              <div class="qty">
                <p class="qty-title">Qty</p>
                <div class="qty-counter-wrapper">
                  <button type="button" @click="changeQty(line.id, -1)">
                    −
                  </button>
                  <span>{{ line.quantity }}</span>
                  <button type="button" @click="changeQty(line.id, 1)">+</button>
                </div>
              </div>
              <button
                type="button"
                class="cart-trash"
                aria-label="Remove"
                @click="removeFromCart(line.id)"
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
          <li>Template: {{ line.album.title }}</li>
          <li>Book pages: {{ line.album.pageCount }}</li>
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
            <strong>Additional cost: {{ giftCostLabel }}</strong>
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
          <h3 id="pay-title" class="cart-modal-title">Checkout</h3>

          <div class="checkout-form">
            <input v-model="form.receiverName" type="text" placeholder="Qabul qiluvchi ismi" />
            <input v-model="form.receiverPhone" type="tel" placeholder="+998901234567" />
            <select v-model="form.regionId">
              <option value="" disabled>Hududni tanlang</option>
              <option v-for="r in regions" :key="r.id" :value="r.id">
                {{ r.name }} — {{ formatMoney(r.deliveryFee) }}
              </option>
            </select>
            <textarea v-model="form.address" rows="2" placeholder="Yetkazib berish manzili"></textarea>
          </div>

          <div class="checkout-summary" v-if="summary">
            <div><span>Subtotal</span><span>{{ formatMoney(summary.subtotal) }}</span></div>
            <div v-if="summary.extraServicesTotal"><span>Extra</span><span>{{ formatMoney(summary.extraServicesTotal) }}</span></div>
            <div v-if="summary.discount"><span>Discount</span><span>−{{ formatMoney(summary.discount) }}</span></div>
            <div class="checkout-total"><span>Total</span><span>{{ formatMoney(summary.total) }}</span></div>
            <p class="checkout-pay-note">To'lov: yetkazib berishda naqd (cash)</p>
          </div>

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
            :disabled="!agreedLowQuality || submitting"
            @click="confirmCheckout"
          >
            {{ submitting ? "..." : "Buyurtma berish" }}
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

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.checkout-form input,
.checkout-form select,
.checkout-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--display-grey-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-work);
  outline: none;
}

.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 14px;
  font-family: var(--font-work);
}

.checkout-summary > div {
  display: flex;
  justify-content: space-between;
}

.checkout-summary .checkout-total {
  font-weight: 700;
  border-top: 1px solid var(--temp-border-color);
  padding-top: 6px;
}

.checkout-pay-note {
  font-size: 12px;
  color: var(--black-grey-color);
}
</style>
