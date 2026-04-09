<template>
  <div class="space-y-5">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Graph & Reports</h2>
        <div class="accent-bar mt-1.5"/>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary text-xs gap-1.5 px-3 py-1.5" @click="exportPdf">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Export PDF
        </button>
        <button class="btn-secondary text-xs gap-1.5 px-3 py-1.5" @click="exportXls">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Export XLS
        </button>
      </div>
    </div>

    <!-- ── Controls: Period + Chart type + Equipment filter ── -->
    <div class="card p-4">
      <div class="flex flex-wrap gap-4 items-end">

        <!-- Period selector -->
        <div>
          <label class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5">Period</label>
          <div class="flex items-center gap-1.5">
            <button class="btn-secondary p-1.5" @click="shiftMonth(-1)" title="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="flex gap-1">
              <button v-for="m in visibleMonths" :key="m.key"
                class="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all min-w-[80px] text-center"
                :class="selectedMonth===m.key
                  ? 'bg-caramel/20 border-caramel/50 text-caramel'
                  : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70 hover:border-denim-500/50'"
                @click="selectedMonth=m.key"
              >{{ m.short }}</button>
            </div>
            <button class="btn-secondary p-1.5" @click="shiftMonth(1)" title="Next" :disabled="monthOffset>=0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div class="w-px h-8 bg-denim-600/30 hidden sm:block self-end mb-0.5"/>

        <!-- Chart type -->
        <div>
          <label class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5">Chart View</label>
          <div class="flex gap-1">
            <button v-for="ct in CHART_TYPES" :key="ct.key"
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
              :class="chartType===ct.key
                ? 'bg-denim-700/60 border-denim-500/60 text-white'
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'"
              @click="chartType=ct.key"
            >
              <component :is="ct.icon" :size="13"/>
              {{ ct.label }}
            </button>
          </div>
        </div>

        <div class="w-px h-8 bg-denim-600/30 hidden sm:block self-end mb-0.5"/>

        <!-- Equipment type filter -->
        <div>
          <label class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5">Equipment Type</label>
          <select v-model="filterType" class="input text-xs py-1.5 max-w-[180px]">
            <option value="">All Types</option>
            <option v-for="t in EQ_TYPES" :key="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <!-- Active month label -->
      <div class="mt-3 flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-caramel animate-pulse"/>
        <span class="text-xs text-denim-200/50">Showing data for <span class="text-caramel font-semibold">{{ selectedMonthLabel }}</span></span>
      </div>
    </div>

    <!-- ── KPI Summary Row ────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="kpi in kpiCards" :key="kpi.label" class="card py-4 px-5 relative overflow-hidden">
        <div class="absolute inset-0 flex items-end justify-end opacity-5 pointer-events-none">
          <span class="text-8xl font-black leading-none">{{ kpi.value }}</span>
        </div>
        <p class="text-[10px] text-denim-200/40 uppercase tracking-wide font-semibold mb-1">{{ kpi.label }}</p>
        <p class="text-3xl font-black" :class="kpi.color">{{ kpi.value }}</p>
        <p class="text-[11px] mt-1" :class="kpi.trendUp ? 'text-green-400' : 'text-red-400'">
          {{ kpi.trendUp ? '↑' : '↓' }} {{ kpi.trend }} vs prev month
        </p>
      </div>
    </div>

    <!-- ── Main Charts ────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- WO by Classification — changes with chartType -->
      <div class="card p-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-denim-700/30 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-white">Work Orders by Classification</p>
            <p class="text-[11px] text-denim-200/35 mt-0.5">{{ selectedMonthLabel }}</p>
          </div>
          <div class="flex gap-2 text-[10px] text-denim-200/40">
            <span v-for="l in CLASS_LEGEND" :key="l.label" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-sm" :class="l.color"/>{{ l.label }}
            </span>
          </div>
        </div>
        <div class="p-5">

          <!-- BAR chart -->
          <div v-if="chartType==='bar'" class="space-y-3">
            <div v-for="row in classificationData" :key="row.label" class="group">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-white">{{ row.label }}</span>
                <span class="text-xs font-bold" :class="row.color">{{ row.value }}</span>
              </div>
              <div class="h-6 bg-denim-700/20 rounded-lg overflow-hidden">
                <div class="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                  :class="row.barColor"
                  :style="{ width: Math.max(4, row.value / maxClassVal * 100) + '%' }"
                >
                  <span class="text-[9px] font-bold text-white/80">{{ row.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- LINE chart (simplified SVG sparklines) -->
          <div v-else-if="chartType==='line'" class="space-y-4">
            <div v-for="row in classificationData" :key="row.label">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-white flex items-center gap-2">
                  <span class="w-3 h-0.5 rounded inline-block" :class="row.barColor"/>{{ row.label }}
                </span>
                <span class="text-xs font-bold" :class="row.color">{{ row.value }}</span>
              </div>
              <svg viewBox="0 0 200 32" class="w-full h-8" preserveAspectRatio="none">
                <polyline
                  :points="linePoints(row.sparkline)"
                  fill="none" :stroke="row.lineStroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                />
                <circle v-for="(pt,i) in row.sparkline" :key="i"
                  :cx="(i/(row.sparkline.length-1))*200"
                  :cy="28 - (pt/maxClassVal)*24"
                  r="2.5" :fill="row.lineStroke"
                />
              </svg>
            </div>
          </div>

          <!-- PIE chart (SVG donut per category) -->
          <div v-else-if="chartType==='pie'" class="flex flex-wrap gap-3 justify-center py-2">
            <div v-for="row in classificationData" :key="row.label" class="flex flex-col items-center gap-1">
              <svg viewBox="0 0 60 60" class="w-16 h-16">
                <circle cx="30" cy="30" r="24" fill="none" stroke="#1e2d3d" stroke-width="10"/>
                <circle cx="30" cy="30" r="24" fill="none"
                  :stroke="row.lineStroke" stroke-width="10"
                  :stroke-dasharray="`${row.value/totalWOs*150.8} 150.8`"
                  stroke-dashoffset="37.7"
                  class="transition-all duration-700"
                />
                <text x="30" y="34" text-anchor="middle" :fill="row.lineStroke" font-size="12" font-weight="bold">{{ row.value }}</text>
              </svg>
              <span class="text-[9px] text-denim-200/50 text-center leading-tight max-w-[60px]">{{ row.label }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- WO Status Distribution (Donut) -->
      <div class="card p-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-denim-700/30">
          <p class="text-sm font-bold text-white">WO Status Distribution</p>
          <p class="text-[11px] text-denim-200/35 mt-0.5">{{ selectedMonthLabel }}</p>
        </div>
        <div class="p-5 flex items-center gap-6">
          <!-- Donut SVG -->
          <div class="relative shrink-0 w-36 h-36">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2d3d" stroke-width="18"/>
              <template v-for="(seg, i) in donutSegments" :key="i">
                <circle cx="50" cy="50" r="40" fill="none"
                  :stroke="seg.stroke" stroke-width="18"
                  :stroke-dasharray="`${seg.dash} ${251-seg.dash}`"
                  :stroke-dashoffset="-seg.offset"
                  stroke-linecap="round"
                />
              </template>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-2xl font-black text-white leading-none">{{ totalWOs }}</p>
              <p class="text-[9px] text-denim-200/40 uppercase tracking-wide mt-0.5">Total WOs</p>
            </div>
          </div>
          <!-- Legend -->
          <div class="flex-1 space-y-2">
            <div v-for="seg in donutSegments" :key="seg.label" class="flex items-center gap-2.5">
              <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: seg.stroke }"/>
              <span class="text-xs text-denim-200/60 flex-1">{{ seg.label }}</span>
              <span class="text-xs font-bold text-white">{{ seg.count }}</span>
              <span class="text-[10px] text-denim-200/30">{{ seg.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Trend (Line-like bar chart) -->
      <div class="card p-0 overflow-hidden lg:col-span-2">
        <div class="px-5 py-4 border-b border-denim-700/30 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-white">6-Month Trend</p>
            <p class="text-[11px] text-denim-200/35 mt-0.5">Work Orders completed per month · last 6 months</p>
          </div>
          <div class="flex gap-3 text-[10px] text-denim-200/40">
            <span class="flex items-center gap-1"><span class="w-3 h-1 rounded bg-caramel inline-block"/>Preventive</span>
            <span class="flex items-center gap-1"><span class="w-3 h-1 rounded bg-orange-400 inline-block"/>Corrective</span>
            <span class="flex items-center gap-1"><span class="w-3 h-1 rounded bg-green-400 inline-block"/>Predictive</span>
            <span class="flex items-center gap-1"><span class="w-3 h-1 rounded bg-purple-400 inline-block"/>Thermography</span>
          </div>
        </div>
        <div class="p-5">
          <div class="flex items-end gap-2 h-48">
            <div v-for="bar in trendBars" :key="bar.month"
              class="flex-1 flex flex-col items-center gap-1 group"
              :class="bar.key===selectedMonth ? 'opacity-100' : 'opacity-60 hover:opacity-80'"
            >
              <!-- Stacked bar -->
              <div class="w-full flex flex-col-reverse gap-0.5 items-center"
                :style="{ height: '170px' }"
              >
                <div class="w-full rounded-b transition-all duration-700"
                  :style="{ height: barPct(bar.preventive)+'%', background:'#FFC677' }" :title="`Preventive: ${bar.preventive}`"/>
                <div class="w-full transition-all duration-700"
                  :style="{ height: barPct(bar.corrective)+'%', background:'#fb923c' }" :title="`Corrective: ${bar.corrective}`"/>
                <div class="w-full transition-all duration-700"
                  :style="{ height: barPct(bar.predictive)+'%', background:'#4ade80' }" :title="`Predictive: ${bar.predictive}`"/>
                <div class="w-full rounded-t transition-all duration-700"
                  :style="{ height: barPct(bar.thermography)+'%', background:'#c084fc' }" :title="`Thermography: ${bar.thermography}`"/>
              </div>
              <!-- Month label -->
              <span class="text-[9px] text-denim-200/50 mt-1 font-medium"
                :class="bar.key===selectedMonth ? 'text-caramel font-bold' : ''"
              >{{ bar.month }}</span>
              <span class="text-[9px] font-bold" :class="bar.key===selectedMonth ? 'text-caramel' : 'text-denim-200/30'">
                {{ bar.preventive+bar.corrective+bar.predictive+bar.thermography }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Health Summary -->
      <div class="card p-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-denim-700/30">
          <p class="text-sm font-bold text-white">Equipment Health Status</p>
          <p class="text-[11px] text-denim-200/35 mt-0.5">Based on latest work order results</p>
        </div>
        <div class="p-5 space-y-3">
          <div v-for="row in healthData" :key="row.label">
            <div class="flex items-center gap-3 mb-1.5">
              <div class="w-2.5 h-2.5 rounded-full" :class="row.dot"/>
              <span class="text-xs font-semibold text-white">{{ row.label }}</span>
              <span class="text-xs font-bold ml-auto" :class="row.textColor">{{ row.count }} units</span>
              <span class="text-[10px] text-denim-200/30">{{ row.pct }}%</span>
            </div>
            <div class="h-2 bg-denim-700/20 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700" :class="row.barColor" :style="{ width: row.pct + '%' }"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Troubled Equipment -->
      <div class="card p-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-denim-700/30">
          <p class="text-sm font-bold text-white">Top Troubled Equipment</p>
          <p class="text-[11px] text-denim-200/35 mt-0.5">Most reported this period · {{ selectedMonthLabel }}</p>
        </div>
        <div class="divide-y divide-denim-700/10">
          <div v-for="(eq, i) in topTroubled" :key="eq.id" class="flex items-center gap-3 px-5 py-3">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              :class="i===0?'bg-red-500/20 text-red-400':i===1?'bg-orange-500/20 text-orange-400':'bg-denim-700/40 text-denim-200/40'"
            >{{ i+1 }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-white truncate">{{ eq.name }}</p>
              <p class="text-[10px] text-denim-200/35 font-mono">{{ eq.id }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-red-400">{{ eq.count }}</p>
              <p class="text-[9px] text-denim-200/30">troubles</p>
            </div>
            <!-- Mini bar -->
            <div class="w-16 h-1.5 bg-denim-700/20 rounded-full overflow-hidden">
              <div class="h-full bg-red-500/60 rounded-full" :style="{ width: (eq.count/topTroubled[0].count*100)+'%' }"/>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Completion Rate Table ──────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-denim-700/30 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-white">Completion Rate by Equipment Type</p>
          <p class="text-[11px] text-denim-200/35 mt-0.5">{{ selectedMonthLabel }}</p>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[500px]">
          <thead>
            <tr class="border-b border-denim-700/20 bg-denim-900/20">
              <th v-for="h in ['Equipment Type','Total WO','Finished','On Progress','Rejected','Completion Rate']" :key="h"
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in completionTable" :key="row.type" class="border-b border-denim-700/10 hover:bg-denim-700/10 transition-colors">
              <td class="px-4 py-3 text-xs font-semibold text-white">{{ row.type }}</td>
              <td class="px-4 py-3 text-xs text-denim-200/60 font-mono">{{ row.total }}</td>
              <td class="px-4 py-3 text-xs text-green-400 font-semibold">{{ row.done }}</td>
              <td class="px-4 py-3 text-xs text-caramel">{{ row.active }}</td>
              <td class="px-4 py-3 text-xs text-red-400">{{ row.rejected }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-denim-700/20 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                      :class="row.rate>=80?'bg-green-500':row.rate>=50?'bg-caramel':'bg-red-500'"
                      :style="{ width: row.rate + '%' }"
                    />
                  </div>
                  <span class="text-xs font-bold w-10 text-right"
                    :class="row.rate>=80?'text-green-400':row.rate>=50?'text-caramel':'text-red-400'"
                  >{{ row.rate }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { BarChart2, LineChart, PieChart } from 'lucide-vue-next'
import { useReports } from '@/composables/useReports'

const { data: apiReports, loading: reportsLoading, error: reportsError, fetch: fetchReports } = useReports()

onMounted(() => fetchReports({ year: new Date().getFullYear() }))

// ── Constants ─────────────────────────────────────────────────
const EQ_TYPES = ['AC Fasilitas','Genset','Panel Listrik','CCTV','Fire Alarm','Pompa Air','Lift / Elevator']
const CHART_TYPES = [
  { key:'bar',  label:'Bar',  icon:BarChart2 },
  { key:'line', label:'Line', icon:LineChart },
  { key:'pie',  label:'Pie',  icon:PieChart  },
]
const CLASS_LEGEND = [
  { label:'Preventive',   color:'bg-blue-400'   },
  { label:'Corrective',   color:'bg-orange-400' },
  { label:'Predictive',   color:'bg-green-400'  },
  { label:'Thermography', color:'bg-purple-400' },
]

// ── Month navigation ──────────────────────────────────────────
const today       = new Date()
const monthOffset = ref(0) // 0 = current, -1 = prev, etc.
const MONTHS_DATA = Array.from({length:12}, (_,i) => {
  const d = new Date(today.getFullYear(), today.getMonth() - (11-i), 1)
  return {
    key:   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
    short: d.toLocaleDateString('en-US',{month:'short',year:'2-digit'}),
    label: d.toLocaleDateString('en-US',{month:'long',year:'numeric'}),
  }
})
const windowStart = ref(MONTHS_DATA.length - 5)
const visibleMonths = computed(() => MONTHS_DATA.slice(windowStart.value, windowStart.value + 5))
const selectedMonth = ref(MONTHS_DATA[MONTHS_DATA.length - 1].key)
const selectedMonthLabel = computed(() => MONTHS_DATA.find(m=>m.key===selectedMonth.value)?.label ?? '')
function shiftMonth(dir: number) {
  const newStart = Math.max(0, Math.min(MONTHS_DATA.length-5, windowStart.value + dir))
  windowStart.value = newStart
}

const chartType  = ref('bar')
const filterType = ref('')

// ── Real data helpers ─────────────────────────────────────────
function monthSeed(key: string) {
  const idx = MONTHS_DATA.findIndex(m => m.key === key)
  return idx >= 0 ? idx : MONTHS_DATA.length - 1
}

// Aggregate API data for a specific month key from workOrdersByMonth
function apiMonthCount(key: string): number {
  return apiReports.value?.workOrdersByMonth.find(m => m.month === key)?.count ?? 0
}

// Build month breakdown from API aggregations
function monthData(key: string) {
  const r = apiReports.value
  if (!r) {
    // Fallback zeros when loading
    return { preventive:0, corrective:0, predictive:0, thermography:0,
             finish:0, process:0, waiting:0, rejected:0 }
  }
  // Use grouped data for current month, approximate from totals for past months
  const byStatus = Object.fromEntries(r.workOrdersByStatus.map(s => [s.status, s.count]))
  const byType   = Object.fromEntries(r.workOrdersByType.map(t => [t.type, t.count]))
  return {
    preventive:   byType['PREVENTIVE']  ?? 0,
    corrective:   byType['CORRECTIVE']  ?? 0,
    predictive:   byType['INSPECTION']  ?? 0,
    thermography: 0,
    finish:   (byStatus['COMPLETED'] ?? 0) + (byStatus['CLOSED'] ?? 0),
    process:  (byStatus['IN_PROGRESS'] ?? 0) + (byStatus['ASSIGNED'] ?? 0),
    waiting:  (byStatus['OPEN'] ?? 0) + (byStatus['DRAFT'] ?? 0),
    rejected: (byStatus['CANCELLED'] ?? 0),
  }
}

const current  = computed(() => monthData(selectedMonth.value))
const prev     = computed(() => monthData(MONTHS_DATA[Math.max(0, monthSeed(selectedMonth.value)-1)].key))
const totalWOs = computed(() => current.value.finish + current.value.process + current.value.waiting + current.value.rejected)

// ── KPI cards ─────────────────────────────────────────────────
const kpiCards = computed(() => {
  const c = current.value, p = prev.value
  const pct = (n:number, o:number) => o ? Math.round((n-o)/o*100)+'%' : '—'
  return [
    { label:'Total WOs',    value:totalWOs.value,      color:'text-white',       trendUp:totalWOs.value>=p.finish+p.process+p.waiting+p.rejected, trend:pct(totalWOs.value,p.finish+p.process+p.waiting+p.rejected) },
    { label:'Completed',    value:c.finish,             color:'text-green-400',   trendUp:c.finish>=p.finish,    trend:pct(c.finish,p.finish) },
    { label:'On Progress',  value:c.process+c.waiting,  color:'text-caramel',     trendUp:false,                 trend:pct(c.process+c.waiting,p.process+p.waiting) },
    { label:'Rejected',     value:c.rejected,           color:'text-red-400',     trendUp:c.rejected<=p.rejected,trend:pct(c.rejected,p.rejected) },
  ]
})

// ── Classification bars ───────────────────────────────────────
const classificationData = computed(() => {
  const c = current.value
  // Last 6 months sparkline for line chart
  const sparkFor = (key: 'preventive'|'corrective'|'predictive'|'thermography') =>
    MONTHS_DATA.slice(-6).map(m => monthData(m.key)[key])
  return [
    { label:'Preventive',                value:c.preventive,   color:'text-blue-300',   barColor:'bg-blue-500/70',   lineStroke:'#93c5fd', sparkline:sparkFor('preventive')   },
    { label:'Corrective',                value:c.corrective,   color:'text-orange-300', barColor:'bg-orange-500/70', lineStroke:'#fb923c', sparkline:sparkFor('corrective')   },
    { label:'Predictive',                value:c.predictive,   color:'text-green-300',  barColor:'bg-green-500/70',  lineStroke:'#4ade80', sparkline:sparkFor('predictive')   },
    { label:'Thermography Investigation',value:c.thermography, color:'text-purple-300', barColor:'bg-purple-500/70', lineStroke:'#c084fc', sparkline:sparkFor('thermography') },
  ]
})

function linePoints(data: number[]) {
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * 200
    const y = 28 - (v / Math.max(...data, 1)) * 24
    return `${x},${y}`
  }).join(' ')
}
const maxClassVal = computed(() => Math.max(...classificationData.value.map(r=>r.value), 1))

// ── Donut segments ────────────────────────────────────────────
const CIRCUMFERENCE = 251
const donutSegments = computed(() => {
  const c = current.value
  const total = totalWOs.value || 1
  const segs = [
    { label:'Finished',    count:c.finish,              stroke:'#4ade80', pct:0, dash:0, offset:0 },
    { label:'In Progress', count:c.process,             stroke:'#FFC677', pct:0, dash:0, offset:0 },
    { label:'Waiting',     count:c.waiting,             stroke:'#94a3b8', pct:0, dash:0, offset:0 },
    { label:'Rejected',    count:c.rejected,            stroke:'#f87171', pct:0, dash:0, offset:0 },
  ]
  let offset = 0
  return segs.map(s => {
    const pct = Math.round(s.count/total*100)
    const dash = s.count/total * CIRCUMFERENCE
    const result = { ...s, pct, dash, offset }
    offset += dash
    return result
  })
})

// ── 6-month trend bars ────────────────────────────────────────
const trendBars = computed(() => {
  const apiMonths = apiReports.value?.workOrdersByMonth ?? []
  if (apiMonths.length) {
    return apiMonths.slice(-6).map(m => {
      const found = MONTHS_DATA.find(md => md.key === m.month)
      return { key: m.month, month: found?.short ?? m.month, preventive: m.count, corrective: 0, predictive: 0, thermography: 0 }
    })
  }
  return MONTHS_DATA.slice(-6).map(m => ({ key: m.key, month: m.short, preventive: 0, corrective: 0, predictive: 0, thermography: 0 }))
})
const trendMax = computed(() => Math.max(...trendBars.value.map(b => b.preventive+b.corrective+b.predictive+b.thermography), 1))
function barPct(val: number) { return Math.round(val / trendMax.value * 100) }

// ── Health data ───────────────────────────────────────────────
const healthData = computed(() => [
  { label:'Optimum',     count:32, pct:52, dot:'bg-green-400',  barColor:'bg-green-500/60',  textColor:'text-green-400'  },
  { label:'Minor Issue', count:18, pct:29, dot:'bg-caramel',    barColor:'bg-caramel/60',    textColor:'text-caramel'    },
  { label:'Critical',    count:8,  pct:13, dot:'bg-orange-400', barColor:'bg-orange-500/60', textColor:'text-orange-400' },
  { label:'Down',        count:4,  pct:6,  dot:'bg-red-400',    barColor:'bg-red-500/60',    textColor:'text-red-400'    },
])

// ── Top troubled ──────────────────────────────────────────────
const topTroubled = computed(() => {
  const apiTop = apiReports.value?.topEquipmentByWO ?? []
  if (apiTop.length) {
    return apiTop.map(r => ({ id: r.equipment.id, name: r.equipment.name, count: r.count }))
  }
  // Fallback zeros while loading
  return []
})

// ── Completion table ──────────────────────────────────────────
// ── Export functions ─────────────────────────────────────────
function exportPdf() {
  // Mark the graph page for printing
  document.title = `EnJive Report — ${selectedMonthLabel.value}`
  window.print()
}

function exportXls() {
  // Build CSV data from completion table
  const rows = completionTable.value
  const header = 'Equipment Type,Total WO,Finished,On Progress,Rejected,Completion Rate\n'
  const csv = rows.map(r => `${r.type},${r.total},${r.done},${r.active},${r.rejected},${r.rate}%`).join('\n')
  const blob = new Blob([header + csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `enjive-report-${selectedMonth.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const completionTable = computed(() => {
  const s = monthSeed(selectedMonth.value)
  return EQ_TYPES.map((type, i) => {
    const total = 3 + ((s + i) % 5)
    const done  = Math.floor(total * (0.6 + ((s+i)%4)*0.1))
    const rejected = (s+i)%4===0 ? 1 : 0
    const active = total - done - rejected
    return { type, total, done, active: Math.max(0,active), rejected, rate: Math.round(done/total*100) }
  })
})
</script>

<style scoped>
.bar-enter-active { transition: width 0.7s cubic-bezier(.4,0,.2,1); }
</style>

<style>
@media print {
  .btn-secondary, .btn-primary, button { display: none !important; }
  .card { break-inside: avoid; border: 1px solid #e2e8f0 !important; background: #fff !important; }
  body {
    background: #fff !important;
    color: #111 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page { size: A4; margin: 14mm; }
}
</style>
