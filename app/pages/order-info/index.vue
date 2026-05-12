<script setup lang="ts">
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

    <!-- details -->
    <div class="order-details">
      <h4>More details</h4>

      <ul>
        <li>Cover type: Hardcover</li>
        <li>Size: 11.5” x 8.5” Vertical</li>
        <li>Paper Finish: Gloss Paper</li>
        <li>Template: Always you</li>
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

<style scoped>

</style>
