<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "#app";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import bookImageFallback from "~/assets/images/swiper/bestSeller-1.png";
import giftImage from "~/assets/images/gift.png";
import { formatMoney } from "~/utils/money";
import { orderStatusLabel } from "~/utils/orderStatus";
import { useOrders, type OrderSummary, type OrderItem } from "~/composables/useOrders";

const router = useRouter();
const route = useRoute();
const { getOrder } = useOrders();

const goBack = () => {
  router.back();
};

const order = ref<OrderSummary | null>(null);
const items = ref<OrderItem[]>([]);

const firstItem = computed(() => items.value[0] ?? null);
const coverSrc = computed(() => firstItem.value?.cover_url || bookImageFallback);
const productTitle = computed(() => firstItem.value?.title ?? "Photobook");
const statusLabel = computed(() => (order.value ? orderStatusLabel(order.value.status) : ""));
const giftItem = computed(() =>
  firstItem.value?.extra_services?.find((s) => s.id === "gift_wrap") ?? null,
);

// regionName JSONB obyekt yoki string bo'lishi mumkin
const regionLabel = computed(() => {
  const r = order.value?.regionName as unknown;
  if (!r) return "";
  if (typeof r === "string") return r;
  const obj = r as Record<string, string>;
  return obj.uz || obj.ru || obj.en || "";
});

onMounted(async () => {
  const id = route.query.id as string | undefined;
  if (!id) {
    router.replace("/orders");
    return;
  }
  try {
    const res = await getOrder(id);
    order.value = res.order;
    items.value = res.items;
  } catch (e) {
    console.error(e);
    router.replace("/orders");
  }
});
</script>

<template>
  <div class="order-info-page">
    <!-- header -->
    <div class="template-page-container">
      <div class="template-back-header">
        <BaseButton @click="goBack">
          <img :src="arrowLeft" alt="icon" />
        </BaseButton>

        <h2>Order info</h2>
      </div>
    </div>

    <!-- product -->
    <div class="order-product-card">
      <div class="order-product-image">
        <img :src="coverSrc" alt="book" />
      </div>

      <div class="order-product-content">
        <h3>{{ productTitle }}</h3>
        <p v-if="order" class="order-id-line">{{ order.orderNumber }} · {{ statusLabel }}</p>

        <div class="prices">
          <span v-if="firstItem?.old_price" class="old-price">{{ formatMoney(firstItem.old_price) }}</span>
          <span class="new-price">{{ formatMoney(firstItem?.unit_price) }}</span>
        </div>

        <p class="qty">Qty: {{ firstItem?.quantity ?? 1 }}</p>
      </div>
    </div>

    <!-- details -->
    <div class="order-details">
      <h4>More details</h4>

      <ul>
        <li>Cover type: Hardcover</li>
        <li>Size: 11.5” x 8.5” Vertical</li>
        <li>Paper finish: Gloss paper</li>
        <li>Template: {{ productTitle }}</li>
        <li v-if="firstItem">Pages: {{ firstItem.page_count }}</li>
        <li v-if="firstItem">Photos: {{ firstItem.photo_count }}</li>
        <li v-if="order">Manzil: {{ order.address }}</li>
        <li v-if="regionLabel">Hudud: {{ regionLabel }}</li>
      </ul>
    </div>

    <!-- extra -->
    <div v-if="giftItem" class="extra-services">
      <h4>Extra services</h4>

      <div class="gift-card">
        <div class="gift-content">
          <label>
            <input type="checkbox" checked disabled />
            {{ giftItem.name }}
          </label>

          <p>Select this option to surprise the recipient.</p>

          <strong>Additional cost: {{ formatMoney(giftItem.price) }}</strong>
        </div>

        <div class="gift-image">
          <img :src="giftImage" alt="gift" />
        </div>
      </div>
    </div>

    <!-- total -->
    <div v-if="order" class="cart-total">
      <h3>Jami</h3>
      <h3>{{ formatMoney(order.total) }}</h3>
    </div>
  </div>
</template>

<style scoped></style>


<!-- <script setup lang="ts">
import { useRouter } from "#app";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import bookImage from "~/assets/images/swiper/bestSeller-1.png";
import giftImage from "~/assets/images/gift.png";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="order-info-page">
    <div class="template-page-container">
      <div class="template-back-header">
        <BaseButton @click="goBack">
          <img :src="arrowLeft" alt="icon" />
        </BaseButton>

        <h2>Order info</h2>
      </div>
    </div>

    <div class="order-product-card">
      <div class="order-product-image">
        <img :src="bookImage" alt="book" />
      </div>

      <div class="order-product-content">
        <h3>Custom travel book 123154</h3>

        <div class="prices">
          <span class="old-price">$65.98</span>
          <span class="new-price">$32.98</span>
        </div>

        <p class="qty">Qty: 1</p>
      </div>
    </div>

    <div class="order-details">
      <h4>More details</h4>

      <ul>
        <li>Cover type: Hardcover</li>
        <li>Size: 11.5” x 8.5” Vertical</li>
        <li>Paper Finish: Gloss Paper</li>
        <li>Template: Always you</li>
      </ul>
    </div>

    <div class="extra-services">
      <h4>Extra services</h4>

      <div class="gift-card">
        <div class="gift-content">
          <label>
            <input type="checkbox" checked />
            Gift wrapped
          </label>

          <p>Select this option to surprise the recipient.</p>

          <strong>Additional cost: $2.99</strong>
        </div>

        <div class="gift-image">
          <img :src="giftImage" alt="gift" />
        </div>
      </div>
    </div>

    <div class="cart-total">
      <h3>Cart Total</h3>
      <h3>$35.97</h3>
    </div>
  </div>
</template>

<style scoped></style> -->
