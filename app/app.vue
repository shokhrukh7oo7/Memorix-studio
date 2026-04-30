<script setup lang="ts">
import AppLoader from "./components/ui/AppLoader.vue";
// import LoginPage from './pages/LoginPage.vue';
</script>

<template>
  <div class="app-wrapper">
    <NuxtLayout>
      <div class="container">
        <NuxtPage />
        <ClientOnly>
          <AppLoader />
        </ClientOnly>
      </div>
    </NuxtLayout>
  </div>
</template>

<style></style>
