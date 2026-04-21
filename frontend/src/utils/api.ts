import axios from "axios";
import type { ApiError } from "@/types";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach token ───────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("enjive:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: handle 401 with toast ─────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isAuthEndpoint =
        url.includes("/auth/me") || url.includes("/auth/login");

      if (!isAuthEndpoint) {
        // Token expired mid-session — clear storage, show toast, then redirect
        localStorage.removeItem("enjive:token");
        localStorage.removeItem("enjive:expiry");

        // Store a message for the login page to display
        sessionStorage.setItem(
          "enjive:logout_reason",
          "Your session has expired. Please sign in again.",
        );

        // Give the toast a moment to render before hard redirect
        setTimeout(() => {
          window.location.href = "/login";
        }, 1800);

        // Fire a native event so any mounted component (AppLayout) can show a toast immediately
        window.dispatchEvent(new CustomEvent("enjive:session-expired"));
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
