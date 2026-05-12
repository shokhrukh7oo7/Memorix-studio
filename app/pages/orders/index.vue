<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseOrder from "~/components/ui/BaseOrders.vue";

import arrowLeft from "~/assets/images/arrow-left.svg";
import bestSellerImage1 from "~/assets/images/swiper/bestSeller-1.png";
import bestSellerImage2 from "~/assets/images/swiper/bestSeller-2.png";
import bestSellerImage3 from "~/assets/images/swiper/bestSeller-3.png";
import bestSellerImage4 from "~/assets/images/swiper/bestSeller-4.png";

type TabName = "Active" | "History";
const activeTab = ref<TabName>("Active");

import { useRouter } from "#app";
const router = useRouter();

const goBack = () => {
  router.back();
};

// Active orders
const activeOrders = [
  {
    image: bestSellerImage1,
    title: "Sunkissed / Daisy",
    status: "Pending" as const,
    price: "$22.75",
  },
  {
    image: bestSellerImage2,
    title: "Summer Pack",
    status: "Pending" as const,
    price: "$35.99",
  },
];

// History orders
const historyOrders = [
  {
    image: bestSellerImage3,
    title: "Sunkissed / Daisy",
    status: "Completed" as const,
    price: "$55.00",
  },
  {
    image: bestSellerImage4,
    title: "Premium Pack",
    status: "Completed" as const,
    price: "$120.00",
  },
];
</script>

<template>
  <div class="template-page-container">
    <!-- назад -->
    <div class="template-back-header">
      <BaseButton @click="goBack">
        <img :src="arrowLeft" alt="icon" />
      </BaseButton>
      <h2>My orders</h2>
    </div>

    <!-- таб -->
    <div class="tabs-nav">
      <button
        :class="['tab-btn', { active: activeTab === 'Active' }]"
        @click="activeTab = 'Active'"
      >
        Active
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'History' }]"
        @click="activeTab = 'History'"
      >
        History
      </button>
    </div>

    <!-- Контент таб -->
    <div class="tabs-content">
      <!-- ТАБ: FCTIVE -->
      <div v-if="activeTab === 'Active'" class="template-grid-fade">
        <div class="order-page-wrapper">
          <BaseOrder
            v-for="(order, index) in activeOrders"
            :key="index"
            :image="order.image"
            :title="order.title"
            :status="order.status"
            :price="order.price"
          />
        </div>
      </div>

      <!-- ТАБ: HISTORY -->
      <div v-if="activeTab === 'History'" class="template-grid-fade">
        <div class="order-page-wrapper">
          <BaseOrder
            v-for="(order, index) in historyOrders"
            :key="index"
            :image="order.image"
            :title="order.title"
            :status="order.status"
            :price="order.price"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
