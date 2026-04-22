import { ref } from "vue";
import api, { extractError } from "@/utils/api";
import type { WorkOrder, TroubleReport } from "@/types";

export interface DashboardKpi {
  totalEquipment: number;
  operationalEquipment: number;
  equipmentAvailability: number;
  openWorkOrders: number;
  completedThisMonth: number;
  openTrouble: number;
  criticalTrouble: number;
  overdueWorkOrders: number;
}

export interface DashboardData {
  kpi: DashboardKpi;
  recentWorkOrders: WorkOrder[];
  recentTrouble: TroubleReport[];
  byType?: Record<string, number>;
  byStatus?: Record<string, number>;
  byMonth?: { month: string; count: number }[];
}

export function useDashboard() {
  const data = ref<DashboardData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/dashboard");
      data.value = res.data.data;
    } catch (e) {
      error.value = extractError(e);
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, fetch };
}
