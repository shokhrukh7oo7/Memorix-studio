<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";

// В реальном приложении замените на store (Pinia)
const isLoggedIn = ref(true);
const isMenuOpen = ref(false);

// Данные пользователя (заглушка)
const user = ref({
  name: "beck_makhkamov",
  id: "998765",
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleLogout = () => {
  isLoggedIn.value = false;
  isMenuOpen.value = false;
  navigateTo("/auth/LoginPage");
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
          <img
            src="/assets/images/logo-main.png"
            alt="memorix"
            class="logo-img"
          />
        </NuxtLink>

        <div class="header-actions">
          <!-- Корзина -->
          <button class="icon-btn">
            <img src="/assets/images/shopping.svg" alt="cart" />
          </button>

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
                      <span class="name">{{ user.name }}</span>
                      <span class="sub-text id">ID: {{ user.id }}</span>
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
