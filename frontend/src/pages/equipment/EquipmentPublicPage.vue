<template>
  <div class="min-h-screen bg-denim-950 relative overflow-hidden">
    <div class="grain-overlay pointer-events-none" />

    <!-- Header bar -->
    <div
      class="bg-denim-900/80 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3"
    >
      <div
        class="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center overflow-hidden p-0.5"
      >
        <img
          src="@/assets/enjive-mark.png"
          alt="E"
          class="w-full h-full object-contain"
          onerror="this.style.display = 'none'"
        />
      </div>
      <div>
        <p class="text-xs font-bold text-white tracking-tight">EnJive CMMS</p>
        <p class="text-[10px] text-denim-200/40">Equipment Public Record</p>
      </div>
      <div class="ml-auto">
        <RouterLink
          to="/login"
          class="text-xs px-3 py-1.5 rounded-lg bg-caramel/15 text-caramel border border-caramel/25 hover:bg-caramel/25 transition-colors"
        >
          Login
        </RouterLink>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24 gap-3"
    >
      <svg
        class="animate-spin w-8 h-8 text-caramel/50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <p class="text-sm text-denim-200/40">Loading equipment data...</p>
    </div>

    <!-- Not found -->
    <div
      v-else-if="!eq"
      class="flex flex-col items-center justify-center py-24 gap-3"
    >
      <p class="text-4xl font-black text-white/5">404</p>
      <p class="text-white font-semibold">Equipment not found</p>
      <p class="text-xs text-denim-200/40 font-mono">{{ eqCode }}</p>
    </div>

    <!-- Content -->
    <div v-else class="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <!-- Equipment identity card -->
      <div class="card p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-mono text-caramel/70 mb-1">
              {{ eq.code }}
            </p>
            <h1 class="text-xl font-bold text-white leading-tight">
              {{ eq.name }}
            </h1>
            <p class="text-sm text-denim-200/50 mt-0.5">{{ eq.category }}</p>
          </div>
          <span
            class="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
            :class="
              eq.status === 'OPERATIONAL'
                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                : 'bg-red-500/15 text-red-400 border border-red-500/25'
            "
          >
            {{ eq.status === "OPERATIONAL" ? "Operasional" : eq.status }}
          </span>
        </div>

        <!-- Specs grid -->
        <div class="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
          <div v-for="s in specRows" :key="s.label" class="space-y-0.5">
            <p class="text-[10px] text-denim-200/35 uppercase tracking-wide">
              {{ s.label }}
            </p>
            <p class="text-sm text-white/80 font-medium">
              {{ s.value || "—" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Maintenance History -->
      <div class="card p-0 overflow-hidden">
        <div
          class="px-4 py-3 border-b border-white/5 flex items-center justify-between"
        >
          <h2 class="text-sm font-semibold text-white">Riwayat Maintenance</h2>
          <span class="text-xs text-denim-200/40"
            >{{ completedWOs.length }} records</span
          >
        </div>
        <div
          v-if="wosLoading"
          class="px-4 py-6 text-center text-xs text-denim-200/40"
        >
          Loading...
        </div>
        <div
          v-else-if="!completedWOs.length"
          class="px-4 py-6 text-center text-xs text-denim-200/30"
        >
          Belum ada riwayat maintenance
        </div>
        <div v-else class="divide-y divide-white/5">
          <div
            v-for="wo in completedWOs"
            :key="wo.id"
            class="px-4 py-3 flex items-center justify-between gap-3"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-mono text-caramel/80 font-semibold">
                {{ wo.code }}
              </p>
              <p class="text-sm text-white/80 truncate mt-0.5">
                {{ wo.title }}
              </p>
              <p class="text-[10px] text-denim-200/40 mt-0.5">
                {{ wo.completedAt?.slice(0, 10) || wo.createdAt?.slice(0, 10) }}
                <span v-if="(wo as any).assignedTo" class="ml-2">
                  · {{ (wo as any).assignedTo.firstName }}
                  {{ (wo as any).assignedTo.lastName }}
                </span>
              </p>
            </div>
            <span
              class="text-[10px] px-2 py-0.5 rounded font-medium shrink-0"
              :class="
                wo.type === 'PREVENTIVE'
                  ? 'bg-blue-500/15 text-blue-300'
                  : wo.type === 'CORRECTIVE'
                    ? 'bg-orange-500/15 text-orange-300'
                    : 'bg-purple-500/15 text-purple-300'
              "
            >
              {{ wo.type }}
            </span>
          </div>
        </div>
      </div>

      <!-- Active Trouble -->
      <div v-if="activeTrouble.length" class="card p-0 overflow-hidden">
        <div
          class="px-4 py-3 border-b border-white/5 flex items-center justify-between"
        >
          <h2 class="text-sm font-semibold text-white">Trouble Aktif</h2>
          <span class="text-xs font-bold text-red-400 animate-pulse">{{
            activeTrouble.length
          }}</span>
        </div>
        <div class="divide-y divide-white/5">
          <div
            v-for="tr in activeTrouble"
            :key="tr.id"
            class="px-4 py-3 flex items-center justify-between gap-3"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-mono text-orange-400/80">{{ tr.code }}</p>
              <p class="text-sm text-white/80 truncate mt-0.5">
                {{ tr.title }}
              </p>
              <p class="text-[10px] text-denim-200/40 mt-0.5">
                {{ tr.createdAt?.slice(0, 10) }}
              </p>
            </div>
            <span
              class="text-[10px] px-2 py-0.5 rounded font-semibold shrink-0"
              :class="
                tr.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400'
                  : tr.severity === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-yellow-500/20 text-yellow-300'
              "
            >
              {{ tr.severity }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-[10px] text-denim-200/25 pb-4">
        EnJive CMMS · PT Sumber Sarana Solusindo · Data per
        {{ new Date().toLocaleDateString("id-ID") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import api from "@/utils/api";

const route = useRoute();
const eqCode = route.params.code as string;

const eq = ref<any>(null);
const wos = ref<any[]>([]);
const troubles = ref<any[]>([]);
const loading = ref(true);
const wosLoading = ref(false); // kept for template compat

const completedWOs = computed(() =>
  wos.value.filter((w) => ["COMPLETED", "CLOSED"].includes(w.status)),
);
const activeTrouble = computed(() =>
  troubles.value.filter((t) => !["CLOSED", "RESOLVED"].includes(t.status)),
);

const specRows = computed(() => {
  if (!eq.value) return [];
  return [
    { label: "Lokasi", value: eq.value.location },
    { label: "Kategori", value: eq.value.category },
    { label: "Site", value: eq.value.site },
    { label: "Serial No.", value: eq.value.serialNumber },
    { label: "Model", value: eq.value.model },
    { label: "Manufacturer", value: eq.value.manufacturer },
  ];
});

onMounted(async () => {
  try {
    // Uses the public endpoint — no login required
    const res = await api.get(`/public/equipment/${eqCode}`);
    const data = res.data.data;
    eq.value = data.equipment;
    wos.value = data.maintenance ?? [];
    troubles.value = data.trouble ?? [];
  } catch (e) {
    // Equipment not found or server error
  } finally {
    loading.value = false;
    wosLoading.value = false;
  }
});
</script>
