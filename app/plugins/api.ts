import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  clearAuth,
} from "~/utils/auth";
import { API_BASE } from "~/utils/apiBase";

// Backend javob formati: { success, data, meta? } | { success:false, error }
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: unknown;
  error?: { code: string; message: string; details?: unknown };
}

export default defineNuxtPlugin((nuxtApp) => {
  const baseURL = API_BASE;

  const api: AxiosInstance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  // ===== Request: token + til =====
  api.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) req.headers.Authorization = `Bearer ${token}`;

    // i18n joriy tili
    const i18n = (nuxtApp as unknown as { $i18n?: { locale?: { value?: string } } }).$i18n;
    const lang = i18n?.locale?.value;
    if (lang) req.headers["Accept-Language"] = lang;

    return req;
  });

  // ===== Response: 401 -> refresh (navbat bilan) =====
  let isRefreshing = false;
  let queue: Array<(token: string | null) => void> = [];

  const flushQueue = (token: string | null) => {
    queue.forEach((cb) => cb(token));
    queue = [];
  };

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      const status = error.response?.status;
      const url = original?.url ?? "";

      // refresh/login endpointlarida qayta urinmaymiz
      const isAuthEndpoint =
        url.includes("/auth/refresh") ||
        url.includes("/auth/verify-otp") ||
        url.includes("/auth/send-otp");

      if (status === 401 && !original._retry && !isAuthEndpoint) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearAuth();
          if (import.meta.client) navigateTo("/auth/LoginPage");
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Boshqa so'rov refresh qilyapti — navbatga qo'shamiz
          return new Promise((resolve, reject) => {
            queue.push((token) => {
              if (!token) return reject(error);
              original.headers.Authorization = `Bearer ${token}`;
              original._retry = true;
              resolve(api(original));
            });
          });
        }

        original._retry = true;
        isRefreshing = true;
        try {
          const { data } = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken?: string }>>(
            `${baseURL}/auth/refresh`,
            { refreshToken },
          );
          const newAccess = data.data.accessToken;
          const newRefresh = data.data.refreshToken;
          if (newRefresh) setTokens(newAccess, newRefresh);
          else setAccessToken(newAccess);

          flushQueue(newAccess);
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        } catch (refreshErr) {
          flushQueue(null);
          clearAuth();
          if (import.meta.client) navigateTo("/auth/LoginPage");
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return {
    provide: { api },
  };
});
