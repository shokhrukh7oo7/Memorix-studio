<script setup lang="ts">
import { ref, computed } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { useAuth } from "~/composables/useAuth";

import logoMain from "~/assets/images/logo-main.png";
import shoppingIcon from "~/assets/images/shopping.svg";

const { user, isLoggedIn, logout } = useAuth();
const isMenuOpen = ref(false);

const userName = computed(() => user.value?.fullName || user.value?.phone || "User");
const userId = computed(() => user.value?.publicId || "");

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleLogout = async () => {
  isMenuOpen.value = false;
  await logout();
};

const goToLogin = () => {
  navigateTo("/auth/LoginPage");
};
</script>

<template>
  <header class="header-layout">
    <div class="container">
      <div class="header-inner">
        <!-- Logo -->
        <NuxtLink to="/" class="logo-link">
          <img :src="logoMain" alt="memorix" class="logo-img" />
        </NuxtLink>

        <div class="header-actions">
          <!-- Корзина -->
          <NuxtLink to="/cart" aria-label="Cart" class="icon-btn">
            <img :src="shoppingIcon" alt="cart" />
          </NuxtLink>

          <!-- Секция авторизации -->
          <div v-if="isLoggedIn" class="user-menu-wrapper">
            <button class="icon-btn" @click="toggleMenu">
              <img
                v-if="!isMenuOpen"
                src="/assets/images/user.svg"
                alt="user"
              />
              <img v-else src="/assets/images/x.svg" alt="close" />
            </button>

            <!-- Dropdown Menu -->
            <Transition name="fade">
              <div v-if="isMenuOpen" class="user-dropdown">
                <div class="menu-items">
                  <!-- User Info -->
                  <div class="menu-item profile">
                    <div class="icon">
                      <img src="/assets/images/user-circle.svg" alt="icon" />
                    </div>
                    <div class="text">
                      <span class="name">{{ userName }}</span>
                      <span class="sub-text id">ID: {{ userId }}</span>
                    </div>
                  </div>

                  <!-- My Orders -->
                  <NuxtLink to="/orders" class="menu-item">
                    <div class="icon">
                      <img src="/assets/images/order.svg" alt="icon" />
                    </div>
                    <div class="text">My orders</div>
                  </NuxtLink>

                  <!-- Language -->
                  <div class="menu-item">
                    <div class="icon">
                      <img src="/assets/images/lang.svg" alt="icon" />
                    </div>
                    <div class="text">
                      <span>Select language</span>
                      <span class="sub-text">English</span>
                    </div>
                  </div>

                  <!-- FAQ -->
                  <NuxtLink to="/faq" class="menu-item">
                    <div class="icon">
                      <img src="/assets/images/faq.svg" alt="icon" />
                    </div>
                    <div class="text">FAQ</div>
                  </NuxtLink>

                  <!-- Logout -->
                  <button class="menu-item logout" @click="handleLogout">
                    <div class="icon">
                      <img src="/assets/images/logout.svg" alt="icon" />
                    </div>
                    <div class="text">Log out</div>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Кнопка регистрации если не залогинен -->
          <BaseButton v-else variant="primary" size="sm" @click="goToLogin">
            <img src="/assets/images/login.svg" alt="icon" />
          </BaseButton>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
