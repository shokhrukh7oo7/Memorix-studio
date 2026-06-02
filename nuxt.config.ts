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

  // =============================================
  // подключение i18n для языков
  components: true,

  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'uz', name: 'Ozbek', file: 'uz.json' }
    ],
    defaultLocale: 'ru',
    langDir: './lang'
  },

  routeRules: {
    '/auth/LoginPage': { ssr: false }
  }
})