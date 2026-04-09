import axios from "axios";
import type { ApiError } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach token ──────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("enjive:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: handle 401 ──────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Don't hard-redirect on /auth/me — the router guard handles that gracefully.
      // Only hard-redirect on 401s from other endpoints (token truly expired mid-session).
      const url = error.config?.url ?? "";
      const isAuthMe = url.includes("/auth/me") || url.includes("/auth/login");
      if (!isAuthMe) {
        localStorage.removeItem("enjive:token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.error?.message ?? error.message;
  }
  return "An unexpected error occurred";
}
