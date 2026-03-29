<template>
  <div class="space-y-4">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-start gap-3 flex-wrap justify-between">
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-1.5 text-sm text-caramel hover:text-caramel/80 transition-colors" @click="router.back()">
          <IconArrowLeft :size="14" stroke-width="2.5"/> Back
        </button>
        <div class="h-4 w-px bg-denim-600/50"/>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-bold text-white">{{ eq.name }}</h2>
            <span class="text-[10px] px-2 py-0.5 rounded-full border font-semibold" :class="criticalClass(eq.criticalLevel)">
              Critical L{{ eq.criticalLevel }}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-semibold">
              {{ eq.status }}
            </span>
          </div>
          <p class="text-xs font-mono text-caramel/70 mt-0.5">{{ eq.id }}</p>
        </div>
      </div>

      <!-- Action toolbar -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button class="btn-secondary px-3 py-1.5 text-xs gap-1.5" @click="activeTab='maintenance'">
          <IconClipboard :size="12"/> Maintenance
        </button>
        <button class="btn-secondary px-3 py-1.5 text-xs gap-1.5" @click="activeTab='trouble'">
          <IconAlertTriangle :size="12"/> Trouble
        </button>
        <button class="btn-secondary px-3 py-1.5 text-xs gap-1.5" @click="activeTab='activities'">
          <IconActivity :size="12"/> Activities
        </button>
        <button class="relative btn-secondary px-3 py-1.5 text-xs gap-1.5 border-red-500/30 text-red-400" @click="activeTab='active-wo'">
          <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
          <IconZap :size="12"/> Active WO
        </button>
        <div class="w-px h-5 bg-denim-600/40 mx-0.5"/>
        <button class="btn-secondary p-1.5" title="Statistics" @click="activeTab='stats'">
          <IconBarChart :size="15"/>
        </button>
        <button class="btn-secondary p-1.5" title="QR Code" @click="showQR=true">
          <IconQrCode :size="15"/>
        </button>
        <button class="btn-secondary p-1.5" title="Export PDF">
          <IconFileDown :size="15"/>
        </button>
        <button class="btn-secondary p-1.5" title="Edit" @click="showEdit=true">
          <IconPencil :size="15"/>
        </button>
        <button class="btn-danger p-1.5" title="Delete">
          <IconTrash :size="15"/>
        </button>
      </div>
    </div>

    <!-- ── Asset overview — horizontal card row ─────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="card py-3 px-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-caramel/10 flex items-center justify-center shrink-0">
          <IconCpu :size="16" class="text-caramel/70"/>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] text-denim-200/40">Type</p>
          <p class="text-xs font-semibold text-white truncate">{{ eq.type }}</p>
        </div>
      </div>
      <div class="card py-3 px-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <IconMapPin :size="16" class="text-blue-400/70"/>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] text-denim-200/40">Location</p>
          <p class="text-xs font-semibold text-white truncate">{{ eq.location }}</p>
        </div>
      </div>
      <div class="card py-3 px-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
          <IconTag :size="16" class="text-purple-400/70"/>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] text-denim-200/40">Section</p>
          <p class="text-xs font-semibold text-white truncate">{{ eq.section }}</p>
        </div>
      </div>
      <div class="card py-3 px-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
          <IconCalendar :size="16" class="text-green-400/70"/>
        </div>
        <div class="min-w-0">
          <p class="text-[10px] text-denim-200/40">Installed</p>
          <p class="text-xs font-semibold text-white truncate">{{ eq.installDate }}</p>
        </div>
      </div>
    </div>

    <!-- ── Main 2-col layout ───────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">

      <!-- LEFT: Photo + Map -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Photo -->
        <div class="card p-0 overflow-hidden">
          <div class="aspect-[4/3] bg-gradient-to-br from-denim-900/80 to-denim-800/60 flex flex-col items-center justify-center gap-2">
            <div class="w-12 h-12 rounded-xl bg-denim-700/50 flex items-center justify-center">
              <IconImage :size="22" class="text-denim-200/30"/>
            </div>
            <p class="text-xs text-denim-200/30">No photo available</p>
            <button class="btn-secondary text-xs px-3 py-1 mt-1 gap-1.5">
              <IconUpload :size="11"/> Upload Photo
            </button>
          </div>
        </div>

        <!-- Map -->
        <div class="card p-0 overflow-hidden">
          <div class="aspect-video bg-denim-900/60 relative overflow-hidden">
            <svg class="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#FFC677" stroke-width="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#g)"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <div class="w-7 h-7 rounded-full bg-red-500 shadow-lg shadow-red-500/40 flex items-center justify-center">
                <IconMapPin :size="14" class="text-white"/>
              </div>
              <div class="bg-denim-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                <p class="text-[10px] font-mono text-caramel/80">{{ eq.lat }}, {{ eq.lng }}</p>
                <p class="text-[10px] text-denim-200/50 mt-0.5">{{ eq.location }}</p>
              </div>
            </div>
          </div>
          <div class="px-3 py-2 flex justify-between items-center border-t border-denim-700/30">
            <p class="text-[10px] text-denim-200/40">GPS Coordinates</p>
            <button class="text-[10px] text-caramel hover:underline flex items-center gap-1">
              Open Map <IconExternalLink :size="9"/>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: Specs (collapsible) + Tabbed content -->
      <div class="lg:col-span-3 space-y-3">

        <!-- Technical Specs collapsible — above tabs -->
        <div class="card p-0 overflow-hidden">
          <button
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-denim-700/10 transition-colors"
            @click="showSpecs=!showSpecs"
          >
            <div class="flex items-center gap-2">
              <IconSliders :size="13" class="text-caramel/60"/>
              <span class="text-xs font-semibold text-denim-200/60 uppercase tracking-wide">Technical Specifications</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[10px] text-denim-200/25">{{ showSpecs ? "Collapse" : "Expand" }}</span>
              <IconChevronDown :size="14" class="text-denim-200/40 transition-transform duration-200" :class="showSpecs?'rotate-180':''"/>
            </div>
          </button>
          <Transition name="collapse">
            <div v-if="showSpecs" class="border-t border-denim-700/20 px-4 py-3">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                <div v-for="row in specRows" :key="row.label">
                  <p class="text-[10px] text-denim-200/35 leading-none mb-0.5">{{ row.label }}</p>
                  <p class="text-xs font-medium text-white">{{ row.value || "—" }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="card p-0 overflow-hidden">
          <!-- Tab nav -->
          <div class="flex overflow-x-auto border-b border-denim-700/40 bg-denim-900/20">
            <button
              v-for="tab in TABS" :key="tab.key"
              class="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors"
              :class="activeTab===tab.key
                ? 'border-caramel text-caramel'
                : 'border-transparent text-denim-200/40 hover:text-denim-200/70'"
              @click="activeTab=tab.key"
            >
              <component :is="tab.icon" :size="12"/>
              {{ tab.label }}
            </button>
          </div>

          <!-- Maintenance Record -->
          <div v-if="activeTab==='maintenance'" class="overflow-x-auto">
            <table class="w-full text-xs min-w-[560px]">
              <thead><tr class="border-b border-denim-700/30 bg-denim-900/20">
                <th v-for="h in ['No','ID','Date','Classification','Interval','WO Status','Operation','Healthy']" :key="h"
                  class="px-3 py-2 text-left text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide">{{ h }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="(r,i) in maintenanceRecords" :key="r.id" class="border-b border-denim-700/10 hover:bg-denim-700/10">
                  <td class="px-3 py-2.5 text-denim-200/30">{{ i+1 }}</td>
                  <td class="px-3 py-2.5 font-mono text-caramel text-[10px]">{{ r.id }}</td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.date }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="classColor(r.classification)">{{ r.classification }}</span></td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.interval }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px]" :class="woColor(r.woStatus)">{{ r.woStatus }}</span></td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.operation }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px]" :class="r.healthy==='Good'?'bg-green-500/15 text-green-400':'bg-red-500/15 text-red-400'">{{ r.healthy }}</span></td>
                </tr>
                <tr v-if="!maintenanceRecords.length"><td colspan="8" class="px-3 py-8 text-center text-denim-200/25">No records</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Trouble Record -->
          <div v-else-if="activeTab==='trouble'" class="overflow-x-auto">
            <table class="w-full text-xs min-w-[640px]">
              <thead><tr class="border-b border-denim-700/30 bg-denim-900/20">
                <th v-for="h in ['No','ID','Trouble Name','Date','Operation','Condition','Impact','Reporter','Status']" :key="h"
                  class="px-3 py-2 text-left text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide">{{ h }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="(r,i) in troubleRecords" :key="r.id" class="border-b border-denim-700/10 hover:bg-denim-700/10">
                  <td class="px-3 py-2.5 text-denim-200/30">{{ i+1 }}</td>
                  <td class="px-3 py-2.5 font-mono text-caramel text-[10px]">{{ r.id }}</td>
                  <td class="px-3 py-2.5 text-white font-medium max-w-[120px] truncate">{{ r.name }}</td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.date }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px]" :class="opColor(r.operation)">{{ r.operation }}</span></td>
                  <td class="px-3 py-2.5 text-denim-100/60 max-w-[100px] truncate" :title="r.condition">{{ r.condition }}</td>
                  <td class="px-3 py-2.5 text-denim-100/60 max-w-[100px] truncate" :title="r.impact">{{ r.impact }}</td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.reporter }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="tStatus(r.status)">{{ r.status }}</span></td>
                </tr>
                <tr v-if="!troubleRecords.length"><td colspan="9" class="px-3 py-8 text-center text-denim-200/25">No trouble records</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Activities -->
          <div v-else-if="activeTab==='activities'" class="p-4 space-y-2">
            <div v-for="(a,i) in eqActivities" :key="a.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-denim-900/40 border border-denim-700/20 hover:border-denim-600/40 transition-colors">
              <span class="text-[10px] text-denim-200/25 w-4 text-right shrink-0">{{ i+1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white">{{ a.name }}</p>
                <p class="text-[10px] text-denim-200/40 mt-0.5">{{ a.type }} · {{ a.answerType }}<span v-if="a.unit"> · {{ a.unit }}</span></p>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded font-medium shrink-0"
                :class="a.status==='Enable'?'bg-green-500/15 text-green-400':'bg-denim-600/40 text-denim-200/40'">{{ a.status }}</span>
            </div>
            <p v-if="!eqActivities.length" class="text-xs text-denim-200/30 text-center py-8">No activities defined</p>
          </div>

          <!-- Active WO -->
          <div v-else-if="activeTab==='active-wo'" class="overflow-x-auto">
            <table class="w-full text-xs min-w-[520px]">
              <thead><tr class="border-b border-denim-700/30 bg-denim-900/20">
                <th v-for="h in ['No','WO ID','Date','Classification','Interval','Status','Technician']" :key="h"
                  class="px-3 py-2 text-left text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide">{{ h }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="(r,i) in activeWOs" :key="r.id" class="border-b border-denim-700/10 hover:bg-denim-700/10">
                  <td class="px-3 py-2.5 text-denim-200/30">{{ i+1 }}</td>
                  <td class="px-3 py-2.5 font-mono text-caramel text-[10px]">{{ r.id }}</td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.date }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px]" :class="classColor(r.classification)">{{ r.classification }}</span></td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.interval }}</td>
                  <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded text-[10px] animate-pulse" :class="woColor(r.woStatus)">{{ r.woStatus }}</span></td>
                  <td class="px-3 py-2.5 text-denim-100/60">{{ r.technician }}</td>
                </tr>
                <tr v-if="!activeWOs.length"><td colspan="7" class="px-3 py-8 text-center text-denim-200/25">No active work orders</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Statistics -->
          <div v-else-if="activeTab==='stats'" class="p-4 space-y-4">
            <!-- Availability gauge -->
            <div class="flex items-center gap-6">
              <div class="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" stroke-width="12"
                    stroke-dasharray="238.76" stroke-dashoffset="0" stroke-linecap="round"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-base font-bold text-green-400">100%</span>
                  <span class="text-[9px] text-denim-200/40">Avail.</span>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-xs flex-1">
                <div v-for="row in statsRows" :key="row.label">
                  <p class="text-[10px] text-denim-200/40">{{ row.label }}</p>
                  <p class="font-semibold text-white">{{ row.value }}</p>
                </div>
              </div>
            </div>
            <!-- Failure history table -->
            <div>
              <p class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide mb-2">Failure History</p>
              <table class="w-full text-xs">
                <thead><tr class="border-b border-denim-700/30">
                  <th v-for="h in ['No','Down','Up','Downtime','Kerusakan','Reporter']" :key="h"
                    class="py-1.5 text-left text-[10px] text-denim-200/30 uppercase tracking-wide px-1">{{ h }}</th>
                </tr></thead>
                <tbody><tr><td colspan="6" class="py-6 text-center text-denim-200/25">No failure history</td></tr></tbody>
              </table>
              <div class="mt-3 text-[10px] text-denim-200/25 space-y-0.5 border-t border-denim-700/20 pt-3">
                <p>• MTBF = Mean Time Before Failure &nbsp;·&nbsp; MTTR = Mean Time to Repair</p>
                <p>• PM rutin diabaikan · PM besar (&gt;2x24 jam) diperhitungkan sebagai downtime</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ── QR Code Modal ────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showQR" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showQR=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-xs text-center">
            <div class="px-5 py-4 border-b border-denim-700/40 flex items-center justify-between">
              <div class="flex items-center gap-2"><IconQrCode :size="14" class="text-caramel/60"/><h3 class="font-bold text-white text-sm">QR Code</h3></div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showQR=false"><IconX :size="14"/></button>
            </div>
            <div class="p-6">
              <div class="w-44 h-44 mx-auto bg-white rounded-xl p-2 mb-4 flex items-center justify-center">
                <canvas ref="qrCanvas" width="160" height="160"/>
              </div>
              <p class="text-[10px] text-denim-200/40 mb-1 text-center">Scans to:</p>
              <p class="text-xs font-mono text-caramel font-bold text-center break-all">{{ qrUrl }}</p>
              <p class="text-xs text-denim-200/50 mt-1 text-center">{{ eq.name }}</p>
              <button class="btn-secondary w-full justify-center mt-4 text-xs gap-1.5" @click="downloadQR"><IconDownload :size="12"/>Download QR</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
import { useRouter, useRoute } from "vue-router"
import {
  IconArrowLeft, IconPencil, IconPrint, IconTrash, IconZap,
  IconClipboard, IconCpu, IconActivity, IconBarChart, IconClock,
  IconAlertTriangle, IconMapPin, IconTag, IconCalendar,
  IconQrCode, IconFileDown, IconSliders, IconChevronDown,
  IconImage, IconUpload, IconDownload, IconX, IconExternalLink
} from "@/components/icons"

const router = useRouter()
const route  = useRoute()
const eqId   = route.params.eqId as string

const activeTab = ref("maintenance")
const showQR    = ref(false)
const qrCanvas  = ref<HTMLCanvasElement | null>(null)
const qrUrl     = computed(() => `${window.location.origin}/equipment/detail/${eq.value.id}`)

// Generate QR when modal opens
watch(showQR, async (val) => {
  if (!val) return
  await nextTick()
  const canvas = qrCanvas.value
  if (!canvas) return
  // Simple QR pattern using the Google Charts API via image
  // We draw it to canvas via an image element
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl.value)}&format=png&bgcolor=ffffff&color=02314E`
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    const ctx = canvas.getContext("2d")
    if (ctx) { ctx.clearRect(0,0,160,160); ctx.drawImage(img,0,0,160,160) }
  }
  img.onerror = () => {
    // Fallback: draw simple placeholder pattern
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0,0,160,160)
    ctx.fillStyle = "#02314E"
    const size = 8
    for (let r=0; r<20; r++) {
      for (let c=0; c<20; c++) {
        if ((r+c)%3===0 || (r*c)%5===1) ctx.fillRect(c*size, r*size, size-1, size-1)
      }
    }
  }
  img.src = url
})

function downloadQR() {
  const canvas = qrCanvas.value
  if (!canvas) return
  const a = document.createElement("a")
  a.download = `QR_${eq.value.id}.png`
  a.href = canvas.toDataURL("image/png")
  a.click()
}
const showEdit  = ref(false)
const showSpecs = ref(true)

const TABS = [
  { key:"maintenance", label:"Maintenance", icon: IconClipboard },
  { key:"trouble",     label:"Trouble",     icon: IconAlertTriangle },
  { key:"activities",  label:"Activities",  icon: IconActivity },
  { key:"active-wo",   label:"Active WO",   icon: IconZap },
  { key:"stats",       label:"Statistics",  icon: IconBarChart },
]

const eq = ref({
  id: eqId || "EDA_EM1_2_AC_FUNC_ROOM_1",
  name: "AC FUNCTION ROOM", classification:"Others", type:"AC Fasilitas",
  plant:"Essence Darmawangsa Apartment", section:"Air Conditioner",
  location:"LANTAI 2", lat:"-6.2685346", lng:"106.8074791",
  criticalLevel:2, serial:"", model:"", capacity:"", brand:"", vendor:"",
  maintainer:"PT Sumber Sarana Solusindo", installDate:"2 Dec 2002",
  other:"", status:"Active",
})

const specRows = computed(() => [
  {label:"Classification", value:eq.value.classification},
  {label:"Plant / Site",   value:eq.value.plant},
  {label:"Maintainer",     value:eq.value.maintainer},
  {label:"Model Number",   value:eq.value.model},
  {label:"Serial Number",  value:eq.value.serial},
  {label:"Size/Capacity",  value:eq.value.capacity},
  {label:"Brand/Maker",    value:eq.value.brand},
  {label:"Vendor",         value:eq.value.vendor},
])

const statsRows = [
  {label:"Beroperasi Sejak",  value:"2 Dec 2002"},
  {label:"Total Calendar Time",value:"740,075 hari"},
  {label:"Total Downtime",    value:"0.00 jam"},
  {label:"Jumlah Down",       value:"0 kali"},
  {label:"MTBF",              value:"17,761,807.00 jam"},
  {label:"MTTR",              value:"0.00 jam"},
]

const maintenanceRecords = ref([
  {id:"MNT-2026-0012",date:"2026-01-15",classification:"Preventive",interval:"Monthly",  woStatus:"Finish", operation:"Operasi",healthy:"Good"},
  {id:"MNT-2025-0089",date:"2025-12-15",classification:"Preventive",interval:"Monthly",  woStatus:"Finish", operation:"Operasi",healthy:"Good"},
  {id:"MNT-2025-0055",date:"2025-09-10",classification:"Preventive",interval:"3 Monthly",woStatus:"Finish", operation:"Operasi",healthy:"Good"},
])
const troubleRecords = ref([
  {id:"TBL-2025-0003",name:"AC Compressor Failure",date:"2025-11-03",operation:"Down",condition:"Freon habis",impact:"Ruangan panas",reporter:"Ahmad Fauzi",status:"Finished"},
])
const eqActivities = ref([
  {id:1,name:"Cleaning Filter",  type:"Cleaning",  answerType:"Qualitative", unit:"Bersih",status:"Enable"},
  {id:2,name:"Cek Freon",        type:"Measurement",answerType:"Quantitative",unit:"PSI",  status:"Enable"},
  {id:3,name:"Thermography",     type:"Thermographic Investigation",answerType:"Qualitative",unit:"",status:"Enable"},
])
const activeWOs = ref([
  {id:"WO-2026-0042",date:"2026-03-04",classification:"Preventive",interval:"Monthly",woStatus:"Process",technician:"Ahmad Fauzi"},
])

function criticalClass(l:number){ return l>=4?"bg-red-500/15 text-red-400 border-red-500/25":l===3?"bg-orange-500/15 text-orange-300 border-orange-500/25":l===2?"bg-yellow-500/15 text-yellow-300 border-yellow-500/25":"bg-denim-600/30 text-denim-200/50 border-denim-600/30" }
function classColor(c:string){ if(c==="Preventive")return"bg-blue-500/15 text-blue-300";if(c==="Corrective")return"bg-green-500/15 text-green-300";if(c==="Predictive")return"bg-orange-500/15 text-orange-300";return"bg-purple-500/15 text-purple-300" }
function woColor(s:string){ if(s==="Finish")return"bg-green-500/15 text-green-400";if(s==="Process")return"bg-caramel/15 text-caramel";if(s==="Waiting")return"bg-denim-600/50 text-denim-200";return"bg-denim-600/50 text-denim-200" }
function opColor(op:string){ if(op==="Down")return"bg-red-500/20 text-red-400";if(op==="Standby")return"bg-yellow-500/20 text-yellow-300";return"bg-green-500/20 text-green-400" }
function tStatus(s:string){ if(s==="Finished")return"bg-green-500/15 text-green-400";if(s==="Open")return"bg-yellow-400/15 text-yellow-300";return"bg-red-500/15 text-red-400" }
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
.collapse-enter-active,.collapse-leave-active{transition:all .2s ease;overflow:hidden}
.collapse-enter-from,.collapse-leave-to{opacity:0;max-height:0}
.collapse-enter-to,.collapse-leave-from{opacity:1;max-height:600px}
</style>
