import { ref } from "vue";
import api, { extractError } from "@/utils/api";

export interface ActivityTemplate {
  id: string;
  equipmentType: string;
  classification: string;
  interval: string;
  name: string;
  type: string;
  answerType: string;
  unit: string;
  optimum: string;
  min: string;
  max: string;
  sort: number;
  status: "Enable" | "Disable";
}

export function useActivityTemplates() {
  const items = ref<ActivityTemplate[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: {
    equipmentType?: string;
    classification?: string;
    interval?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/activity-templates", { params });
      items.value = res.data.data ?? [];
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Omit<ActivityTemplate, "id">) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.post("/activity-templates", data);
      const created = res.data.data as ActivityTemplate;
      items.value.push(created);
      return created;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function update(id: string, data: Partial<ActivityTemplate>) {
    saving.value = true;
    error.value = null;
    try {
      const res = await api.patch(`/activity-templates/${id}`, data);
      const updated = res.data.data as ActivityTemplate;
      const idx = items.value.findIndex((i) => i.id === id);
      if (idx >= 0) items.value[idx] = updated;
      return updated;
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function remove(id: string) {
    saving.value = true;
    error.value = null;
    try {
      await api.delete(`/activity-templates/${id}`);
      items.value = items.value.filter((i) => i.id !== id);
    } catch (e) {
      error.value = extractError(e);
      throw e;
    } finally {
      saving.value = false;
    }
  }

  async function toggleStatus(item: ActivityTemplate) {
    const newStatus = item.status === "Enable" ? "Disable" : "Enable";
    return update(item.id, { status: newStatus });
  }

  return {
    items,
    loading,
    saving,
    error,
    fetch,
    create,
    update,
    remove,
    toggleStatus,
  };
}
