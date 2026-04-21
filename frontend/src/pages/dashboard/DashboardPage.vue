<template>
  <div class="space-y-5">
    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">
          {{ t("dashboard.title") }}
        </h2>
        <div class="accent-bar mt-1.5" />
      </div>
      <div class="flex items-center gap-3">
        <div class="w-72">
          <GlobalSearch placeholder="Search equipment, WO, trouble..." />
        </div>
        <span class="text-xs text-denim-200/30 hidden sm:block">Mar 2026</span>
      </div>
    </div>

    <!-- ── KPI row ──────────────────────────────────────────── -->
    <div v-if="dashLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="i in 4"
        :key="i"
        class="card py-4 px-5 h-20 animate-pulse bg-white/5"
      />
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="(kpi, i) in kpiCards"
        :key="kpi.label"
        class="card py-4 px-5 flex items-center gap-4 overflow-hidden relative"
        :style="{ animationDelay: i * 0.06 + 's' }"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          :class="kpi.iconBg"
        >
          <component :is="kpi.icon" :size="18" :class="kpi.iconColor" />
        </div>
        <div>
          <p class="text-2xl font-bold text-white leading-none kpi-value">
            {{ kpi.value }}
          </p>
          <p class="text-[11px] text-denim-200/50 mt-1">{{ kpi.label }}</p>
        </div>
        <!-- Background number -->
        <span
          class="absolute right-3 bottom-1 text-5xl font-black opacity-[0.04] text-white select-none leading-none"
          >{{ kpi.value }}</span
        >
      </div>
    </div>

    <!-- ── Charts: Classification donuts + bar ─────────────── -->
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
      <!-- Classification donuts (3-up) -->
      <div class="xl:col-span-3 card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-white">
              {{ t("dashboard.taskClassification") }}
            </h3>
            <p class="text-[11px] text-denim-200/40 mt-0.5">
              Breakdown by maintenance type
            </p>
          </div>
          <div class="flex gap-1">
            <button
              v-for="p in ['Year', 'Last Month', 'This Month']"
              :key="p"
              class="text-[10px] px-2.5 py-1 rounded-md transition-colors"
              :class="
                donutPeriod === p
                  ? 'bg-caramel/20 text-caramel font-semibold'
                  : 'text-denim-200/40 hover:text-white'
              "
              @click="donutPeriod = p"
            >
              {{ p }}
            </button>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-6">
          <!-- Donut -->
          <div class="shrink-0">
            <DonutChart
              :data="activeDonutData"
              :size="180"
              :radius="64"
              :stroke="22"
            />
          </div>
          <!-- Legend + stats -->
          <div class="flex-1 space-y-3 w-full">
            <div
              v-for="item in activeDonutData"
              :key="item.label"
              class="flex items-center gap-3"
            >
              <div
                class="w-2.5 h-2.5 rounded-sm shrink-0"
                :style="{ background: item.color }"
              />
              <span class="text-xs text-denim-100/70 flex-1">{{
                item.label
              }}</span>
              <div class="flex items-center gap-2">
                <div class="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :style="{
                      width: activeDonutTotal
                        ? (item.value / activeDonutTotal) * 100 + '%'
                        : '0%',
                      background: item.color,
                    }"
                  />
                </div>
                <span class="text-xs font-bold text-white w-10 text-right">{{
                  item.value.toLocaleString()
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status bar chart (this month) -->
      <div class="xl:col-span-2 card">
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-white">
            {{ t("dashboard.taskStatus") }}
          </h3>
          <p class="text-[11px] text-denim-200/40 mt-0.5">
            This month · March 2026
          </p>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in statusThisMonth.filter((s) => s.value > 0 || true)"
            :key="item.label"
            class="flex items-center gap-2"
          >
            <span
              class="text-[10px] text-denim-200/40 w-24 text-right truncate shrink-0"
              >{{ item.label }}</span
            >
            <div
              class="flex-1 h-5 bg-white/4 rounded-md overflow-hidden relative"
            >
              <div
                class="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-1.5"
                :style="{
                  width: maxStatusThisMonth
                    ? Math.max(
                        (item.value / maxStatusThisMonth) * 100,
                        item.value ? 4 : 0,
                      ) + '%'
                    : '0%',
                  background: item.color,
                }"
              >
                <span
                  v-if="item.value"
                  class="text-[9px] font-bold text-white/80"
                  >{{ item.value }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Year vs Last Month bars ──────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-white">Full Year Status</h3>
            <p class="text-[11px] text-denim-200/40 mt-0.5">
              January – March 2026
            </p>
          </div>
          <span class="text-lg font-bold text-caramel">{{
            statusThisMonth
              .reduce((a: any, b: any) => a + b.value, 0)
              .toLocaleString()
          }}</span>
        </div>
        <HBarChart :data="statusThisMonth" />
      </div>
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-white">Last Month Status</h3>
            <p class="text-[11px] text-denim-200/40 mt-0.5">February 2026</p>
          </div>
          <span class="text-lg font-bold text-caramel">{{
            statusThisMonth
              .reduce((a: any, b: any) => a + b.value, 0)
              .toLocaleString()
          }}</span>
        </div>
        <HBarChart :data="statusThisMonth" />
      </div>
    </div>

    <!-- ── Bottom row: Trouble + Top Equipment + AI ─────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Active Trouble Reports -->
      <div class="card p-0 overflow-hidden border border-red-500/15">
        <div
          class="px-4 py-3 border-b border-red-500/10 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"
            />
            <h3 class="text-sm font-semibold text-white">Active Troubles</h3>
          </div>
          <RouterLink
            to="/trouble"
            class="text-[10px] text-caramel hover:underline"
            >View all</RouterLink
          >
        </div>
        <div class="divide-y divide-denim-700/20">
          <div
            v-for="t in activeTroubles"
            :key="t.id"
            class="flex items-center gap-3 px-4 py-3 hover:bg-denim-700/10 transition-colors"
          >
            <div
              class="w-1 h-10 rounded-full shrink-0"
              :class="sevCol(t.severity)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-white truncate">
                {{ t.name }}
              </p>
              <p
                class="text-[10px] text-denim-200/40 font-mono mt-0.5 truncate"
              >
                {{ t.equipment }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-[10px] px-1.5 py-0.5 rounded font-bold block"
                :class="sPill(t.status)"
                >{{ t.status }}</span
              >
              <span class="text-[10px] text-red-400/70 mt-0.5 block"
                >{{ t.days }}d open</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Top Troubled Equipment -->
      <div class="card">
        <h3 class="text-sm font-semibold text-white mb-4">
          Most Troubled Equipment
        </h3>
        <div class="space-y-3">
          <div
            v-for="(eq, i) in topTroubled"
            :key="eq.name"
            class="flex items-center gap-3"
          >
            <span
              class="text-[10px] font-bold w-4 text-right shrink-0"
              :class="
                i === 0
                  ? 'text-red-400'
                  : i === 1
                    ? 'text-orange-400'
                    : i === 2
                      ? 'text-yellow-400'
                      : 'text-denim-200/30'
              "
              >{{ i + 1 }}</span
            >
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-xs text-slate-300 truncate">{{
                  eq.name
                }}</span>
                <span class="text-xs font-bold text-caramel ml-2 shrink-0"
                  >{{ eq.count }}×</span
                >
              </div>
              <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="
                    i === 0
                      ? 'bg-red-500'
                      : i === 1
                        ? 'bg-orange-400'
                        : i === 2
                          ? 'bg-yellow-400'
                          : 'bg-caramel/50'
                  "
                  :style="{
                    width: (eq.count / topTroubled[0].count) * 100 + '%',
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Assistant -->
      <div
        class="card border border-caramel/15 relative overflow-hidden"
        style="
          background: linear-gradient(
            135deg,
            rgba(2, 49, 78, 0.85) 0%,
            rgba(8, 20, 34, 0.95) 100%
          );
        "
      >
        <svg
          class="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
          viewBox="0 0 200 280"
          preserveAspectRatio="xMidYMid slice"
        >
          <line
            x1="20"
            y1="0"
            x2="20"
            y2="280"
            stroke="#FFC677"
            stroke-width="1"
          />
          <line
            x1="60"
            y1="0"
            x2="60"
            y2="280"
            stroke="#FFC677"
            stroke-width="1"
          />
          <line
            x1="140"
            y1="0"
            x2="140"
            y2="280"
            stroke="#FFC677"
            stroke-width="1"
          />
          <line
            x1="0"
            y1="70"
            x2="200"
            y2="70"
            stroke="#FFC677"
            stroke-width="1"
          />
          <line
            x1="0"
            y1="180"
            x2="200"
            y2="180"
            stroke="#FFC677"
            stroke-width="1"
          />
          <circle cx="20" cy="70" r="2.5" fill="#FFC677" />
          <circle cx="60" cy="180" r="2.5" fill="#FFC677" />
          <circle cx="140" cy="70" r="2.5" fill="#FFC677" />
          <circle cx="140" cy="180" r="2.5" fill="#FFC677" />
        </svg>

        <div class="relative flex items-center gap-3 mb-4">
          <div class="relative shrink-0">
            <div
              class="mascot-ring-1 absolute inset-0 rounded-full border border-caramel/25"
            />
            <div
              class="mascot-ring-2 absolute -inset-1.5 rounded-full border border-caramel/10"
            />
            <div
              class="w-11 h-11 rounded-full bg-gradient-to-br from-caramel/25 to-denim-700/50 border border-caramel/35 flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  fill="none"
                  stroke="#FFC677"
                  stroke-width="1"
                  opacity="0.5"
                />
                <ellipse
                  cx="8.5"
                  cy="10"
                  rx="1.6"
                  ry="2.2"
                  fill="#FFC677"
                  class="eye-blink"
                />
                <ellipse
                  cx="15.5"
                  cy="10"
                  rx="1.6"
                  ry="2.2"
                  fill="#FFC677"
                  class="eye-blink"
                  style="animation-delay: 0.05s"
                />
                <path
                  d="M8 15.5 Q12 18.5 16 15.5"
                  stroke="#FFC677"
                  stroke-width="1.2"
                  fill="none"
                  stroke-linecap="round"
                />
                <line
                  x1="12"
                  y1="1"
                  x2="12"
                  y2="4"
                  stroke="#FFC677"
                  stroke-width="1.2"
                />
                <circle
                  cx="12"
                  cy="0.8"
                  r="1.2"
                  fill="#FFC677"
                  class="antenna-glow"
                />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-caramel">EnJive Assistant</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span
                class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
              />
              <p class="text-[10px] text-denim-200/40">Live Analysis</p>
            </div>
          </div>
          <div class="flex items-end gap-0.5 h-5">
            <div
              v-for="(h, i) in [3, 5, 7, 5, 3]"
              :key="i"
              class="w-0.5 rounded-full bg-caramel/50 wave-bar"
              :style="{ height: h * 4 + 'px', animationDelay: i * 0.15 + 's' }"
            />
          </div>
        </div>

        <div class="relative space-y-2">
          <TransitionGroup name="ai-line">
            <div
              v-for="(line, i) in visibleLines"
              :key="line"
              class="text-xs text-denim-100/65 leading-relaxed bg-white/4 rounded-lg px-3 py-2 border border-white/5 flex items-start gap-2"
            >
              <span class="text-caramel/40 mt-0.5 shrink-0">›</span>
              <span>{{ line }}</span>
            </div>
          </TransitionGroup>
          <div
            v-if="visibleLines.length < AI_LINES.length"
            class="flex items-center gap-1 px-3 py-1.5"
          >
            <div class="typing-dot w-1.5 h-1.5 rounded-full bg-caramel/40" />
            <div
              class="typing-dot w-1.5 h-1.5 rounded-full bg-caramel/40"
              style="animation-delay: 0.2s"
            />
            <div
              class="typing-dot w-1.5 h-1.5 rounded-full bg-caramel/40"
              style="animation-delay: 0.4s"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import GlobalSearch from "@/components/common/GlobalSearch.vue";
import { RouterLink } from "vue-router";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-vue-next";
import { useDashboard } from "@/composables/useDashboard";
import { useI18n } from "@/i18n";

const { t } = useI18n();

const {
  data: dashData,
  loading: dashLoading,
  fetch: fetchDashboard,
} = useDashboard();
onMounted(() => fetchDashboard());

// ── Donut chart component ─────────────────────────────────────
const DonutChart = {
  props: ["data", "size", "radius", "stroke"],
  setup(props: any) {
    const S = computed(() => props.size ?? 160);
    const R = computed(() => props.radius ?? 58);
    const SW = computed(() => props.stroke ?? 24);
    const C = computed(() => 2 * Math.PI * R.value);
    const total = computed(() =>
      props.data.reduce((a: number, d: any) => a + d.value, 0),
    );
    const slices = computed(() => {
      let off = 0;
      return props.data.map((d: any) => {
        const dash = total.value ? (d.value / total.value) * C.value : 0;
        const s = { ...d, dash, offset: off };
        off += dash;
        return s;
      });
    });
    return { S, R, SW, C, slices, total };
  },
  template: `
    <div class="relative flex-shrink-0" :style="{width:S+'px',height:S+'px'}">
      <svg :width="S" :height="S" :viewBox="'0 0 '+S+' '+S" style="transform:rotate(-90deg)">
        <circle :cx="S/2" :cy="S/2" :r="R" fill="none" stroke="rgba(255,255,255,0.05)" :stroke-width="SW"/>
        <circle v-for="(s,i) in slices" :key="i"
          :cx="S/2" :cy="S/2" :r="R" fill="none"
          :stroke="s.color" :stroke-width="SW"
          :stroke-dasharray="s.dash+' '+(C-s.dash)"
          :stroke-dashoffset="-s.offset"
          stroke-linecap="butt"
          style="transition:stroke-dasharray 0.6s ease"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-3xl font-bold text-white leading-none">{{ total.toLocaleString() }}</span>
        <span class="text-[10px] text-denim-200/40 mt-1">Total</span>
      </div>
    </div>`,
};

// ── Horizontal bar chart ──────────────────────────────────────
const HBarChart = {
  props: ["data"],
  setup(props: any) {
    const max = computed(() =>
      Math.max(...props.data.map((d: any) => d.value), 1),
    );
    return { max };
  },
  template: `
    <div class="space-y-2">
      <div v-for="item in data" :key="item.label" class="flex items-center gap-2">
        <span class="text-[10px] text-denim-200/40 w-[92px] text-right truncate shrink-0">{{ item.label }}</span>
        <div class="flex-1 h-5 bg-white/4 rounded-md overflow-hidden">
          <div class="h-full rounded-md flex items-center justify-end pr-1.5 transition-all duration-700"
            :style="{width: item.value ? Math.max((item.value/max*100),item.value?3:0)+'%':'0%', background:item.color}">
            <span v-if="item.value" class="text-[9px] font-bold text-white/80">{{ item.value.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>`,
};

// ── KPI cards — live from API ─────────────────────────────────
const kpiCards = computed(() => {
  const k = dashData.value?.kpi;
  return [
    {
      label: t("dashboard.openWorkOrders"),
      value: k ? String(k.openWorkOrders) : "—",
      icon: ClipboardList,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
    {
      label: t("dashboard.activeTrouble"),
      value: k ? String(k.openTrouble) : "—",
      icon: AlertTriangle,
      iconBg: "bg-red-500/15",
      iconColor: "text-red-400",
    },
    {
      label: t("dashboard.completedMonth"),
      value: k ? String(k.completedThisMonth) : "—",
      icon: CheckCircle2,
      iconBg: "bg-green-500/15",
      iconColor: "text-green-400",
    },
    {
      label: t("dashboard.availability"),
      value: k ? k.equipmentAvailability + "%" : "—",
      icon: Clock,
      iconBg: "bg-caramel/15",
      iconColor: "text-caramel",
    },
  ];
});

// ── Chart data ────────────────────────────────────────────────
const COLORS = {
  preventive: "#3b82f6",
  certification: "#a855f7",
  corrective: "#22c55e",
  predictive: "#f97316",
};
// Chart data from API — zeros until dashData loads
const mkClass = (prev: number, cert: number, corr: number, pred: number) => [
  { label: "Preventive", value: prev, color: COLORS.preventive },
  { label: "Certification", value: cert, color: COLORS.certification },
  { label: "Corrective", value: corr, color: COLORS.corrective },
  { label: "Predictive", value: pred, color: COLORS.predictive },
];
const classYear = computed(() => {
  const d = (dashData.value as any)?.byType;
  return mkClass(d?.PREVENTIVE ?? 0, 0, d?.CORRECTIVE ?? 0, d?.INSPECTION ?? 0);
});
const classLastMonth = computed(() => mkClass(0, 0, 0, 0));
const classThisMonth = computed(() => {
  const d = (dashData.value as any)?.byType;
  return mkClass(d?.PREVENTIVE ?? 0, 0, d?.CORRECTIVE ?? 0, 0);
});

const SC: Record<string, string> = {
  Waiting: "#6b7280",
  Reject: "#ef4444",
  Process: "#FFC677",
  Reporting: "#f59e0b",
  Review: "#3b82f6",
  "Client Spv Review": "#8b5cf6",
  "Chief Eng Review": "#06b6d4",
  Finish: "#22c55e",
};
const SL = [
  "Waiting",
  "Reject",
  "Process",
  "Reporting",
  "Review",
  "Client Spv Review",
  "Chief Eng Review",
  "Finish",
];

// Status bars from API
const statusThisMonth = computed(() => {
  const byStatus = (dashData.value as any)?.byStatus ?? {};
  return SL.map((l) => {
    const key =
      l === "Waiting"
        ? "OPEN"
        : l === "Finish"
          ? "COMPLETED"
          : l === "Reject"
            ? "CANCELLED"
            : "IN_PROGRESS";
    return { label: l, value: byStatus[key] ?? 0, color: SC[l] };
  });
});
const maxStatusThisMonth = computed(() =>
  Math.max(...statusThisMonth.value.map((s: any) => s.value), 1),
);

// ── Donut period toggle ───────────────────────────────────────
const donutPeriod = ref("This Month");
const activeDonutData = computed(() => {
  if (donutPeriod.value === "Year") return classYear.value;
  if (donutPeriod.value === "Last Month") return classLastMonth.value;
  return classThisMonth.value;
});
const activeDonutTotal = computed(() =>
  activeDonutData.value.reduce((a, d) => a + d.value, 0),
);

// ── Bottom panels ─────────────────────────────────────────────
const activeTroubles = computed(() =>
  (dashData.value?.recentTrouble ?? []).map((t) => ({
    id: t.id,
    name: t.title,
    equipment: (t as any).equipment?.name ?? "—",
    severity: t.severity,
    status: t.status,
    days: Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 86400000),
  })),
);
const topTroubled = computed(() =>
  (dashData.value?.recentTrouble ?? []).map((t) => ({
    name: (t as any).equipment?.name ?? t.title,
    count: 1,
  })),
);

const sevCol = (s: string) =>
  ({
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-400",
    MEDIUM: "bg-yellow-400",
    LOW: "bg-green-400",
  })[s] ?? "bg-slate-400";
const sPill = (s: string) =>
  s === "ALERT"
    ? "bg-red-500/20 text-red-400"
    : s === "OPEN"
      ? "bg-yellow-400/20 text-yellow-300"
      : "bg-green-500/20 text-green-400";

// ── AI Assistant typewriter ───────────────────────────────────
const AI_LINES = computed(() => {
  const k = dashData.value?.kpi;
  if (!k) return ["Connecting to live data...", "EnJive Assistant ready."];
  return [
    k.openWorkOrders > 0
      ? `${k.openWorkOrders} open work orders — review assignments.`
      : "No open work orders. Good standing.",
    k.openTrouble > 0
      ? `${k.openTrouble} active trouble reports require attention.`
      : "No active trouble reports.",
    k.completedThisMonth > 0
      ? `${k.completedThisMonth} maintenance tasks completed this month.`
      : "No completions recorded this month yet.",
    `Equipment availability: ${k.equipmentAvailability ?? 100}%`,
  ];
});
const visibleLines = ref<string[]>([]);
let lineIdx = 0;
function revealNextLine() {
  const lines = AI_LINES.value;
  if (lineIdx < lines.length) {
    visibleLines.value.push(lines[lineIdx++]);
    setTimeout(revealNextLine, 750);
  }
}
watch(
  () => dashData.value,
  (d) => {
    if (d) {
      visibleLines.value = [];
      lineIdx = 0;
      setTimeout(revealNextLine, 400);
    }
  },
  { once: true },
);
setTimeout(revealNextLine, 600);
</script>

<style scoped>
/* ── Eye blink ────────────────────────────────── */
.eye-blink {
  animation: blink 4.5s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
@keyframes blink {
  0%,
  88%,
  100% {
    ry: 2.2;
  }
  93% {
    ry: 0.15;
  }
}

/* ── Antenna glow ─────────────────────────────── */
.antenna-glow {
  animation: ant-glow 1.8s ease-in-out infinite alternate;
}
@keyframes ant-glow {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
    filter: drop-shadow(0 0 4px #ffc677);
  }
}

/* ── Mascot pulse rings ───────────────────────── */
.mascot-ring-1 {
  animation: ring-out 2.8s ease-in-out infinite;
}
.mascot-ring-2 {
  animation: ring-out 2.8s ease-in-out infinite 1s;
}
@keyframes ring-out {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* ── Voice wave bars ──────────────────────────── */
.wave-bar {
  animation: wave 1.4s ease-in-out infinite alternate;
}
@keyframes wave {
  from {
    transform: scaleY(0.4);
    opacity: 0.4;
  }
  to {
    transform: scaleY(1.3);
    opacity: 1;
  }
}

/* ── Typing dots ──────────────────────────────── */
.typing-dot {
  animation: typing 1.2s ease-in-out infinite;
}
@keyframes typing {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-3px);
  }
}

/* ── AI line reveal ───────────────────────────── */
.ai-line-enter-active {
  transition: all 0.3s ease;
}
.ai-line-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
