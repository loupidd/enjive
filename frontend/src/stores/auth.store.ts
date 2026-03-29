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
      // Backend wraps: { success, data: { token, user }, message }
      const payload = res.data?.data ?? res.data;
      const t: string = payload.token;
      const u = payload.user;
      if (!t) throw new Error("No token in login response");
      token.value = t;
      user.value = u ?? null;
      localStorage.setItem("enjive:token", t);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const res = await api.get("/auth/me");
      user.value = res.data.data;
    } catch {
      // Don't logout here — API might just be temporarily unavailable
      // Only logout on explicit 401 (handled by axios interceptor)
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("enjive:token");
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
  };
});
