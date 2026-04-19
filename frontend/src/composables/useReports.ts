import { ref } from "vue";
import api, { extractError } from "@/utils/api";

export interface ReportsData {
  workOrdersByStatus: { status: string; count: number }[];
  workOrdersByType: { type: string; count: number }[];
  workOrdersByMonth: { month: string; count: number }[];
  troubleBySeverity: { severity: string; count: number }[];
  troubleByMonth: { month: string; count: number }[];
  avgCompletionHours: number;
  topEquipmentByWO: {
    equipment: { id: string; code: string; name: string };
    count: number;
  }[];
}

export function useReports() {
  const data = ref<ReportsData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: { year?: number; from?: string; to?: string }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/reports", { params });
      data.value = res.data.data;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, fetch };
}
