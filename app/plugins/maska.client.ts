import { defineNuxtPlugin } from '#app'
import Maska from 'maska'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Maska)
})