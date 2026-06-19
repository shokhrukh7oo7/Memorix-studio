// Backend manzillari. Env ishlatilmaydi — dev/prod farqi build-time aniqlanadi.
// Dev (nuxt dev): localhost backend. Prod (build): domen.
export const API_BASE = import.meta.dev
  ? "http://localhost:3000/api/v1"
  : "https://memorx.uzwebline.com/api/v1";

export const UPLOADS_BASE = import.meta.dev
  ? "http://localhost:3000"
  : "https://memorx.uzwebline.com";
