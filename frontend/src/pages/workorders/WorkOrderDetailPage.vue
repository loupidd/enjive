<template>
  <div class="space-y-4">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-1.5 text-sm text-caramel hover:text-caramel/80 transition-colors" @click="router.back()">
          <IconArrowLeft :size="14" stroke-width="2.5"/>
          Back to Tasks
        </button>
        <div class="h-4 w-px bg-denim-600/50"/>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-white font-mono">{{ wo.id }}</h2>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold" :class="typeColor(wo.type)">{{ wo.type }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold" :class="statusBadge(wo.status)">{{ wo.status }}</span>
          </div>
          <p class="text-xs text-denim-200/50 mt-0.5">{{ wo.equipmentId }} · {{ wo.interval }} · Started {{ wo.startDate }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button v-if="wo.status !== 'Finish'" class="btn-secondary gap-1.5 text-xs px-3" @click="showEditWO=true">
          <IconPencil :size="13"/> Edit
        </button>
        <button v-if="wo.status === 'Finish'" class="btn-secondary gap-1.5 text-xs px-3">
          <IconPrint :size="13"/> Print Report
        </button>
      </div>
    </div>

    <!-- ── Status pipeline ─────────────────────────────────── -->
    <div class="card p-3">
      <div class="flex items-center overflow-x-auto gap-0 min-w-max">
        <template v-for="(stage, i) in PIPELINE" :key="stage.key">
          <div class="flex flex-col items-center px-3 min-w-[72px]">
            <div class="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-all"
              :class="isReached(stage.key)
                ? (wo.status===stage.key ? stage.activeBg+' ring-2 ring-offset-1 ring-offset-denim-800 '+stage.ring : stage.doneBg)
                : 'bg-denim-700/40'"
            >
              <IconCheck v-if="isDone(stage.key)" :size="12" class="text-white"/>
              <div v-else-if="wo.status===stage.key" class="w-2.5 h-2.5 rounded-full bg-current" :class="stage.dotColor"/>
              <div v-else class="w-2 h-2 rounded-full bg-denim-600"/>
            </div>
            <span class="text-[9px] text-center leading-tight whitespace-nowrap"
              :class="wo.status===stage.key ? stage.textColor : isReached(stage.key) ? 'text-denim-200/60' : 'text-denim-200/25'"
            >{{ stage.label }}</span>
            <span v-if="wo.status===stage.key" class="text-[8px] text-denim-200/40 mt-0.5">Now</span>
          </div>
          <div v-if="i < PIPELINE.length-1" class="h-px flex-1 min-w-[16px] transition-colors"
            :class="isReached(stage.key) && isReached(PIPELINE[i+1].key) ? 'bg-caramel/40' : 'bg-denim-700/40'"
          />
        </template>
      </div>
    </div>

    <!-- ── Main grid ────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Left col: WO Info + Equipment + Trouble ref -->
      <div class="space-y-4">

        <!-- WO Info card -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center gap-2">
            <IconClipboard :size="14" class="text-caramel/60"/>
            <h3 class="text-xs font-semibold text-denim-200/70 uppercase tracking-wide">Work Order Info</h3>
          </div>
          <div class="divide-y divide-denim-700/20">
            <div v-for="row in woInfoRows" :key="row.label" class="flex items-center px-4 py-2.5 gap-3">
              <span class="text-xs text-denim-200/40 w-28 shrink-0">{{ row.label }}</span>
              <span class="text-xs font-medium text-white flex-1">
                <span v-if="row.badge" class="px-1.5 py-0.5 rounded text-[10px] font-semibold" :class="row.badge">{{ row.value }}</span>
                <span v-else class="font-mono" :class="row.mono ? 'text-caramel' : ''">{{ row.value || '—' }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Equipment ref card -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <IconCpu :size="14" class="text-caramel/60"/>
              <h3 class="text-xs font-semibold text-denim-200/70 uppercase tracking-wide">Equipment</h3>
            </div>
            <RouterLink :to="\`/equipment/detail/\${wo.equipmentId}\`" class="text-[10px] text-caramel hover:underline flex items-center gap-1">
              View <IconExternalLink :size="10"/>
            </RouterLink>
          </div>
          <div class="px-4 py-3 space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-denim-200/40">ID</span><span class="font-mono text-caramel font-semibold">{{ wo.equipmentId }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/40">Name</span><span class="text-white">{{ wo.equipmentName }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/40">Type</span><span class="text-white">{{ wo.equipmentType }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/40">Section</span><span class="text-white">{{ wo.section }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/40">Location</span><span class="text-white">{{ wo.location }}</span></div>
          </div>
        </div>

        <!-- Linked trouble (if corrective) -->
        <div v-if="wo.troubleId" class="card p-0 overflow-hidden border border-orange-500/20">
          <div class="px-4 py-3 border-b border-orange-500/15 flex items-center gap-2">
            <IconAlertTriangle :size="14" class="text-orange-400"/>
            <h3 class="text-xs font-semibold text-orange-300/70 uppercase tracking-wide">Linked Trouble Report</h3>
          </div>
          <div class="px-4 py-3 space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-denim-200/40">Trouble ID</span><span class="font-mono text-orange-400 font-semibold">{{ wo.troubleId }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/40">Name</span><span class="text-white">{{ wo.troubleName }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/40">Operation</span><span class="text-white">{{ wo.troubleOperation }}</span></div>
          </div>
        </div>

      </div>

      <!-- Right col (2/3): Activities + Work Report + Timeline -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Activities checklist -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <IconActivity :size="14" class="text-caramel/60"/>
              <h3 class="text-xs font-semibold text-denim-200/70 uppercase tracking-wide">Activities Checklist</h3>
            </div>
            <span class="text-xs text-denim-200/40">{{ completedCount }}/{{ wo.activities.length }} done</span>
          </div>
          <!-- Progress bar -->
          <div class="h-0.5 bg-denim-700/30">
            <div class="h-full bg-caramel transition-all duration-500"
              :style="{width: wo.activities.length ? (completedCount/wo.activities.length*100)+'%' : '0%'}"/>
          </div>

          <div class="divide-y divide-denim-700/15">
            <div
              v-for="(act, i) in wo.activities"
              :key="act.id"
              class="px-4 py-3 flex items-start gap-3"
              :class="act.done ? 'opacity-70' : ''"
            >
              <!-- Number -->
              <span class="text-[10px] text-denim-200/30 w-4 text-right shrink-0 mt-0.5">{{ i+1 }}</span>

              <!-- Checkbox (clickable if in Process) -->
              <button
                class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                :class="act.done
                  ? 'bg-caramel border-caramel'
                  : 'border-denim-600 hover:border-caramel/60'"
                :disabled="wo.status !== 'Process' && wo.status !== 'Waiting'"
                @click="toggleActivity(act)"
              >
                <IconCheck v-if="act.done" :size="11" class="text-denim-950"/>
              </button>

              <!-- Activity details -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white">{{ act.name }}</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-[10px] px-1.5 py-0.5 rounded" :class="actTypeColor(act.type)">{{ act.type }}</span>
                  <span class="text-[10px] text-denim-200/40">{{ act.answerType }}</span>
                  <span v-if="act.unit" class="text-[10px] text-denim-200/40">· {{ act.unit }}</span>
                </div>
              </div>

              <!-- Answer input (if in Process) -->
              <div v-if="(wo.status==='Process' || wo.status==='Waiting') && !act.done" class="shrink-0">
                <input
                  v-if="act.answerType==='Quantitative'"
                  v-model="act.answer"
                  type="number"
                  class="input w-24 text-xs py-1"
                  :placeholder="(act.optimum || 'val') + ' ' + act.unit"
                />
                <select v-else-if="act.answerType==='Qualitative'" v-model="act.answer" class="input text-xs py-1 w-24">
                  <option value="">Pick</option>
                  <option>{{ act.unit || 'OK' }}</option>
                  <option>Not OK</option>
                </select>
                <input v-else v-model="act.answer" class="input text-xs py-1 w-28" placeholder="Answer..."/>
              </div>
              <!-- Answered value (done) -->
              <div v-else-if="act.done && act.answer" class="text-xs font-bold text-caramel shrink-0">
                {{ act.answer }} <span class="text-denim-200/40 font-normal">{{ act.unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Report (appears after technician fills activities) -->
        <div v-if="wo.status==='Process' || wo.workReport" class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <IconFileText :size="14" class="text-caramel/60"/>
              <h3 class="text-xs font-semibold text-denim-200/70 uppercase tracking-wide">Work Report</h3>
            </div>
            <span v-if="wo.workReport" class="text-[10px] text-green-400 flex items-center gap-1">
              <IconCheckCircle :size="11"/> Submitted
            </span>
          </div>
          <div class="px-4 py-4 space-y-3">
            <div>
              <label class="label">Equipment Condition After Work</label>
              <textarea v-model="workReportForm.condition" class="input resize-none" rows="2" :disabled="!!wo.workReport" placeholder="Describe equipment condition after maintenance..."/>
            </div>
            <div>
              <label class="label">Work Summary</label>
              <textarea v-model="workReportForm.summary" class="input resize-none" rows="2" :disabled="!!wo.workReport" placeholder="What was done?"/>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Spare Parts Used</label>
                <input v-model="workReportForm.spareParts" class="input text-xs" :disabled="!!wo.workReport" placeholder="e.g. Filter, Freon R32"/>
              </div>
              <div>
                <label class="label">Next Action</label>
                <input v-model="workReportForm.nextAction" class="input text-xs" :disabled="!!wo.workReport" placeholder="e.g. Monitor next week"/>
              </div>
            </div>

            <!-- Trouble toggle -->
            <div class="flex items-center gap-3 py-1 border-t border-denim-700/20 pt-3">
              <button
                class="w-10 h-5 rounded-full transition-colors relative"
                :class="workReportForm.hasTrouble ? 'bg-red-500' : 'bg-denim-600'"
                :disabled="!!wo.workReport"
                @click="workReportForm.hasTrouble=!workReportForm.hasTrouble"
              >
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="workReportForm.hasTrouble ? 'left-5' : 'left-0.5'"/>
              </button>
              <div>
                <p class="text-sm text-slate-300">Found Trouble During Work</p>
                <p class="text-xs text-denim-200/40">This will create a Trouble Report linked to this WO</p>
              </div>
              <span v-if="workReportForm.hasTrouble" class="ml-auto text-xs text-red-400 flex items-center gap-1">
                <IconAlertTriangle :size="12"/> Will create TR
              </span>
            </div>

            <div v-if="!wo.workReport" class="flex justify-end gap-2 pt-1">
              <button class="btn-primary gap-1.5 text-xs" :disabled="completedCount < wo.activities.length" @click="submitReport">
                <IconCheck :size="13"/> Submit Work Report
              </button>
            </div>
            <p v-if="completedCount < wo.activities.length && !wo.workReport" class="text-[10px] text-denim-200/40">
              Complete all {{ wo.activities.length }} activities before submitting.
            </p>
          </div>
        </div>

        <!-- Approval Timeline -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center gap-2">
            <IconClock :size="14" class="text-caramel/60"/>
            <h3 class="text-xs font-semibold text-denim-200/70 uppercase tracking-wide">Approval Timeline</h3>
          </div>
          <div class="px-4 py-4">
            <div class="relative pl-5">
              <div class="absolute left-1.5 top-2 bottom-2 w-px bg-denim-600/30"/>
              <div v-for="(ev, i) in wo.timeline" :key="i" class="relative mb-4 last:mb-0">
                <div class="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-denim-800" :class="ev.color"/>
                <p class="text-xs font-semibold text-white">{{ ev.label }}</p>
                <p class="text-[10px] text-denim-200/50 mt-0.5">{{ ev.date }} · {{ ev.by }}</p>
                <p v-if="ev.note" class="text-[10px] text-denim-200/35 mt-0.5 italic bg-denim-700/20 rounded px-2 py-1">{{ ev.note }}</p>
              </div>
              <div v-if="!wo.timeline.length" class="text-xs text-denim-200/30 py-2">No events yet</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { RouterLink } from "vue-router"
import {
  IconArrowLeft, IconPencil, IconPrint, IconCheck, IconCheckCircle,
  IconClipboard, IconCpu, IconActivity, IconFileText, IconClock,
  IconAlertTriangle, IconExternalLink
} from "@/components/icons"

const router = useRouter()
const route  = useRoute()
const woId   = route.params.id as string

const PIPELINE = [
  { key:"Waiting",          label:"Waiting",    activeBg:"bg-slate-500",  doneBg:"bg-slate-500/40",  ring:"ring-slate-500",  dotColor:"text-slate-400",  textColor:"text-slate-300" },
  { key:"Process",          label:"Process",    activeBg:"bg-caramel",    doneBg:"bg-caramel/40",    ring:"ring-caramel",    dotColor:"text-caramel",    textColor:"text-caramel" },
  { key:"Reporting",        label:"Reporting",  activeBg:"bg-yellow-400", doneBg:"bg-yellow-400/40", ring:"ring-yellow-400", dotColor:"text-yellow-300", textColor:"text-yellow-300" },
  { key:"Review",           label:"Review",     activeBg:"bg-blue-500",   doneBg:"bg-blue-500/40",   ring:"ring-blue-500",   dotColor:"text-blue-400",   textColor:"text-blue-400" },
  { key:"Client Spv Review",label:"Spv Review", activeBg:"bg-purple-500", doneBg:"bg-purple-500/40", ring:"ring-purple-500", dotColor:"text-purple-400", textColor:"text-purple-400" },
  { key:"Chief Eng Review", label:"Chief Eng",  activeBg:"bg-cyan-500",   doneBg:"bg-cyan-500/40",   ring:"ring-cyan-500",   dotColor:"text-cyan-400",   textColor:"text-cyan-400" },
  { key:"Finish",           label:"Finish",     activeBg:"bg-green-500",  doneBg:"bg-green-500/40",  ring:"ring-green-500",  dotColor:"text-green-400",  textColor:"text-green-400" },
]
const PIPELINE_ORDER = PIPELINE.map(p=>p.key)

// ── Mock WO data ──────────────────────────────────────────────
const wo = ref({
  id:           woId || "WO-2026-0004",
  equipmentId:  "EDA_PNL_001",
  equipmentName:"Panel MDP B2",
  equipmentType:"Panel Listrik",
  section:      "Panel Listrik",
  location:     "Basement 2",
  type:         "Thermography Investigation",
  interval:     "6 Monthly",
  startDate:    "2026-02-25",
  technician:   "Ahmad Fauzi",
  status:       "Process",
  troubleId:    null as string|null,
  troubleName:  null as string|null,
  troubleOperation: null as string|null,
  noteWO:       "Routine thermographic investigation of MDP panel",
  workReport:   null as any,
  activities: [
    { id:1, name:"Thermographic Scan",    type:"Thermographic Investigation", answerType:"Qualitative", unit:"Normal", optimum:"", done:false, answer:"" },
    { id:2, name:"Check Hot Spots",       type:"Visual",   answerType:"Qualitative", unit:"None",   optimum:"", done:false, answer:"" },
    { id:3, name:"Record Temperature",    type:"Measurement", answerType:"Quantitative", unit:"°C", optimum:"40", done:false, answer:"" },
    { id:4, name:"Check Terminal Tightness", type:"Adjustment", answerType:"Qualitative", unit:"Tight", optimum:"", done:false, answer:"" },
  ],
  timeline: [
    { label:"WO Created",    color:"bg-slate-500",  date:"2026-02-25 08:00", by:"System",      note:"Generated from schedule" },
    { label:"Approved",      color:"bg-caramel",    date:"2026-02-25 09:15", by:"Ahmad Fauzi", note:"" },
  ]
})

const showEditWO  = ref(false)
const workReportForm = ref({ condition:"", summary:"", spareParts:"", nextAction:"", hasTrouble:false })

const completedCount = computed(() => wo.value.activities.filter(a=>a.done).length)

function isReached(key: string) {
  const cur = PIPELINE_ORDER.indexOf(wo.value.status)
  const tgt = PIPELINE_ORDER.indexOf(key)
  return tgt <= cur
}
function isDone(key: string) {
  const cur = PIPELINE_ORDER.indexOf(wo.value.status)
  const tgt = PIPELINE_ORDER.indexOf(key)
  return tgt < cur
}

function toggleActivity(act: any) {
  if(act.done) { act.done=false; return }
  if(!act.answer && act.answerType !== "Qualitative") return
  act.done=true
}

function submitReport() {
  wo.value.workReport = { ...workReportForm.value, submittedAt: new Date().toLocaleString() }
  wo.value.status = "Reporting"
  wo.value.timeline.push({ label:"Work Report Submitted", color:"bg-yellow-400", date: new Date().toLocaleString(), by:"Ahmad Fauzi", note: workReportForm.value.summary })
}

const woInfoRows = computed(() => [
  { label:"WO ID",          value: wo.value.id,          mono:true, badge:null },
  { label:"Type",           value: wo.value.type,        mono:false, badge: typeColorRaw(wo.value.type) },
  { label:"Interval",       value: wo.value.interval,    mono:false, badge:null },
  { label:"Start Date",     value: wo.value.startDate,   mono:false, badge:null },
  { label:"Technician",     value: wo.value.technician,  mono:false, badge:null },
  { label:"Status",         value: wo.value.status,      mono:false, badge: statusBadge(wo.value.status) },
  { label:"Note",           value: wo.value.noteWO,      mono:false, badge:null },
])

function typeColorRaw(t: string) {
  if(t==="Preventive")   return "bg-blue-500/15 text-blue-300"
  if(t==="Corrective")   return "bg-orange-500/15 text-orange-300"
  if(t==="Predictive")   return "bg-green-500/15 text-green-300"
  if(t==="Thermography Investigation") return "bg-purple-500/15 text-purple-300"
  return "bg-denim-600/40 text-denim-200"
}
function typeColor(t: string) { return typeColorRaw(t) }

function statusBadge(s: string) {
  const map: Record<string,string> = {
    Waiting:"bg-slate-500/20 text-slate-300", Process:"bg-caramel/20 text-caramel",
    Reporting:"bg-yellow-400/20 text-yellow-300", Review:"bg-blue-500/20 text-blue-400",
    "Client Spv Review":"bg-purple-500/20 text-purple-400",
    "Chief Eng Review":"bg-cyan-500/20 text-cyan-400",
    Finish:"bg-green-500/20 text-green-400", Reject:"bg-red-500/20 text-red-400"
  }
  return map[s] ?? "bg-denim-600/40 text-denim-200"
}

function actTypeColor(t: string) {
  const map: Record<string,string> = {
    "Cleaning":"bg-blue-500/15 text-blue-300","Measurement":"bg-yellow-500/15 text-yellow-300",
    "Visual":"bg-cyan-500/15 text-cyan-300","Function Test":"bg-green-500/15 text-green-300",
    "Replacement":"bg-red-500/15 text-red-300","Thermographic Investigation":"bg-purple-500/15 text-purple-300",
    "Adjustment":"bg-orange-500/15 text-orange-300",
  }
  return map[t] ?? "bg-denim-600/40 text-denim-200/60"
}
</script>
