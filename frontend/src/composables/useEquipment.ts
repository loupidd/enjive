import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { Equipment, PaginationMeta } from "@/types";

export function useEquipment() {
  const items = ref<Equipment[]>([]);
  const meta = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/equipment", { params });
      items.value = res.data.data ?? [];
      meta.value = res.data.meta ?? null;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  // Fetch ALL equipment across pages (for equipment type grouping view)
  async function fetchAll(params?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;
    const all: Equipment[] = [];
    let page = 1;
    const limit = 500;
    try {
      while (true) {
        const res = await api.get("/equipment", {
          params: { ...params, page, limit },
        });
        const data = res.data.data ?? [];
        all.push(...data);
        const m = res.data.meta;
        if (!m || page >= m.totalPages) break;
        page++;
      }
      items.value = all;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Partial<Equipment>) {
    const res = await api.post("/equipment", data);
    return res.data.data as Equipment;
  }

  async function update(id: string, data: Partial<Equipment>) {
    const res = await api.patch(`/equipment/${id}`, data);
    return res.data.data as Equipment;
  }

  async function remove(id: string) {
    await api.delete(`/equipment/${id}`);
  }

  return {
    items,
    meta,
    loading,
    error,
    fetch,
    fetchAll,
    create,
    update,
    remove,
  };
}
