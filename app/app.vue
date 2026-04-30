<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppLoader from "./components/ui/AppLoader.vue";
// import LoginPage from './pages/LoginPage.vue';
</script>

<template>
  <div class="app-wrapper">
    <AppHeader />
    <div class="container">
      <NuxtPage />
      <ClientOnly>
        <AppLoader />
      </ClientOnly>
    </div>
  </div>
</template>

<style></style>
