<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#app";

import BaseButton from "~/components/ui/BaseButton.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import bookImageFallback from "~/assets/images/swiper/bestSeller-1.png";
import giftImage from "~/assets/images/gift.png";
import { loadPendingOrder, loadBookDraft } from "~/utils/albumStorage";

const router = useRouter();

const goBack = () => {
  router.back();
};

const coverSrc = ref<string>(bookImageFallback);
const productTitle = ref("Custom travel book");
const photoDetailLine = ref<string | null>(null);
const orderIdLine = ref<string | null>(null);

const templateLine = ref<string | null>(null);

onMounted(() => {
  const pending = loadPendingOrder();
  const draft = loadBookDraft();
  if (draft) {
    templateLine.value = `${draft.templateTitle} / ${draft.colorName}`;
  }
  if (!pending) return;
  if (pending.coverDataUrl) coverSrc.value = pending.coverDataUrl;
  if (pending.title) productTitle.value = pending.title;
  photoDetailLine.value = `Photos: ${pending.photoCount} page${pending.photoCount === 1 ? "" : "s"}`;
  orderIdLine.value = `Order ${pending.orderId}`;
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
        <p v-if="orderIdLine" class="order-id-line">{{ orderIdLine }}</p>

        <div class="prices">
          <span class="old-price">$65.98</span>
          <span class="new-price">$32.98</span>
        </div>

        <p class="qty">Qty: 1</p>
      </div>
    </div>

    <!-- details -->
    <div class="order-details">
      <h4>More details</h4>

      <ul>
        <li>Cover type: Hardcover</li>
        <li>Size: 11.5” x 8.5” Vertical</li>
        <li>Paper finish: Gloss paper</li>
        <li v-if="templateLine">Template: {{ templateLine }}</li>
        <li v-else>Template: Always you</li>
        <li>Layout: Your photo order from the book preview</li>
        <li v-if="photoDetailLine">{{ photoDetailLine }}</li>
      </ul>
    </div>

    <!-- extra -->
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

    <!-- total -->
    <div class="cart-total">
      <h3>Cart Total</h3>
      <h3>$35.97</h3>
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
