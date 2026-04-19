import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { User, PaginationMeta } from "@/types";

export function useUsers() {
  const items = ref<User[]>([]);
  const item = ref<User | null>(null);
  const meta = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/users", { params });
      items.value = res.data.data ?? [];
      meta.value = res.data.meta ?? null;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/users/${id}`);
      item.value = res.data.data;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  async function create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  }) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.post("/users", data);
      return res.data.data as User;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function update(id: string, data: Partial<User>) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.patch(`/users/${id}`, data);
      return res.data.data as User;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    saving.value = true;
    error.value = null;
    try {
      await api.patch(`/users/${id}/password`, {
        currentPassword,
        newPassword,
      });
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function remove(id: string) {
    await api.delete(`/users/${id}`);
  }

  return {
    items,
    item,
    meta,
    loading,
    saving,
    error,
    fetch,
    fetchOne,
    create,
    update,
    changePassword,
    remove,
  };
}
