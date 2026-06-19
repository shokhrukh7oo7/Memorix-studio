import { isLoggedIn } from "~/utils/auth";

// Global auth guard. Token localStorage'da (klient) bo'lgani uchun faqat klientda tekshiramiz.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  // Login va OTP — token kerak emas. LoginName esa token talab qiladi (yangi user oqimi).
  const publicAuthPages = ["/auth/LoginPage", "/auth/OtpPage"];
  const loggedIn = isLoggedIn();

  if (loggedIn && publicAuthPages.includes(to.path)) {
    return navigateTo("/");
  }

  if (!loggedIn && !publicAuthPages.includes(to.path)) {
    return navigateTo("/auth/LoginPage");
  }
});
