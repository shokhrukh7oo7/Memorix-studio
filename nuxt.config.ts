// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // =============================================
  // Подключение глобальных стилей
  css: [
    '~/assets/css/main.css',
    '~/assets/css/variables.css',
  ],

  devtools: { enabled: true },
  components: true,
  // =============================================
  // подключение i18n для языков
})
