import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/utils/api";
import type { User } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("enjive:token"));
  const user = ref<User | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role ?? null);
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : "",
  );

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const res = await api.post("/auth/login", { email, password });
      const payload = res.data?.data ?? res.data;
      const t: string = payload.token;
      const u = payload.user;
      if (!t) throw new Error("No token in login response");
      token.value = t;
      user.value = u ?? null;
      localStorage.setItem("enjive:token", t);
      // Store session expiry — 6 hours from now
      const expiry = Date.now() + 6 * 60 * 60 * 1000;
      localStorage.setItem("enjive:expiry", String(expiry));
    } finally {
      loading.value = false;
    }
  }

  function isSessionExpired(): boolean {
    const expiry = Number(localStorage.getItem("enjive:expiry") ?? 0);
    return expiry > 0 && Date.now() > expiry;
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const res = await api.get("/auth/me");
      user.value = res.data.data;
    } catch (err: any) {
      // 404 = user was deleted or DB was wiped — token is stale, force logout
      if (err?.response?.status === 404) {
        logout();
      }
      // 401 handled by axios interceptor
      // Other errors = network issue, keep session alive
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("enjive:token");
    localStorage.removeItem("enjive:expiry");
    window.location.href = "/login";
  }

  function hasRole(...roles: string[]): boolean {
    return !!userRole.value && roles.includes(userRole.value);
  }

  function hasMinRole(minRole: string): boolean {
    const hierarchy: Record<string, number> = {
      VIEWER: 1,
      TECHNICIAN: 2,
      MANAGER: 3,
      ADMIN: 4,
      SUPER_ADMIN: 5,
    };
    return (hierarchy[userRole.value ?? ""] ?? 0) >= (hierarchy[minRole] ?? 0);
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    userRole,
    fullName,
    login,
    logout,
    fetchMe,
    hasRole,
    hasMinRole,
    isSessionExpired,
  };
});
