<template>
  <div class="space-y-4">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div><h2 class="text-xl font-bold text-white tracking-tight">Schedule</h2><div class="accent-bar mt-1.5"/></div>
      <div class="flex gap-2">
        <button class="btn-secondary text-xs gap-1.5 px-3" @click="openMultiWO">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Multiple WO
        </button>
        <button class="btn-primary text-xs gap-1.5 px-3" @click="openCreate(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Schedule
        </button>
      </div>
    </div>

    <!-- Calendar nav -->
    <div class="card p-0 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 border-b border-denim-700/40">
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="prevMonth">← Prev</button>
        <div class="flex items-center gap-4">
          <h3 class="text-base font-bold text-white">{{ monthLabel }}</h3>
          <!-- Legend inline -->
          <div class="hidden sm:flex items-center gap-3">
            <div v-for="l in LEGEND" :key="l.label" class="flex items-center gap-1.5 text-[10px] text-denim-200/50">
              <span class="w-2.5 h-2.5 rounded-sm" :class="l.bg"/>
              {{ l.label }}
            </div>
          </div>
        </div>
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="nextMonth">Next →</button>
      </div>

      <!-- Day labels -->
      <div class="grid grid-cols-7 border-b border-denim-700/40">
        <div v-for="d in DAYS" :key="d" class="py-2 text-center text-[11px] font-semibold text-denim-200/40 uppercase tracking-wide">{{ d }}</div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7">
        <div
          v-for="(cell, idx) in calendarCells" :key="idx"
          class="min-h-[88px] border-b border-r border-denim-700/15 p-1.5 relative cursor-pointer transition-colors"
          :class="[cell.currentMonth ? 'hover:bg-denim-700/15' : 'bg-denim-900/30 opacity-60', cell.isToday ? 'ring-1 ring-inset ring-caramel/40' : '']"
          @click="openCreate(cell.date)"
        >
          <span class="text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1"
            :class="cell.isToday ? 'bg-caramel text-denim-950' : cell.currentMonth ? 'text-slate-300' : 'text-denim-200/20'"
          >{{ cell.day }}</span>

          <!-- Schedule chips — left border bar style -->
          <div class="space-y-0.5">
            <div
              v-for="(ev, ei) in cell.events.slice(0, 3)" :key="ei"
              class="text-[9px] leading-tight px-1.5 py-0.5 rounded-r font-medium truncate cursor-pointer border-l-2 flex items-center gap-1"
              :class="chipClass(ev)"
              @click.stop="openDetail(ev)"
            >
              <span class="truncate">{{ ev.equipmentId }}</span>
              <!-- WO status dot if assigned -->
              <span v-if="ev.woStatus" class="shrink-0 w-1.5 h-1.5 rounded-full ml-auto" :class="woStatusDot(ev.woStatus)" :title="ev.woStatus"/>
            </div>
            <div v-if="cell.events.length > 3" class="text-[9px] text-denim-200/35 pl-1.5">+{{ cell.events.length - 3 }} more</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Create/Edit Modal ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16" @click.self="showModal=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[82vh] overflow-y-auto">
            <div class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10">
              <div>
                <h2 class="text-base font-bold text-white">{{ editMode ? "Edit Schedule" : "New Schedule" }}</h2>
                <p class="text-xs text-denim-200/50 mt-0.5">{{ selectedDateLabel }}</p>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showModal=false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label">Equipment Type <span class="text-red-400">*</span></label>
                <select v-model="form.equipmentType" class="input" @change="form.equipmentId=''">
                  <option value="">Select type</option>
                  <option v-for="t in equipmentTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="label">Equipment ID <span class="text-red-400">*</span></label>
                <select v-model="form.equipmentId" class="input" :disabled="!form.equipmentType">
                  <option value="">Select equipment</option>
                  <option v-for="e in filteredEquipment" :key="e.id" :value="e.id">{{ e.id }} – {{ e.name }}</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Classification <span class="text-red-400">*</span></label>
                  <select v-model="form.classification" class="input">
                    <option value="">Select</option>
                    <option>Preventive</option><option>Corrective</option>
                    <option>Predictive</option><option>Thermography Investigation</option>
                  </select>
                </div>
                <div>
                  <label class="label">Interval <span class="text-red-400">*</span></label>
                  <select v-model="form.interval" class="input">
                    <option value="">Select</option>
                    <option>Once</option><option>Daily</option><option>Weekly</option>
                    <option>Monthly</option><option>Bi-Monthly</option><option>3 Monthly</option>
                    <option>4 Monthly</option><option>6 Monthly</option><option>Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">Date <span class="text-red-400">*</span></label>
                <input v-model="form.date" type="date" class="input"/>
              </div>
              <div>
                <label class="label">Technician Coordinator <span class="text-red-400">*</span></label>
                <select v-model="form.technicianId" class="input">
                  <option value="">Select technician</option>
                  <option v-for="t in technicians" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="label">Description</label>
                <textarea v-model="form.description" class="input resize-none" rows="2" placeholder="Optional notes..."/>
              </div>
              <div class="flex items-center gap-3">
                <button class="w-10 h-5 rounded-full transition-colors relative" :class="form.repeat ? 'bg-caramel' : 'bg-denim-600'" @click="form.repeat=!form.repeat">
                  <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" :class="form.repeat ? 'left-5' : 'left-0.5'"/>
                </button>
                <label class="text-sm text-slate-300">Repeat to next schedules</label>
              </div>
              <div v-if="duplicateWarning" class="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" class="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <p class="text-xs text-yellow-300">{{ duplicateWarning }}</p>
              </div>
            </div>

            <div class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex gap-3">
              <!-- Assign to Task button -->
              <button class="btn-secondary text-xs gap-1.5 flex-1 justify-center" :disabled="!isFormValid" @click="assignToTask">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Assign to Task
              </button>
              <button class="btn-secondary text-xs" @click="showModal=false">Cancel</button>
              <button class="btn-primary text-xs" @click="submitForm" :disabled="!isFormValid">
                {{ editMode ? "Save Changes" : "Create" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Detail Modal ───────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showDetail=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div class="flex items-center justify-between px-5 py-4 border-b border-denim-700/40">
              <h3 class="text-sm font-bold text-white">Schedule Detail</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showDetail=false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-if="detailEvent" class="px-5 py-4 space-y-2.5">
              <div class="flex justify-between items-center">
                <span class="text-xs text-denim-200/50">Equipment</span>
                <span class="text-xs font-mono text-caramel font-semibold">{{ detailEvent.equipmentId }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-denim-200/50">Classification</span>
                <span class="text-[10px] px-2 py-0.5 rounded border-l-2 font-medium" :class="badgeClass(detailEvent.classification)">{{ detailEvent.classification }}</span>
              </div>
              <div class="flex justify-between items-center"><span class="text-xs text-denim-200/50">Interval</span><span class="text-xs text-white">{{ detailEvent.interval }}</span></div>
              <div class="flex justify-between items-center"><span class="text-xs text-denim-200/50">Date</span><span class="text-xs text-white">{{ detailEvent.date }}</span></div>
              <div class="flex justify-between items-center"><span class="text-xs text-denim-200/50">Technician</span><span class="text-xs text-white">{{ detailEvent.technician }}</span></div>
              <div v-if="detailEvent.woStatus" class="flex justify-between items-center">
                <span class="text-xs text-denim-200/50">WO Status</span>
                <span class="text-[10px] px-2 py-0.5 rounded font-semibold" :class="woStatusBadge(detailEvent.woStatus)">{{ detailEvent.woStatus }}</span>
              </div>
              <div v-if="detailEvent.description" class="pt-2 border-t border-denim-700/30">
                <p class="text-[10px] text-denim-200/40 mb-1">Notes</p>
                <p class="text-xs text-white">{{ detailEvent.description }}</p>
              </div>
            </div>
            <div class="flex gap-2 px-5 pb-4 pt-2">
              <!-- Assign to Task from detail -->
              <button class="btn-secondary flex-1 justify-center text-xs gap-1.5" @click="assignFromDetail(detailEvent)">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Assign WO
              </button>
              <button class="btn-secondary flex-1 justify-center text-xs" @click="editEvent(detailEvent)">Edit</button>
              <button class="btn-danger flex-1 justify-center text-xs" @click="deleteEvent(detailEvent)">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Multiple WO Modal ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showMultiWO" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12" @click.self="showMultiWO=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40">
              <div>
                <h2 class="text-base font-bold text-white">Multiple WO Creation</h2>
                <p class="text-xs text-denim-200/50 mt-0.5">Select schedules to create Work Orders in batch</p>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showMultiWO=false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Filter bar -->
            <div class="px-6 py-3 border-b border-denim-700/30 flex gap-2 flex-wrap">
              <select v-model="multiFilter.classification" class="input text-xs py-1 max-w-[140px]">
                <option value="">All Classifications</option>
                <option>Preventive</option><option>Corrective</option><option>Predictive</option><option>Thermography Investigation</option>
              </select>
              <select v-model="multiFilter.interval" class="input text-xs py-1 max-w-[120px]">
                <option value="">All Intervals</option>
                <option>Monthly</option><option>3 Monthly</option><option>6 Monthly</option><option>Once</option>
              </select>
              <input v-model="multiFilter.search" class="input text-xs py-1 flex-1 min-w-[120px]" placeholder="Search equipment..."/>
            </div>

            <!-- Schedule list (checkbox select) -->
            <div class="flex-1 overflow-y-auto divide-y divide-denim-700/15">
              <label v-for="ev in filteredMultiEvents" :key="ev.id"
                class="flex items-center gap-3 px-6 py-3 hover:bg-denim-700/10 cursor-pointer"
                :class="ev.woStatus ? 'opacity-50' : ''"
              >
                <input type="checkbox" :value="ev.id" v-model="multiSelected" :disabled="!!ev.woStatus" class="accent-caramel w-4 h-4"/>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-caramel">{{ ev.equipmentId }}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded border-l-2 font-medium" :class="badgeClass(ev.classification)">{{ ev.classification }}</span>
                    <span v-if="ev.woStatus" class="text-[9px] px-1.5 py-0.5 rounded font-semibold" :class="woStatusBadge(ev.woStatus)">{{ ev.woStatus }}</span>
                  </div>
                  <p class="text-[10px] text-denim-200/40 mt-0.5">{{ ev.date }} · {{ ev.interval }} · {{ ev.technician }}</p>
                </div>
              </label>
              <div v-if="!filteredMultiEvents.length" class="px-6 py-10 text-center text-xs text-denim-200/25">No schedules found</div>
            </div>

            <div class="px-6 py-4 border-t border-denim-700/40 flex items-center justify-between">
              <p class="text-xs text-denim-200/40">{{ multiSelected.length }} selected</p>
              <div class="flex gap-2">
                <button class="btn-secondary text-xs" @click="showMultiWO=false">Cancel</button>
                <button class="btn-primary text-xs gap-1.5" :disabled="!multiSelected.length" @click="createMultiWO">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create {{ multiSelected.length }} WO{{ multiSelected.length !== 1 ? 's' : '' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSchedule } from '@/composables/useSchedule'

const { items: schedItems, loading: schedLoading, error: schedError,
  fetch: fetchSchedules } = useSchedule()

onMounted(() => fetchSchedules())

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const LEGEND = [
  { label:'Preventive',             bg:'bg-blue-500',   border:'border-blue-500',   text:'text-blue-300',   bg2:'bg-blue-500/10'   },
  { label:'Corrective',             bg:'bg-green-500',  border:'border-green-500',  text:'text-green-300',  bg2:'bg-green-500/10'  },
  { label:'Predictive',             bg:'bg-orange-400', border:'border-orange-400', text:'text-orange-300', bg2:'bg-orange-500/10' },
  { label:'Thermography',           bg:'bg-purple-500', border:'border-purple-500', text:'text-purple-300', bg2:'bg-purple-500/10' },
]

// O(1) classification lookup
const CLASS_MAP = new Map([
  ['Preventive',              { border:'border-blue-500',   text:'text-blue-300',   bg:'bg-blue-500/10'   }],
  ['Corrective',              { border:'border-green-500',  text:'text-green-300',  bg:'bg-green-500/10'  }],
  ['Predictive',              { border:'border-orange-400', text:'text-orange-300', bg:'bg-orange-500/10' }],
  ['Thermography Investigation',{ border:'border-purple-500', text:'text-purple-300', bg:'bg-purple-500/10' }],
])

// O(1) WO status color lookup
const WO_STATUS_MAP = new Map([
  ['Waiting',           { dot:'bg-slate-400',  badge:'bg-slate-500/20 text-slate-300',  chip:'bg-slate-500/15' }],
  ['Process',           { dot:'bg-caramel',    badge:'bg-caramel/20 text-caramel',       chip:'bg-caramel/12'   }],
  ['Reporting',         { dot:'bg-yellow-400', badge:'bg-yellow-400/20 text-yellow-300', chip:'bg-yellow-400/10'}],
  ['Review',            { dot:'bg-blue-400',   badge:'bg-blue-500/20 text-blue-400',     chip:'bg-blue-500/10'  }],
  ['Client Spv Review', { dot:'bg-purple-400', badge:'bg-purple-500/20 text-purple-400', chip:'bg-purple-500/10'}],
  ['Chief Eng Review',  { dot:'bg-cyan-400',   badge:'bg-cyan-500/20 text-cyan-400',     chip:'bg-cyan-500/10'  }],
  ['Finish',            { dot:'bg-green-400',  badge:'bg-green-500/20 text-green-400',   chip:'bg-green-500/10' }],
  ['Reject',            { dot:'bg-red-400',    badge:'bg-red-500/20 text-red-400',        chip:'bg-red-500/10'   }],
])

function chipClass(ev: any) {
  const cls = CLASS_MAP.get(ev.classification)
  const wo  = ev.woStatus ? WO_STATUS_MAP.get(ev.woStatus) : null
  const bg  = wo ? wo.chip : (cls?.bg ?? 'bg-denim-600/20')
  return `${bg} ${cls?.border ?? ''} ${cls?.text ?? 'text-denim-200'}`
}
function badgeClass(c: string) {
  const cls = CLASS_MAP.get(c)
  return cls ? `${cls.bg} ${cls.border} ${cls.text}` : 'bg-denim-600/20 border-denim-500 text-denim-200'
}
function woStatusDot(s: string) { return WO_STATUS_MAP.get(s)?.dot ?? 'bg-denim-400' }
function woStatusBadge(s: string) { return WO_STATUS_MAP.get(s)?.badge ?? 'bg-denim-600/40 text-denim-200' }

// ── Calendar state ────────────────────────────────────────────
const today        = new Date()
const currentYear  = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const monthLabel   = computed(() => new Date(currentYear.value, currentMonth.value).toLocaleDateString('en-US',{month:'long',year:'numeric'}))

function prevMonth() { if(currentMonth.value===0){currentMonth.value=11;currentYear.value--}else currentMonth.value-- }
function nextMonth() { if(currentMonth.value===11){currentMonth.value=0;currentYear.value++}else currentMonth.value++ }

function fmtDate(y:number, m:number, d:number) {
  const dt = new Date(y,m,d)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

// ── Events from API — mapped to calendar shape ────────────────
const freqLabel: Record<string,string> = {
  ONCE: "Once", DAILY: "Daily", WEEKLY: "Weekly",
  BIWEEKLY: "Bi-Weekly", MONTHLY: "Monthly",
  QUARTERLY: "3 Monthly", ANNUALLY: "6 Monthly",
}
const actTypeToClass: Record<string,string> = {
  MAINTENANCE: "Preventive", INSPECTION: "Predictive",
  CALIBRATION: "Predictive", CLEANING: "Preventive",
  REPAIR: "Corrective", REPLACEMENT: "Corrective",
  LUBRICATION: "Preventive", TESTING: "Predictive",
}
const events = computed(() =>
  schedItems.value.map(s => ({
    id:            s.id,
    equipmentId:   s.equipmentId,
    equipmentType: (s as any).equipment?.name ?? "—",
    classification:actTypeToClass[(s as any).activityType ?? ""] ?? "Preventive",
    interval:      freqLabel[s.frequency] ?? s.frequency,
    date:          s.nextRunAt?.slice(0,10) ?? s.startDate?.slice(0,10) ?? "",
    technician:    "Unassigned",
    description:   s.description ?? "",
    repeat:        s.frequency !== "ONCE",
    woStatus:      null,
    isActive:      s.isActive,
  }))
)

// ── Calendar cells ────────────────────────────────────────────
const calendarCells = computed(() => {
  const year = currentYear.value, month = currentMonth.value
  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()
  const todayStr    = fmtDate(today.getFullYear(), today.getMonth(), today.getDate())
  const cells: any[] = []
  for(let i=first-1; i>=0; i--) {
    const d = daysInPrev - i
    cells.push({ day:d, currentMonth:false, isToday:false, date:fmtDate(year,month-1,d), events:[] })
  }
  for(let d=1; d<=daysInMonth; d++) {
    const dateStr = fmtDate(year,month,d)
    cells.push({ day:d, currentMonth:true, isToday:dateStr===todayStr, date:dateStr,
      events: events.value.filter(e => e.date===dateStr) })
  }
  const remaining = 42 - cells.length
  for(let d=1; d<=remaining; d++)
    cells.push({ day:d, currentMonth:false, isToday:false, date:fmtDate(year,month+1,d), events:[] })
  return cells
})

// ── Modal state ───────────────────────────────────────────────
const showModal  = ref(false)
const showDetail = ref(false)
const showMultiWO = ref(false)
const editMode   = ref(false)
const editingId  = ref<number|null>(null)
const detailEvent = ref<any>(null)
const selectedDateLabel = ref('')
const form = ref({ equipmentType:'', equipmentId:'', classification:'', interval:'', date:'', technicianId:'', description:'', repeat:false })

function openCreate(date: string|null) {
  editMode.value=false; editingId.value=null
  form.value = { equipmentType:'', equipmentId:'', classification:'', interval:'', date:date??'', technicianId:'', description:'', repeat:false }
  selectedDateLabel.value = date ? new Date(date+'T00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : ''
  showModal.value = true
}
function openDetail(ev: any) { detailEvent.value=ev; showDetail.value=true }
function editEvent(ev: any) {
  showDetail.value=false; editMode.value=true; editingId.value=ev.id
  form.value = { equipmentType:ev.equipmentType, equipmentId:ev.equipmentId, classification:ev.classification, interval:ev.interval, date:ev.date, technicianId:ev.technician, description:ev.description, repeat:ev.repeat }
  selectedDateLabel.value=''
  showModal.value=true
}
function deleteEvent(ev: any) { events.value=events.value.filter(e=>e.id!==ev.id); showDetail.value=false }

// Assign to Task (creates WO → sets woStatus=Waiting)
function assignToTask() {
  if(!isFormValid.value) return
  // First save the schedule if it's new
  submitForm()
  // Then set woStatus on the newly created/updated event
  const target = events.value.find(e => e.equipmentId===form.value.equipmentId && e.date===form.value.date)
  if(target) target.woStatus = 'Waiting'
}
function assignFromDetail(ev: any) {
  if(!ev) return
  ev.woStatus = 'Waiting'
  showDetail.value = false
}

// Multiple WO
const multiFilter   = ref({ classification:'', interval:'', search:'' })
const multiSelected = ref<number[]>([])

function openMultiWO() { multiSelected.value=[]; showMultiWO.value=true }

const filteredMultiEvents = computed(() => {
  let list = events.value
  if(multiFilter.value.classification) list = list.filter(e=>e.classification===multiFilter.value.classification)
  if(multiFilter.value.interval)       list = list.filter(e=>e.interval===multiFilter.value.interval)
  if(multiFilter.value.search)         list = list.filter(e=>e.equipmentId.toLowerCase().includes(multiFilter.value.search.toLowerCase()))
  return list
})

function createMultiWO() {
  events.value.forEach(ev => {
    if(multiSelected.value.includes(ev.id)) ev.woStatus = 'Waiting'
  })
  showMultiWO.value=false
  multiSelected.value=[]
}

// Duplicate detection
const duplicateWarning = computed(() => {
  if(!form.value.equipmentId || !form.value.classification || !form.value.date) return null
  const dup = events.value.find(e =>
    e.equipmentId===form.value.equipmentId && e.classification===form.value.classification &&
    e.date===form.value.date && e.id!==editingId.value
  )
  return dup ? `Duplicate: ${form.value.equipmentId} already has ${form.value.classification} on this date.` : null
})

const isFormValid = computed(() =>
  form.value.equipmentType && form.value.equipmentId && form.value.classification &&
  form.value.interval && form.value.date && form.value.technicianId && !duplicateWarning.value
)

function submitForm() {
  if(!isFormValid.value) return
  if(editMode.value && editingId.value) {
    const idx = events.value.findIndex(e=>e.id===editingId.value)
    if(idx>=0) events.value[idx]={ ...events.value[idx], ...form.value, technician:form.value.technicianId }
  } else {
    events.value.push({ id:Date.now(), equipmentId:form.value.equipmentId, equipmentType:form.value.equipmentType,
      classification:form.value.classification, interval:form.value.interval, date:form.value.date,
      technician:form.value.technicianId, description:form.value.description, repeat:form.value.repeat, woStatus:null })
  }
  showModal.value=false
}

// Static data
const equipmentTypes = ['AC Fasilitas','Genset','Pompa','Panel Listrik','CCTV','Fire Alarm','Lift']
const equipmentMap: Record<string,{id:string,name:string}[]> = {
  'AC Fasilitas':[{id:'EDA_AC_001',name:'AC Lobby'},{id:'EDA_AC_002',name:'AC Function Room'}],
  'Genset':[{id:'EDA_GEN_001',name:'Genset B2'},{id:'EDA_GEN_002',name:'Genset Rooftop'}],
  'Pompa':[{id:'EDA_PUMP_001',name:'Pompa Air Bersih'},{id:'EDA_PUMP_003',name:'Pompa Transfer'}],
  'Panel Listrik':[{id:'EDA_PNL_001',name:'Panel MDP B2'},{id:'EDA_PNL_002',name:'Panel Lt.3'}],
  'CCTV':[{id:'EDA_CCTV_001',name:'CCTV Lobby Utama'}],
  'Fire Alarm':[{id:'EDA_FA_001',name:'FA Panel Utama'}],
  'Lift':[{id:'EDA_LIFT_001',name:'Lift Servis B1'},{id:'EDA_LIFT_002',name:'Lift Penumpang 1'}],
}
const filteredEquipment = computed(() => equipmentMap[form.value.equipmentType] ?? [])
const technicians = [{id:'ahmad',name:'Ahmad Fauzi'},{id:'budi',name:'Budi Santoso'},{id:'citra',name:'Citra Dewi'},{id:'dodi',name:'Dodi Prasetyo'}]
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
