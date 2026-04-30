<script setup lang="ts">
import BaseInput from '~/components/ui/BaseInput.vue';
import BaseButton from '~/components/ui/BaseButton.vue';

import { ref } from 'vue'

const phone = ref('')
const isPhoneValid = computed(() => {
  return phone.value.replace(/\D/g, '').length === 12
})

definePageMeta({
    layout: "auth",
})

const goToOtp = () => {
  if (!isPhoneValid.value) return
  navigateTo('/auth/OtpPage')
}
</script>

<template>
  <div class="login-page-wrapper">
    <div class="logo-wrapper">
      <img src="/assets/images/logo-main.png" alt="logo" class="logo" />
    </div>

    <div class="login-form-wrapper">
      <BaseInput v-model="phone" label="Phone number" placeholder="+998 (__) ___-__-__" :mask="'+998 (##) ###-##-##'" />
      <BaseButton variant="primary" size="sm" :disabled="!isPhoneValid" @click="goToOtp">Log in</BaseButton>
      <p class="login-privacy">By clicking the button you are agree with our Terms of Condition and Privacy Policy</p>
    </div>
  </div>
</template>

<style scoped>
.login-page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  height: 100vh;
}

.login-page-wrapper .logo-wrapper img {
  width: 100%;
  max-width: 173px;
}

.login-page-wrapper .login-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-page-wrapper .login-form-wrapper .input {
  color: var(--black-color) !important;
}

.login-privacy {
  font-size: 16px;
  font-weight: 400;
  color: var(--black-grey-color);
  text-align: center;
}
</style>