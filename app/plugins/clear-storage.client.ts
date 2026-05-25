import { clearEditorSessionData } from "~/utils/albumStorage";

export default defineNuxtPlugin(() => {
  // Проверяем тип навигации. Если это reload (обновление страницы), чистим данные
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  
  if (navigation && navigation.type === "reload") {
    clearEditorSessionData();
  }
});