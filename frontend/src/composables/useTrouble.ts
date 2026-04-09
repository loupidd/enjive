import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { TroubleReport, PaginationMeta } from "@/types";

export function useTrouble() {
  const items   = ref<TroubleReport[]>([]);
  const item    = ref<TroubleReport | null>(null);
  const meta    = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const saving  = ref(false);
  const error   = ref<string | null>(null);

  async function fetch(params?: Record<string, unknown>) {
    loading.value = true; error.value = null;
    try {
      const res = await api.get("/trouble", { params });
      items.value = res.data.data ?? [];
      meta.value  = res.data.meta  ?? null;
    } catch (e) { error.value = extractError(e); }
    finally { loading.value = false; }
  }

  async function fetchOne(id: string) {
    loading.value = true; error.value = null;
    try {
      const res = await api.get(`/trouble/${id}`);
      item.value = res.data.data;
    } catch (e) { error.value = extractError(e); }
    finally { loading.value = false; }
  }

  async function create(data: Partial<TroubleReport>) {
    saving.value = true; error.value = null;
    try {
      const res = await api.post("/trouble", data);
      return res.data.data as TroubleReport;
    } catch (e) { error.value = extractError(e); throw e; }
    finally { saving.value = false; }
  }

  async function update(id: string, data: Partial<TroubleReport>) {
    saving.value = true; error.value = null;
    try {
      const res = await api.patch(`/trouble/${id}`, data);
      return res.data.data as TroubleReport;
    } catch (e) { error.value = extractError(e); throw e; }
    finally { saving.value = false; }
  }

  async function updateStatus(id: string, status: string, reason?: string) {
    saving.value = true; error.value = null;
    try {
      await api.patch(`/trouble/${id}/status`, { status, reason });
    } catch (e) { error.value = extractError(e); throw e; }
    finally { saving.value = false; }
  }

  async function remove(id: string) {
    await api.delete(`/trouble/${id}`);
  }

  return { items, item, meta, loading, saving, error,
    fetch, fetchOne, create, update, updateStatus, remove };
}
