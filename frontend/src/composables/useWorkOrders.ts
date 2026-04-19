import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { WorkOrder, PaginationMeta } from "@/types";

export function useWorkOrders() {
  const items = ref<WorkOrder[]>([]);
  const item = ref<WorkOrder | null>(null);
  const meta = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/work-orders", { params });
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
      const res = await api.get(`/work-orders/${id}`);
      item.value = res.data.data;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Partial<WorkOrder>) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.post("/work-orders", data);
      return res.data.data as WorkOrder;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function update(id: string, data: Partial<WorkOrder>) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.patch(`/work-orders/${id}`, data);
      return res.data.data as WorkOrder;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function updateStatus(id: string, status: string, reason?: string) {
    saving.value = true;
    error.value = null;
    try {
      await api.patch(`/work-orders/${id}/status`, { status, reason });
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function submitReport(
    id: string,
    data: {
      summary: string;
      workDone: string;
      hoursSpent: number;
      findings?: string;
      recommendations?: string;
      attachments?: string[];
    },
  ) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.post(`/work-orders/${id}/reports`, data);
      return res.data.data;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function remove(id: string) {
    await api.delete(`/work-orders/${id}`);
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
    updateStatus,
    submitReport,
    remove,
  };
}
