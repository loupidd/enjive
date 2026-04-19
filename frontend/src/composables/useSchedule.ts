import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { Schedule, PaginationMeta } from "@/types";

export function useSchedule() {
  const items = ref<Schedule[]>([]);
  const item = ref<Schedule | null>(null);
  const meta = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/schedule", { params });
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
      const res = await api.get(`/schedule/${id}`);
      item.value = res.data.data;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Partial<Schedule>) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.post("/schedule", data);
      return res.data.data as Schedule;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function update(id: string, data: Partial<Schedule>) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.patch(`/schedule/${id}`, data);
      return res.data.data as Schedule;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function remove(id: string) {
    await api.delete(`/schedule/${id}`);
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
    remove,
  };
}
