<template>
  <div class="space-y-4">

    <!-- ── Header + KPI strip ──────────────────────────────── -->
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Trouble Reports</h2>
        <div class="accent-bar mt-1.5"/>
      </div>
      <button class="btn-primary gap-2" @click="openCreateModal">
        <IconPlus :size="13"/>
        Report Trouble
      </button>
    </div>

    <!-- Status KPI cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="card py-3 px-4 flex items-center gap-3 cursor-pointer transition-all duration-150 hover:scale-[1.02]"
        :class="[kpi.ring, activeStatusFilter===kpi.statusKey ? kpi.activeBg : '']"
        @click="toggleStatusFilter(kpi.statusKey)"
      >
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="kpi.iconBg">
          <span class="text-lg">{{ kpi.icon }}</span>
        </div>
        <div>
          <p class="text-2xl font-bold leading-none" :class="kpi.color">{{ kpi.value }}</p>
          <p class="text-[11px] text-denim-200/50 mt-0.5 leading-tight">{{ kpi.label }}</p>
        </div>
        <!-- pulse dot for alert -->
        <div v-if="kpi.pulse" class="ml-auto w-2 h-2 rounded-full animate-pulse" :class="kpi.dotColor"/>
      </div>
    </div>

    <!-- ── Trouble table ────────────────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[1000px]">
          <thead>
            <tr class="border-b border-denim-700/40 bg-denim-900/40">
              <th class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">ID</th>
              <th class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Equipment</th>
              <th class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Trouble Name</th>
              <th class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Date / Age</th>
              <th class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Operation</th>
              <th class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Reporter</th>
              <th class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">WO Progress</th>
              <th class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Status</th>
              <th class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">ACK</th>
              <th class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in displayedTroubles"
              :key="t.id"
              class="border-b border-denim-700/15 hover:bg-denim-700/10 transition-colors group"
              :class="t.status==='Alert' ? 'bg-red-500/3' : ''"
            >
              <!-- ID -->
              <td class="px-3 py-3">
                <span class="font-mono text-[11px] text-caramel font-semibold">{{ t.id }}</span>
              </td>

              <!-- Equipment -->
              <td class="px-3 py-3">
                <p class="font-mono text-[11px] text-white font-medium">{{ t.equipmentId }}</p>
                <p class="text-[10px] text-denim-200/40 mt-0.5">{{ t.equipmentType }}</p>
              </td>

              <!-- Trouble Name -->
              <td class="px-3 py-3">
                <p class="text-sm font-medium text-white max-w-[180px] truncate" :title="t.name">{{ t.name }}</p>
              </td>

              <!-- Date / Age -->
              <td class="px-3 py-3">
                <p class="text-xs text-denim-100/70">{{ t.date }}</p>
                <p class="text-[10px] mt-0.5 font-semibold" :class="t.age > 7 ? 'text-red-400' : t.age > 3 ? 'text-yellow-400' : 'text-denim-200/40'">
                  {{ t.status !== 'Finished' ? `${t.age}d open` : 'Closed' }}
                </p>
              </td>

              <!-- Operation status -->
              <td class="px-3 py-3 text-center">
                <span class="text-[10px] px-2 py-1 rounded-full font-bold" :class="opColor(t.operation)">
                  {{ t.operation }}
                </span>
              </td>

              <!-- Reporter -->
              <td class="px-3 py-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-denim-600 flex items-center justify-center text-[9px] font-bold text-denim-200 shrink-0">
                    {{ t.reporter.split(' ').map((n:string)=>n[0]).join('') }}
                  </div>
                  <span class="text-xs text-denim-100/70 truncate max-w-[90px]">{{ t.reporter }}</span>
                </div>
              </td>

              <!-- WO Progress -->
              <td class="px-3 py-3">
                <span v-if="t.woId" class="text-[10px] font-mono text-caramel/80">{{ t.woId }}</span>
                <div v-if="t.woStatus" class="flex items-center gap-1.5 mt-1">
                  <div class="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="woProgressColor(t.woStatus)" :style="{width: woProgressPct(t.woStatus)+'%'}"/>
                  </div>
                  <span class="text-[10px]" :class="woProgressColor(t.woStatus).replace('bg-','text-')">{{ t.woStatus }}</span>
                </div>
                <span v-if="!t.woId" class="text-[10px] text-denim-200/25">No WO yet</span>
              </td>

              <!-- Status badge -->
              <td class="px-3 py-3 text-center">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" :class="statusBadge(t.status)">
                  <span v-if="t.status==='Alert'" class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                  {{ statusLabel(t.status) }}
                </div>
              </td>

              <!-- ACK — PROMINENT, not hidden -->
              <td class="px-3 py-3 text-center">
                <button
                  v-if="canAck(t)"
                  class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 active:scale-95 whitespace-nowrap"
                  :class="ackStyle(t)"
                  @click="openAckModal(t)"
                >
                  {{ ackLabel(t) }}
                </button>
                <span v-else class="text-[10px] text-denim-200/20">—</span>
              </td>

              <!-- Actions: History, Schedule WO, Edit, Print -->
              <td class="px-3 py-3">
                <div class="flex items-center justify-center gap-1">
                  <!-- Progress History -->
                  <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/40 hover:text-white transition-colors" title="Progress History" @click="openHistory(t)">
                    <IconClock :size="12"/>
                  </button>
                  <!-- Schedule Corrective WO -->
                  <button
                    v-if="canScheduleWO(t)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-caramel/15 text-denim-200/40 hover:text-caramel transition-colors"
                    title="Schedule Corrective WO" @click="openScheduleWO(t)"
                  >
                    <IconCalendar :size="12"/>
                  </button>
                  <!-- Edit -->
                  <button
                    v-if="t.status !== 'Finished'"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/40 hover:text-white transition-colors"
                    title="Edit" @click="openEdit(t)"
                  >
                    <IconPencil :size="12"/>
                  </button>
                  <!-- Print (only if finished) -->
                  <button
                    v-if="t.status==='Finished'"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-500/15 text-denim-200/40 hover:text-green-400 transition-colors"
                    title="Print Report"
                  >
                    <IconPrint :size="12"/>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!displayedTroubles.length">
              <td colspan="10" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-denim-200/20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                  <p class="text-denim-200/30 text-sm">No trouble reports found</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-denim-700/30">
        <p class="text-xs text-denim-200/40">Showing {{ displayedTroubles.length }} of {{ filteredTroubles.length }}</p>
        <div class="flex gap-1">
          <button class="px-3 py-1 text-xs rounded-lg hover:bg-denim-700/40 text-denim-200/50 disabled:opacity-30 transition-colors" :disabled="page===1" @click="page--">← Prev</button>
          <span class="px-3 py-1 text-xs text-denim-200/50">{{ page }} / {{ totalPages }}</span>
          <button class="px-3 py-1 text-xs rounded-lg hover:bg-denim-700/40 text-denim-200/50 disabled:opacity-30 transition-colors" :disabled="page>=totalPages" @click="page++">Next →</button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         CREATE TROUBLE MODAL
    ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreate" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" @click.self="showCreate=false">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-2xl">
            <!-- Header with red accent -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <IconAlertTriangle :size="16" class="text-red-400"/>
                </div>
                <div>
                  <h3 class="font-bold text-white">Report Trouble</h3>
                  <p class="text-xs text-denim-200/50">Create a new trouble report</p>
                </div>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showCreate=false">✕</button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <!-- Equipment Type + ID -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Equipment Type <span class="text-red-400">*</span></label>
                  <select v-model="createForm.equipmentType" class="input" @change="createForm.equipmentId=''">
                    <option value="">Select type</option>
                    <option v-for="t in EQ_TYPES" :key="t">{{ t }}</option>
                  </select>
                </div>
                <div>
                  <label class="label">Equipment ID <span class="text-red-400">*</span></label>
                  <select v-model="createForm.equipmentId" class="input" :disabled="!createForm.equipmentType">
                    <option value="">Select equipment</option>
                    <option v-for="e in filteredEquipment" :key="e.id" :value="e.id">{{ e.id }} – {{ e.name }}</option>
                  </select>
                </div>
              </div>

              <!-- Operation Status + Trouble Name -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Operation Status <span class="text-red-400">*</span></label>
                  <select v-model="createForm.operation" class="input">
                    <option value="">Select status</option>
                    <option>Down</option>
                    <option>Standby</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label class="label">Trouble Name <span class="text-red-400">*</span></label>
                  <input v-model="createForm.name" class="input" placeholder="e.g. AC Compressor Failure"/>
                </div>
              </div>

              <!-- Date + Hours -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Date <span class="text-red-400">*</span></label>
                  <input v-model="createForm.date" type="date" class="input"/>
                </div>
                <div>
                  <label class="label">Hours <span class="text-red-400">*</span></label>
                  <input v-model="createForm.hours" type="number" class="input" placeholder="Duration in hours" min="0" step="0.5"/>
                </div>
              </div>

              <!-- Equipment Condition -->
              <div>
                <label class="label">Equipment Condition <span class="text-red-400">*</span></label>
                <textarea v-model="createForm.condition" class="input resize-none" rows="2" placeholder="Describe the equipment's current condition..."/>
              </div>

              <!-- Impact -->
              <div>
                <label class="label">Impact <span class="text-red-400">*</span></label>
                <textarea v-model="createForm.impact" class="input resize-none" rows="2" placeholder="What is the operational impact?"/>
              </div>

              <!-- Early Action -->
              <div>
                <label class="label">Early Action Taken <span class="text-red-400">*</span></label>
                <textarea v-model="createForm.earlyAction" class="input resize-none" rows="2" placeholder="What immediate action was taken?"/>
              </div>

              <!-- Chronology -->
              <div>
                <label class="label">Chronology <span class="text-red-400">*</span></label>
                <textarea v-model="createForm.chronology" class="input resize-none" rows="3" placeholder="Describe the sequence of events leading to this trouble..."/>
              </div>

              <!-- Attachment -->
              <div>
                <label class="label">Attachments <span class="text-xs text-denim-200/40">(Max 10MB each)</span></label>
                <div
                  class="border-2 border-dashed border-denim-600/40 rounded-xl p-5 text-center hover:border-caramel/40 transition-colors cursor-pointer group"
                  @click="triggerFileInput"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2 text-denim-200/30 group-hover:text-caramel/50 transition-colors"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p class="text-xs text-denim-200/40 group-hover:text-denim-200/60">Click to upload images</p>
                  <p class="text-[10px] text-denim-200/25 mt-1">Multiple images supported · Each with a note</p>
                </div>
                <!-- Attachment previews -->
                <div v-if="createForm.attachments.length" class="flex flex-wrap gap-2 mt-2">
                  <div v-for="(att, i) in createForm.attachments" :key="i" class="flex items-center gap-1.5 bg-denim-700/40 rounded-lg px-2 py-1 text-xs">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    <span class="text-denim-100/70 max-w-[100px] truncate">{{ att.name }}</span>
                    <button class="text-denim-200/40 hover:text-red-400" @click.stop="createForm.attachments.splice(i,1)">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
              <button class="btn-secondary" @click="showCreate=false">Cancel</button>
              <button class="btn-danger" @click="submitTrouble" :disabled="!createFormValid">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════
         ACK / APPROVAL MODAL — simplified flow
    ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAck" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showAck=false">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md">
            <div class="px-6 py-5 border-b border-denim-700/40">
              <h3 class="font-bold text-white text-base">{{ ackTitle }}</h3>
              <p class="text-xs font-mono text-denim-200/50 mt-1">{{ ackTrouble?.id }} · {{ ackTrouble?.equipmentId }}</p>
            </div>
            <div class="px-6 py-4 space-y-4">
              <!-- Trouble summary -->
              <div class="bg-denim-900/50 rounded-xl p-4 space-y-2 text-xs">
                <div class="flex justify-between"><span class="text-denim-200/50">Trouble</span><span class="text-white font-medium">{{ ackTrouble?.name }}</span></div>
                <div class="flex justify-between"><span class="text-denim-200/50">Operation</span><span :class="opColor(ackTrouble?.operation)" class="font-semibold px-2 py-0.5 rounded-full text-[10px]">{{ ackTrouble?.operation }}</span></div>
                <div class="flex justify-between"><span class="text-denim-200/50">Reporter</span><span class="text-white">{{ ackTrouble?.reporter }}</span></div>
                <div class="flex justify-between"><span class="text-denim-200/50">Days Open</span><span class="font-bold" :class="ackTrouble?.age > 7 ? 'text-red-400' : 'text-yellow-300'">{{ ackTrouble?.age }} days</span></div>
              </div>

              <!-- Flow explanation -->
              <div class="flex items-center gap-2 text-[11px]">
                <span class="px-2 py-1 rounded-full font-bold" :class="statusBadge(ackTrouble?.status)">{{ statusLabel(ackTrouble?.status) }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-denim-200/30"><polyline points="9 18 15 12 9 6"/></svg>
                <span class="px-2 py-1 rounded-full font-bold" :class="statusBadge(nextStatus(ackTrouble?.status))">{{ statusLabel(nextStatus(ackTrouble?.status)) }}</span>
              </div>

              <div>
                <label class="label">SPV Note / Remark</label>
                <textarea v-model="ackNote" class="input resize-none" rows="2" placeholder="Add approval notes..."/>
              </div>
            </div>
            <div class="px-6 pb-5 flex gap-2">
              <button class="btn-secondary flex-1 justify-center" @click="showAck=false">Cancel</button>
              <button class="btn-primary flex-1 justify-center" @click="approveAck">
                ✓ Approve → {{ statusLabel(nextStatus(ackTrouble?.status)) }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════
         SCHEDULE CORRECTIVE WO MODAL
    ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showScheduleWO" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showScheduleWO=false">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-caramel/15 rounded-2xl shadow-2xl w-full max-w-sm">
            <div class="px-6 py-4 border-b border-denim-700/40">
              <h3 class="font-bold text-white">Schedule Corrective WO</h3>
              <p class="text-xs text-denim-200/50 mt-1 font-mono">{{ scheduleWOTrouble?.id }}</p>
            </div>
            <div class="px-6 py-4 space-y-3">
              <div class="bg-denim-900/50 rounded-lg p-3 text-xs space-y-1">
                <div class="flex justify-between"><span class="text-denim-200/40">Equipment</span><span class="text-white font-mono">{{ scheduleWOTrouble?.equipmentId }}</span></div>
                <div class="flex justify-between"><span class="text-denim-200/40">Trouble</span><span class="text-white">{{ scheduleWOTrouble?.name }}</span></div>
              </div>
              <div>
                <label class="label">Scheduled Date <span class="text-red-400">*</span></label>
                <input v-model="woDate" type="date" class="input"/>
              </div>
              <div>
                <label class="label">Assign Technician <span class="text-red-400">*</span></label>
                <select v-model="woTechnician" class="input">
                  <option value="">Select technician</option>
                  <option v-for="t in TECHNICIANS" :key="t">{{ t }}</option>
                </select>
              </div>
              <div class="bg-caramel/5 border border-caramel/15 rounded-lg px-3 py-2 text-xs text-caramel/80">
                💡 This will create a Corrective Work Order (interval: Once) and assign it to the Task list.
              </div>
            </div>
            <div class="px-6 pb-5 flex justify-end gap-2">
              <button class="btn-secondary" @click="showScheduleWO=false">Cancel</button>
              <button class="btn-primary" @click="submitScheduleWO" :disabled="!woDate||!woTechnician">Create WO</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════
         PROGRESS HISTORY MODAL
    ══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showHistory=false">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40">
              <h3 class="font-bold text-white">Progress History</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showHistory=false">✕</button>
            </div>
            <div class="px-6 py-4">
              <div class="relative pl-5">
                <div class="absolute left-1.5 top-2 bottom-2 w-px bg-denim-600/40"/>
                <div v-for="(event, i) in historyTrouble?.timeline" :key="i" class="relative mb-4 last:mb-0">
                  <div class="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-denim-800" :class="event.color"/>
                  <p class="text-xs font-semibold text-white">{{ event.label }}</p>
                  <p class="text-[10px] text-denim-200/50 mt-0.5">{{ event.date }} · {{ event.by }}</p>
                  <p v-if="event.note" class="text-[10px] text-denim-200/40 mt-0.5 italic">{{ event.note }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import {
  IconPlus, IconAlertTriangle, IconAlertCircle, IconCheckCircle,
  IconClock, IconCalendar, IconCheck, IconX, IconPencil, IconPrint,
  IconPaperclip, IconRefresh, IconExternalLink
} from "@/components/icons"

const EQ_TYPES   = ["AC Fasilitas","Genset","Panel Listrik","CCTV","Fire Alarm","Pompa Air","Lift / Elevator"]
const TECHNICIANS = ["Ahmad Fauzi","Budi Santoso","Citra Dewi","Dodi Prasetyo","Eko Wahyudi"]

const EQ_MAP: Record<string,{id:string,name:string}[]> = {
  "AC Fasilitas":   [{id:"EDA_AC_001",name:"AC Lobby"},{id:"EDA_AC_002",name:"AC Function Room"}],
  "Genset":         [{id:"EDA_GEN_001",name:"Genset B2"},{id:"EDA_GEN_002",name:"Genset Rooftop"}],
  "Panel Listrik":  [{id:"EDA_PNL_001",name:"Panel MDP B2"},{id:"EDA_PNL_002",name:"Panel Lt.3"}],
  "CCTV":           [{id:"EDA_CCTV_001",name:"CCTV Lobby"}],
  "Fire Alarm":     [{id:"EDA_FA_001",name:"FA Panel Utama"}],
  "Pompa Air":      [{id:"EDA_PUMP_001",name:"Pompa Air Bersih"},{id:"EDA_PUMP_003",name:"Pompa Transfer"}],
  "Lift / Elevator":[{id:"EDA_LIFT_001",name:"Lift Servis B1"},{id:"EDA_LIFT_002",name:"Lift Penumpang 1"}],
}

// ── Sample trouble data ───────────────────────────────────────
const troubles = ref([
  { id:"TBL-2026-001", equipmentId:"EDA_GEN_001", equipmentType:"Genset",       name:"Genset tidak mau start",      date:"2026-02-25", age:7,  operation:"Down",       reporter:"Ahmad Fauzi",   status:"Alert",         woId:null,        woStatus:null,     timeline:[{label:"Reported",color:"bg-red-500",date:"2026-02-25 08:12",by:"Ahmad Fauzi",note:"Genset fail to start on routine check"}] },
  { id:"TBL-2026-002", equipmentId:"EDA_AC_002",  equipmentType:"AC Fasilitas", name:"AC Compressor Failure",       date:"2026-02-28", age:4,  operation:"Standby",    reporter:"Citra Dewi",    status:"Open-Pending",  woId:"WO-2026-010",woStatus:"Waiting", timeline:[{label:"Reported",color:"bg-red-500",date:"2026-02-28 10:00",by:"Citra Dewi",note:""},{label:"Approved by SPV",color:"bg-yellow-400",date:"2026-03-01 09:15",by:"Budi SPV",note:"Approved, schedule corrective WO"},{label:"WO Scheduled",color:"bg-blue-400",date:"2026-03-02 11:00",by:"Budi SPV",note:"WO-2026-010 created for 2026-03-05"}] },
  { id:"TBL-2026-003", equipmentId:"EDA_PUMP_001",equipmentType:"Pompa Air",    name:"Pompa air bocor di sambungan",date:"2026-03-01", age:3,  operation:"Operations", reporter:"Dodi Prasetyo", status:"Open-WO-Done",  woId:"WO-2026-008",woStatus:"Finish",  timeline:[{label:"Reported",color:"bg-red-500",date:"2026-03-01 07:30",by:"Dodi Prasetyo",note:""},{label:"Approved",color:"bg-yellow-400",date:"2026-03-01 14:00",by:"Eko SPV",note:""},{label:"WO Completed",color:"bg-green-400",date:"2026-03-02 16:00",by:"Ahmad Fauzi",note:"Leak fixed, clamp replaced"}] },
  { id:"TBL-2026-004", equipmentId:"EDA_LIFT_001",equipmentType:"Lift / Elevator",name:"Pintu lift tidak menutup sempurna",date:"2026-02-10",age:22,operation:"Down",reporter:"Budi Santoso", status:"Finished",      woId:"WO-2026-005",woStatus:"Finish",  timeline:[{label:"Reported",color:"bg-red-500",date:"2026-02-10 09:00",by:"Budi Santoso",note:""},{label:"Approved",color:"bg-yellow-400",date:"2026-02-11 10:00",by:"SPV",note:""},{label:"WO Done",color:"bg-green-400",date:"2026-02-14 15:00",by:"Teknisi",note:""},{label:"Finished",color:"bg-green-500",date:"2026-02-15 08:00",by:"Chief Eng",note:"Closed"}] },
  { id:"TBL-2026-005", equipmentId:"EDA_PNL_001", equipmentType:"Panel Listrik", name:"MCB Panel sering trip",       date:"2026-03-03", age:1,  operation:"Operations", reporter:"Eko Wahyudi",   status:"Alert",         woId:null,        woStatus:null,     timeline:[{label:"Reported",color:"bg-red-500",date:"2026-03-03 13:45",by:"Eko Wahyudi",note:"MCB trips 3x in 2 hours"}] },
])

// ── Status filter ─────────────────────────────────────────────
const activeStatusFilter = ref("")
const page = ref(1)
const PER_PAGE = 8

function toggleStatusFilter(key: string) { activeStatusFilter.value = activeStatusFilter.value===key ? "" : key; page.value=1 }

const filteredTroubles = computed(() =>
  activeStatusFilter.value ? troubles.value.filter(t=>t.status===activeStatusFilter.value) : troubles.value
)
const totalPages     = computed(() => Math.max(1, Math.ceil(filteredTroubles.value.length / PER_PAGE)))
const displayedTroubles = computed(() => filteredTroubles.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))

// ── KPIs ──────────────────────────────────────────────────────
const kpis = computed(() => [
  { label:"Alert", statusKey:"Alert",        value:troubles.value.filter(t=>t.status==="Alert").length,        color:"text-red-400",    iconBg:"bg-red-500/10",    ring:"border border-red-500/15 hover:border-red-500/30",    activeBg:"bg-red-500/10", icon:"🚨", pulse:true, dotColor:"bg-red-400" },
  { label:"Open · Pending WO", statusKey:"Open-Pending", value:troubles.value.filter(t=>t.status==="Open-Pending").length, color:"text-yellow-300", iconBg:"bg-yellow-500/10", ring:"border border-yellow-500/15 hover:border-yellow-500/30", activeBg:"bg-yellow-500/10", icon:"⏳", pulse:false, dotColor:"" },
  { label:"Open · WO Done",    statusKey:"Open-WO-Done", value:troubles.value.filter(t=>t.status==="Open-WO-Done").length, color:"text-green-300",  iconBg:"bg-green-500/10",  ring:"border border-green-500/15 hover:border-green-500/30",  activeBg:"bg-green-500/10", icon:"✅", pulse:false, dotColor:"" },
  { label:"Finished", statusKey:"Finished",     value:troubles.value.filter(t=>t.status==="Finished").length,     color:"text-denim-200/60",iconBg:"bg-denim-600/30",  ring:"border border-denim-600/20 hover:border-denim-600/40",  activeBg:"bg-denim-600/20", icon:"🏁", pulse:false, dotColor:"" },
])

// ── Helpers ───────────────────────────────────────────────────
function opColor(op: string) {
  if(op==="Down")       return "bg-red-500/20 text-red-400"
  if(op==="Standby")    return "bg-yellow-500/20 text-yellow-300"
  if(op==="Operations") return "bg-green-500/20 text-green-400"
  return "bg-denim-600/40 text-denim-200"
}

function statusBadge(s: string) {
  if(s==="Alert")        return "bg-red-500/20 text-red-400 border border-red-500/30"
  if(s==="Open-Pending") return "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
  if(s==="Open-WO-Done") return "bg-green-400/20 text-green-300 border border-green-400/30"
  if(s==="Finished")     return "bg-denim-600/40 text-denim-200/60 border border-denim-600/30"
  return "bg-denim-600/40 text-denim-200"
}

function statusLabel(s: string) {
  if(s==="Alert")        return "Alert"
  if(s==="Open-Pending") return "Open · Pending WO"
  if(s==="Open-WO-Done") return "Open · WO Done"
  if(s==="Finished")     return "Finished"
  return s ?? ""
}

function nextStatus(s: string) {
  if(s==="Alert")        return "Open-Pending"
  if(s==="Open-Pending") return "Open-WO-Done"
  if(s==="Open-WO-Done") return "Finished"
  return "Finished"
}

function woProgressColor(s: string) {
  if(s==="Finish")   return "bg-green-500"
  if(s==="Process")  return "bg-caramel"
  if(s==="Waiting")  return "bg-slate-500"
  return "bg-denim-600"
}
function woProgressPct(s: string) {
  const map: Record<string,number> = { Waiting:10, Process:40, Reporting:60, Review:75, "Client Spv Review":85, "Chief Eng Review":95, Finish:100 }
  return map[s] ?? 0
}

function canAck(t: any) {
  return t.status === "Alert" // SPV approves Alert → Open-Pending
}
function canScheduleWO(t: any) {
  return t.status === "Open-Pending" && !t.woId
}

function ackLabel(t: any) { return t.status === "Alert" ? "Approve" : "ACK" }
function ackStyle(t: any) {
  if(t.status==="Alert") return "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 shadow-sm shadow-red-500/10"
  return "bg-denim-600/50 text-denim-200 hover:bg-denim-600"
}

// ── ACK Modal ─────────────────────────────────────────────────
const showAck   = ref(false)
const ackTrouble = ref<any>(null)
const ackNote    = ref("")
const ackTitle   = computed(() => {
  if(!ackTrouble.value) return ""
  if(ackTrouble.value.status==="Alert") return "SPV — Approve Trouble Report"
  return "Acknowledge"
})

function openAckModal(t: any) { ackTrouble.value=t; ackNote.value=""; showAck.value=true }
function approveAck() {
  if(!ackTrouble.value) return
  const idx = troubles.value.findIndex(t=>t.id===ackTrouble.value.id)
  if(idx>=0) {
    troubles.value[idx].status = nextStatus(ackTrouble.value.status)
    troubles.value[idx].timeline.push({
      label:"Approved by SPV", color:"bg-yellow-400",
      date: new Date().toLocaleString(), by:"Current User", note: ackNote.value
    })
  }
  showAck.value=false
}

// ── Schedule WO Modal ─────────────────────────────────────────
const showScheduleWO    = ref(false)
const scheduleWOTrouble = ref<any>(null)
const woDate            = ref("")
const woTechnician      = ref("")

function openScheduleWO(t: any) { scheduleWOTrouble.value=t; woDate.value=""; woTechnician.value=""; showScheduleWO.value=true }
function submitScheduleWO() {
  if(!scheduleWOTrouble.value||!woDate.value||!woTechnician.value) return
  const idx = troubles.value.findIndex(t=>t.id===scheduleWOTrouble.value.id)
  const newWoId = `WO-${Date.now().toString().slice(-6)}`
  if(idx>=0) {
    troubles.value[idx].woId = newWoId
    troubles.value[idx].woStatus = "Waiting"
    troubles.value[idx].timeline.push({ label:"Corrective WO Scheduled", color:"bg-blue-400", date: new Date().toLocaleString(), by:"SPV", note:`${newWoId} scheduled for ${woDate.value} → ${woTechnician.value}` })
  }
  showScheduleWO.value=false
}

// ── Progress History Modal ────────────────────────────────────
const showHistory    = ref(false)
const historyTrouble = ref<any>(null)
function openHistory(t: any) { historyTrouble.value=t; showHistory.value=true }

// ── Create Modal ──────────────────────────────────────────────
const showCreate = ref(false)
const createForm = ref({ equipmentType:"", equipmentId:"", operation:"", name:"", date:"", hours:"", condition:"", impact:"", earlyAction:"", chronology:"", attachments:[] as any[] })

const filteredEquipment = computed(() => EQ_MAP[createForm.value.equipmentType] ?? [])
const createFormValid   = computed(() =>
  createForm.value.equipmentType && createForm.value.equipmentId &&
  createForm.value.operation && createForm.value.name &&
  createForm.value.date && createForm.value.hours &&
  createForm.value.condition && createForm.value.impact &&
  createForm.value.earlyAction && createForm.value.chronology
)

function openCreateModal() {
  createForm.value = { equipmentType:"", equipmentId:"", operation:"", name:"", date:"", hours:"", condition:"", impact:"", earlyAction:"", chronology:"", attachments:[] }
  showCreate.value=true
}

function submitTrouble() {
  if(!createFormValid.value) return
  troubles.value.unshift({
    id:`TBL-${Date.now().toString().slice(-6)}`,
    equipmentId: createForm.value.equipmentId,
    equipmentType: createForm.value.equipmentType,
    name: createForm.value.name,
    date: createForm.value.date,
    age: 0,
    operation: createForm.value.operation,
    reporter: "Current User",
    status: "Alert",
    woId: null,
    woStatus: null,
    timeline: [{ label:"Reported", color:"bg-red-500", date: new Date().toLocaleString(), by:"Current User", note: createForm.value.chronology }]
  })
  showCreate.value=false
}

function triggerFileInput() { /* file input trigger */ }
function openEdit(t: any) { /* TODO: edit modal */ }
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
