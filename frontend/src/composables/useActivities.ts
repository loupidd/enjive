import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { PaginationMeta } from "@/types";

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  equipmentId?: string;
  equipment?: { id: string; code: string; name: string };
  performedById: string;
  performedBy?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  performedAt: string;
  duration?: number;
  notes?: string;
  createdAt: string;
}

export function useActivities() {
  const items   = ref<ActivityLog[]>([]);
  const meta    = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const saving  = ref(false);
  const error   = ref<string | null>(null);

  async function fetch(params?: Record<string, unknown>) {
    loading.value = true; error.value = null;
    try {
      const res = await api.get("/activities", { params });
      items.value = res.data.data ?? [];
      meta.value  = res.data.meta  ?? null;
    } catch (e) { error.value = extractError(e); }
    finally { loading.value = false; }
  }

  async function create(data: {
    type: string; description: string;
    equipmentId?: string; duration?: number; notes?: string;
  }) {
    saving.value = true; error.value = null;
    try {
      const res = await api.post("/activities", data);
      return res.data.data as ActivityLog;
    } catch (e) { error.value = extractError(e); throw e; }
    finally { saving.value = false; }
  }

  return { items, meta, loading, saving, error, fetch, create };
}
