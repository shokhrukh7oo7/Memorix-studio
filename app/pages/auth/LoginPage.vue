<script setup lang="ts">
import BaseInput from '~/components/ui/BaseInput.vue';
import BaseButton from '~/components/ui/BaseButton.vue';
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue' // Явно добавили computed для стабильности типов

const { locales, locale, setLocale } = useI18n()

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

const onLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setLocale(target.value as 'ru' | 'en')
}
</script>

<template>
  <div class="language-switcher-container">
    <select :value="locale" @change="onLanguageChange" class="lang-select">
      <option 
        v-for="item in locales" 
        :key="typeof item === 'object' ? item.code : item" 
        :value="typeof item === 'object' ? item.code : item"
      >
        {{ typeof item === 'object' ? item.name || item.code : item }}
      </option>
    </select>
  </div>
  
  <div class="login-page-wrapper">
    <div class="logo-wrapper">
      <img src="/assets/images/logo-main.png" alt="logo" class="logo" />
    </div>

    <div class="login-form-wrapper">
      <BaseInput 
        v-model="phone" 
        :label="$t('auth.phoneLabel')" 
        placeholder="+998 (__) ___-__-__" 
        :mask="'+998 (##) ###-##-##'" 
      />
      
      <BaseButton variant="primary" size="sm" :disabled="!isPhoneValid" @click="goToOtp">
        {{ $t('auth.loginButton') }}
      </BaseButton>
      
      <p class="login-privacy">
        {{ $t('auth.privacyPolicy') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.language-switcher-container {
  display: flex;
  justify-content: end;
  padding-top: 16px;
}

.lang-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--black-color);
  cursor: pointer;
  outline: none;
}

.lang-select:focus {
  border-color: var(--primary-color, #007edd);
}

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