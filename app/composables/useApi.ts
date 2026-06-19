import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { UPLOADS_BASE } from "~/utils/apiBase";

// $api (axios instance) + javobni { success, data } dan ochib beruvchi yordamchilar.
export function useApi() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance };

  // GET -> data
  async function get<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await $api.get(url, cfg);
    return res.data.data as T;
  }
  async function post<T>(url: string, body?: unknown, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await $api.post(url, body, cfg);
    return res.data.data as T;
  }
  async function patch<T>(url: string, body?: unknown, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await $api.patch(url, body, cfg);
    return res.data.data as T;
  }
  async function put<T>(url: string, body?: unknown, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await $api.put(url, body, cfg);
    return res.data.data as T;
  }
  async function del<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
    const res = await $api.delete(url, cfg);
    return res.data.data as T;
  }

  // Nisbiy /uploads yo'lini to'liq URLga aylantirish (agar kerak bo'lsa)
  function fileUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${UPLOADS_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  // Backend xato xabarini ajratib olish
  function errorMessage(err: unknown, fallback = "Xatolik yuz berdi"): string {
    const e = err as { response?: { data?: { error?: { message?: string } } } };
    return e?.response?.data?.error?.message || fallback;
  }

  return { $api, get, post, patch, put, del, fileUrl, errorMessage };
}
