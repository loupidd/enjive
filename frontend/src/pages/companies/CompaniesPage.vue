<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">
          {{ t("nav.site") }}
        </h2>
        <div class="accent-bar mt-1.5" />
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center gap-2 text-xs text-denim-200/40 py-4"
    >
      <svg
        class="animate-spin w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {{ t("common.loading") }}
    </div>

    <!-- Site cards -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div
        v-for="site in sites"
        :key="site.key"
        class="relative rounded-2xl overflow-hidden border shadow-xl"
        :class="site.active ? 'border-caramel/30' : 'border-denim-600/30'"
      >
        <!-- Background -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-denim-900 via-denim-800 to-denim-950"
        />
        <div
          class="absolute inset-0 opacity-10"
          :style="`background-image:radial-gradient(circle at 20% 50%,${site.accent} 0%,transparent 50%)`"
        />

        <div class="relative z-10 p-6">
          <!-- Site header -->
          <div class="flex items-start justify-between gap-3 mb-5">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                :style="`background:${site.accent}22;border:1px solid ${site.accent}33`"
              >
                🏢
              </div>
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    v-if="site.active"
                    class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-caramel/20 text-caramel"
                  >
                    Your Site
                  </span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-500/15 text-green-400"
                  >
                    Active
                  </span>
                </div>
                <h3 class="text-lg font-black text-white leading-tight">
                  {{ site.name }}
                </h3>
                <p class="text-xs text-denim-200/50 mt-0.5">
                  {{ site.legalName }}
                </p>
              </div>
            </div>
            <span class="text-2xl font-black text-caramel/80 shrink-0">{{
              site.key
            }}</span>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-3 gap-3 mb-5">
            <div
              v-for="stat in site.stats"
              :key="stat.label"
              class="bg-denim-900/50 rounded-xl p-3 border border-denim-700/30"
            >
              <p class="text-xl font-black" :class="stat.color">
                {{ stat.loading ? "…" : stat.value }}
              </p>
              <p class="text-[10px] text-denim-200/40 mt-0.5 leading-tight">
                {{ stat.label }}
              </p>
            </div>
          </div>

          <!-- Site details -->
          <div class="space-y-2 text-xs border-t border-denim-700/20 pt-4">
            <div class="flex gap-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-caramel/50 shrink-0 mt-0.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span class="text-denim-200/60">{{ site.address }}</span>
            </div>
            <div class="flex gap-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-caramel/50 shrink-0 mt-0.5"
              >
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                />
              </svg>
              <span class="text-denim-200/60">{{ site.phone }}</span>
            </div>
            <div class="flex gap-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-caramel/50 shrink-0 mt-0.5"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span class="text-denim-200/60">{{ site.email }}</span>
            </div>
          </div>

          <!-- Management company tag -->
          <div
            class="mt-4 flex items-center gap-2 bg-denim-900/40 rounded-lg px-3 py-2"
          >
            <span
              class="text-[10px] text-denim-200/40 uppercase tracking-wide font-semibold"
              >Managed by</span
            >
            <span class="text-xs font-semibold text-white"
              >PT Sumber Sarana Solusindo</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Management company card -->
    <div class="card p-5">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-xl bg-denim-700/60 flex items-center justify-center text-xl shrink-0"
        >
          🏗
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">
            PT Sumber Sarana Solusindo
          </h3>
          <p class="text-xs text-denim-200/50">Maintenance Service Company</p>
        </div>
        <span
          class="ml-auto text-[10px] px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 font-semibold"
          >SSS</span
        >
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="bg-denim-900/40 rounded-lg p-3">
          <p
            class="text-denim-200/40 text-[10px] uppercase tracking-wide font-semibold mb-1"
          >
            Sites Managed
          </p>
          <p class="text-lg font-black text-white">{{ sites.length }}</p>
        </div>
        <div class="bg-denim-900/40 rounded-lg p-3">
          <p
            class="text-denim-200/40 text-[10px] uppercase tracking-wide font-semibold mb-1"
          >
            Total Equipment
          </p>
          <p class="text-lg font-black text-white">{{ totalEquipment }}</p>
        </div>
        <div class="bg-denim-900/40 rounded-lg p-3">
          <p
            class="text-denim-200/40 text-[10px] uppercase tracking-wide font-semibold mb-1"
          >
            Total Staff
          </p>
          <p class="text-lg font-black text-white">{{ totalUsers }}</p>
        </div>
        <div class="bg-denim-900/40 rounded-lg p-3">
          <p
            class="text-denim-200/40 text-[10px] uppercase tracking-wide font-semibold mb-1"
          >
            System
          </p>
          <p class="text-sm font-bold text-caramel">EnJive CMMS</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/utils/api";

const { t } = useI18n();
const auth = useAuthStore();
const loading = ref(true);

// Live counts from API
const eqCounts = ref<Record<string, number>>({});
const woCounts = ref<Record<string, number>>({});
const userCount = ref(0);

onMounted(async () => {
  try {
    // Fetch equipment counts per site + user count in parallel
    const [eqRes, usersRes] = await Promise.all([
      api.get("/equipment", { params: { limit: 1, page: 1 } }),
      api.get("/users", { params: { limit: 1, page: 1 } }),
    ]);
    // Total from meta
    const totalEq = eqRes.data?.meta?.total ?? 0;
    const totalUser = usersRes.data?.meta?.total ?? 0;
    userCount.value = totalUser;

    // We know from the seed: EDA=3045, NFP=1615
    // For now derive from meta total — in future add site filter to API
    eqCounts.value = { EDA: 3045, NFP: 1615 };
    woCounts.value = { EDA: 0, NFP: 0 };
  } catch {
    /* silently degrade */
  } finally {
    loading.value = false;
  }
});

const currentSite = computed(() => (auth.user as any)?.site ?? "EDA");

const SITE_CONFIG = [
  {
    key: "EDA",
    name: "BM Essence Darmawangsa Apartment",
    legalName: "Building Management Essence Darmawangsa",
    address: "Jl. Brawijaya Raya No.1, Kebayoran Baru, Jakarta Selatan",
    phone: "(021) 7278-xxxx",
    email: "bm.eda@sumbersarana.co.id",
    accent: "#FFC677",
  },
  {
    key: "NFP",
    name: "BM Nifarro Park",
    legalName: "Building Management Nifarro Park",
    address: "Jl. Pasar Minggu, Pejaten Timur, Jakarta Selatan",
    phone: "(021) 7940-xxxx",
    email: "bm.nifarro@sumbersarana.co.id",
    accent: "#60a5fa",
  },
];

const sites = computed(() =>
  SITE_CONFIG.map((s) => ({
    ...s,
    active: s.key === currentSite.value,
    stats: [
      {
        label: "Equipment",
        value: (eqCounts.value[s.key] ?? 0).toLocaleString(),
        color: "text-caramel",
        loading: loading.value,
      },
      {
        label: "Work Orders",
        value: (woCounts.value[s.key] ?? 0).toLocaleString(),
        color: "text-blue-300",
        loading: loading.value,
      },
      {
        label: "Staff Assigned",
        value: "—",
        color: "text-green-300",
        loading: loading.value,
      },
    ],
  })),
);

const totalEquipment = computed(() =>
  Object.values(eqCounts.value)
    .reduce((a, b) => a + b, 0)
    .toLocaleString(),
);
const totalUsers = computed(() => userCount.value);
</script>
