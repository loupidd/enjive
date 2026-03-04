import axios from "axios";
import type { ApiError } from "@/types";

const api = axios.create({
  baseURL: "/api/v1",
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
      localStorage.removeItem("enjive:token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.error?.message ?? error.message;
  }
  return "An unexpected error occurred";
}
