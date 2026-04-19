<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">
          {{ t("trouble.title") }}
        </h2>
        <div class="accent-bar mt-1.5" />
      </div>
      <button class="btn-primary gap-2" @click="openCreateModal">
        <IconPlus :size="13" /> {{ t("trouble.report") }}
      </button>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="card py-3 px-4 flex items-center gap-3 cursor-pointer transition-all duration-150 hover:scale-[1.02]"
        :class="[
          kpi.ring,
          activeStatusFilter === kpi.statusKey ? kpi.activeBg : '',
        ]"
        @click="toggleStatusFilter(kpi.statusKey)"
      >
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          :class="kpi.iconBg"
        >
          <component :is="kpi.icon" :size="16" class="opacity-70" />
        </div>
        <div>
          <p class="text-2xl font-bold leading-none" :class="kpi.color">
            {{ kpi.value }}
          </p>
          <p class="text-[11px] text-denim-200/50 mt-0.5 leading-tight">
            {{ kpi.label }}
          </p>
        </div>
        <div
          v-if="kpi.pulse"
          class="ml-auto w-2 h-2 rounded-full animate-pulse"
          :class="kpi.dotColor"
        />
      </div>
    </div>

    <!-- Loading / error -->
    <div
      v-if="trLoading"
      class="flex items-center gap-2 text-xs text-denim-200/40 py-2"
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
    <div
      v-if="trError"
      class="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
    >
      {{ trError }}
    </div>

    <!-- Table -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[1000px]">
          <thead>
            <tr class="border-b border-denim-700/40 bg-denim-900/40">
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                ID
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("trouble.equipment") }}
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("common.name") }}
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("common.date") }}
              </th>
              <th
                class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("trouble.operation") }}
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("trouble.reporter") }}
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                WO
              </th>
              <th
                class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("common.status") }}
              </th>
              <th
                class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                ACK
              </th>
              <th
                class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                {{ t("common.action") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tr in displayedTroubles"
              :key="tr.id"
              class="border-b border-denim-700/15 hover:bg-denim-700/10 transition-colors group"
              :class="tr.status === 'Alert' ? 'bg-red-500/3' : ''"
            >
              <td class="px-3 py-3">
                <span
                  class="font-mono text-[11px] text-caramel font-semibold"
                  >{{ tr.code || tr.id }}</span
                >
              </td>
              <td class="px-3 py-3">
                <p class="font-mono text-[11px] text-white font-medium">
                  {{ tr.equipmentId }}
                </p>
                <p class="text-[10px] text-denim-200/40 mt-0.5">
                  {{ tr.equipmentType }}
                </p>
              </td>
              <td class="px-3 py-3">
                <p
                  class="text-sm font-medium text-white max-w-[180px] truncate"
                  :title="tr.name"
                >
                  {{ tr.name }}
                </p>
              </td>
              <td class="px-3 py-3">
                <p class="text-xs text-denim-100/70">{{ tr.date }}</p>
                <p
                  class="text-[10px] mt-0.5 font-semibold"
                  :class="
                    tr.age > 7
                      ? 'text-red-400'
                      : tr.age > 3
                        ? 'text-yellow-400'
                        : 'text-denim-200/40'
                  "
                >
                  {{ tr.status !== "Finished" ? `${tr.age}d open` : "Closed" }}
                </p>
              </td>
              <td class="px-3 py-3 text-center">
                <span
                  class="text-[10px] px-2 py-1 rounded-full font-bold"
                  :class="opColor(tr.operation)"
                  >{{ tr.operation }}</span
                >
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-5 h-5 rounded-full bg-denim-600 flex items-center justify-center text-[9px] font-bold text-denim-200 shrink-0"
                  >
                    {{
                      tr.reporter
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    }}
                  </div>
                  <span
                    class="text-xs text-denim-100/70 truncate max-w-[90px]"
                    >{{ tr.reporter }}</span
                  >
                </div>
              </td>
              <td class="px-3 py-3">
                <span
                  v-if="tr.woId"
                  class="text-[10px] font-mono text-caramel/80"
                  >{{ tr.woId }}</span
                >
                <span v-else class="text-[10px] text-denim-200/25">—</span>
              </td>
              <td class="px-3 py-3 text-center">
                <div
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  :class="statusBadge(tr.status)"
                >
                  <span
                    v-if="tr.status === 'Alert'"
                    class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                  />
                  {{ statusLabel(tr.status) }}
                </div>
              </td>
              <td class="px-3 py-3 text-center">
                <button
                  v-if="canAck(tr)"
                  class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  :class="ackStyle(tr)"
                  @click="openAckModal(tr)"
                >
                  {{ ackLabel(tr) }}
                </button>
                <span v-else class="text-[10px] text-denim-200/20">—</span>
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/40 hover:text-white transition-colors"
                    @click="openHistory(tr)"
                  >
                    <IconClock :size="12" />
                  </button>
                  <button
                    v-if="canScheduleWO(tr)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-caramel/15 text-denim-200/40 hover:text-caramel"
                    @click="openScheduleWO(tr)"
                  >
                    <IconCalendar :size="12" />
                  </button>
                  <button
                    v-if="tr.status !== 'Finished'"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/40 hover:text-white"
                    @click="openEdit(tr)"
                  >
                    <IconPencil :size="12" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!trLoading && !displayedTroubles.length">
              <td colspan="10" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-14 h-14 rounded-2xl bg-denim-700/30 flex items-center justify-center"
                  >
                    <IconAlertTriangle :size="24" class="text-denim-200/20" />
                  </div>
                  <p class="text-denim-200/30 text-sm">
                    {{ t("trouble.noTrouble") }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        class="flex items-center justify-between px-4 py-3 border-t border-denim-700/30"
      >
        <p class="text-xs text-denim-200/40">
          {{ displayedTroubles.length }} / {{ filteredTroubles.length }}
        </p>
        <div class="flex gap-1">
          <button
            class="px-3 py-1 text-xs rounded-lg hover:bg-denim-700/40 text-denim-200/50 disabled:opacity-30"
            :disabled="page === 1"
            @click="page--"
          >
            ← Prev
          </button>
          <span class="px-3 py-1 text-xs text-denim-200/50"
            >{{ page }} / {{ totalPages }}</span
          >
          <button
            class="px-3 py-1 text-xs rounded-lg hover:bg-denim-700/40 text-denim-200/50 disabled:opacity-30"
            :disabled="page >= totalPages"
            @click="page++"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCreate"
          class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
          @click.self="showCreate = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-2xl"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center"
                >
                  <IconAlertTriangle :size="16" class="text-red-400" />
                </div>
                <div>
                  <h3 class="font-bold text-white">
                    {{ t("trouble.report") }}
                  </h3>
                  <p class="text-xs text-denim-200/50">
                    Create a new trouble report
                  </p>
                </div>
              </div>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showCreate = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <!-- Equipment search -->
              <div>
                <label class="label"
                  >{{ t("trouble.equipment") }}
                  <span class="text-red-400">*</span></label
                >
                <input
                  v-model="createForm.equipmentSearch"
                  class="input"
                  :placeholder="
                    t('common.search') + ' equipment code or name...'
                  "
                  @input="searchEquipment"
                />
                <div
                  v-if="eqResults.length"
                  class="mt-1 bg-denim-900 border border-denim-600/40 rounded-lg overflow-hidden max-h-40 overflow-y-auto"
                >
                  <button
                    v-for="eq in eqResults"
                    :key="eq.id"
                    class="w-full text-left px-3 py-2 hover:bg-denim-700/40 transition-colors"
                    @click="selectEquipment(eq)"
                  >
                    <p class="text-xs font-mono text-caramel">{{ eq.code }}</p>
                    <p class="text-xs text-denim-200/60">{{ eq.name }}</p>
                  </button>
                </div>
                <p
                  v-if="createForm.selectedEquipment"
                  class="mt-1.5 text-xs text-green-400 font-mono"
                >
                  ✓ {{ createForm.selectedEquipment.code }} —
                  {{ createForm.selectedEquipment.name }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >{{ t("trouble.operation") }}
                    <span class="text-red-400">*</span></label
                  >
                  <select v-model="createForm.operation" class="input">
                    <option value="">Select</option>
                    <option>Down</option>
                    <option>Standby</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label class="label"
                    >Trouble Name <span class="text-red-400">*</span></label
                  >
                  <input
                    v-model="createForm.name"
                    class="input"
                    placeholder="e.g. Compressor Failure"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >{{ t("common.date") }}
                    <span class="text-red-400">*</span></label
                  >
                  <input v-model="createForm.date" type="date" class="input" />
                </div>
                <div>
                  <label class="label"
                    >{{ t("trouble.severity") }}
                    <span class="text-red-400">*</span></label
                  >
                  <select v-model="createForm.severity" class="input">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label"
                  >{{ t("trouble.condition") }}
                  <span class="text-red-400">*</span></label
                >
                <textarea
                  v-model="createForm.condition"
                  class="input resize-none"
                  rows="2"
                  :placeholder="t('trouble.condition') + '...'"
                />
              </div>
              <div>
                <label class="label"
                  >{{ t("trouble.impact") }}
                  <span class="text-red-400">*</span></label
                >
                <textarea
                  v-model="createForm.impact"
                  class="input resize-none"
                  rows="2"
                  :placeholder="t('trouble.impact') + '...'"
                />
              </div>
              <div>
                <label class="label"
                  >{{ t("trouble.earlyAction") }}
                  <span class="text-red-400">*</span></label
                >
                <textarea
                  v-model="createForm.earlyAction"
                  class="input resize-none"
                  rows="2"
                  :placeholder="t('trouble.earlyAction') + '...'"
                />
              </div>
              <div>
                <label class="label"
                  >{{ t("trouble.chronology") }}
                  <span class="text-red-400">*</span></label
                >
                <textarea
                  v-model="createForm.chronology"
                  class="input resize-none"
                  rows="3"
                  :placeholder="t('trouble.chronology') + '...'"
                />
              </div>
              <div>
                <label class="label">{{ t("trouble.attachments") }}</label>
                <div
                  class="border-2 border-dashed border-denim-600/40 rounded-xl p-5 text-center hover:border-caramel/40 transition-colors cursor-pointer"
                  @click="triggerFileInput"
                >
                  <p class="text-xs text-denim-200/40">
                    Click to upload images
                  </p>
                  <p class="text-[10px] text-denim-200/25 mt-1">
                    Multiple images supported
                  </p>
                </div>
                <input
                  id="trouble-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="onAttachFiles"
                />
                <div
                  v-if="createForm.attachments.length"
                  class="flex flex-wrap gap-2 mt-2"
                >
                  <div
                    v-for="(att, i) in createForm.attachments"
                    :key="i"
                    class="flex items-center gap-1.5 bg-denim-700/40 rounded-lg px-2 py-1 text-xs"
                  >
                    <span class="text-denim-100/70 max-w-[100px] truncate">{{
                      att.name
                    }}</span>
                    <button
                      class="text-denim-200/40 hover:text-red-400"
                      @click.stop="createForm.attachments.splice(i, 1)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2 rounded-b-2xl"
            >
              <button class="btn-secondary" @click="showCreate = false">
                {{ t("common.cancel") }}
              </button>
              <button
                class="btn-danger gap-2"
                @click="submitTrouble"
                :disabled="!createFormValid || submitting"
              >
                <svg
                  v-if="submitting"
                  class="animate-spin w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {{ submitting ? t("common.loading") : t("common.submit") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ACK Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAck"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showAck = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div class="px-6 py-5 border-b border-denim-700/40">
              <h3 class="font-bold text-white text-base">{{ ackTitle }}</h3>
              <p class="text-xs font-mono text-denim-200/50 mt-1">
                {{ ackTrouble?.code || ackTrouble?.id }} ·
                {{ ackTrouble?.equipmentId }}
              </p>
            </div>
            <div class="px-6 py-4 space-y-4">
              <div class="bg-denim-900/50 rounded-xl p-4 space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-denim-200/50">Trouble</span
                  ><span class="text-white font-medium">{{
                    ackTrouble?.name
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-denim-200/50">Reporter</span
                  ><span class="text-white">{{ ackTrouble?.reporter }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-denim-200/50">Days Open</span>
                  <span
                    class="font-bold"
                    :class="
                      (ackTrouble?.age ?? 0) > 7
                        ? 'text-red-400'
                        : 'text-yellow-300'
                    "
                    >{{ ackTrouble?.age }} days</span
                  >
                </div>
              </div>
              <div class="flex items-center gap-2 text-[11px]">
                <span
                  class="px-2 py-1 rounded-full font-bold"
                  :class="statusBadge(ackTrouble?.status ?? '')"
                  >{{ statusLabel(ackTrouble?.status ?? "") }}</span
                >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-denim-200/30"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span
                  class="px-2 py-1 rounded-full font-bold"
                  :class="statusBadge(nextStatus(ackTrouble?.status ?? ''))"
                  >{{ statusLabel(nextStatus(ackTrouble?.status ?? "")) }}</span
                >
              </div>
              <div>
                <label class="label">{{ t("common.note") }}</label>
                <textarea
                  v-model="ackNote"
                  class="input resize-none"
                  rows="2"
                  :placeholder="t('common.note') + '...'"
                />
              </div>
            </div>
            <div class="px-6 pb-5 flex gap-2">
              <button
                class="btn-secondary flex-1 justify-center"
                @click="showAck = false"
              >
                {{ t("common.cancel") }}
              </button>
              <button
                class="btn-primary flex-1 justify-center"
                @click="approveAck"
              >
                {{ t("trouble.approve") }} →
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Progress History Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showHistory"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showHistory = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40"
            >
              <h3 class="font-bold text-white">Progress History</h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showHistory = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-4">
              <div
                v-if="!historyTrouble?.timeline?.length"
                class="py-8 text-center text-xs text-denim-200/30"
              >
                {{ t("common.noData") }}
              </div>
              <div v-else class="relative pl-5">
                <div
                  class="absolute left-1.5 top-2 bottom-2 w-px bg-denim-600/40"
                />
                <div
                  v-for="(ev, i) in historyTrouble?.timeline"
                  :key="i"
                  class="relative mb-4 last:mb-0"
                >
                  <div
                    class="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-denim-800"
                    :class="ev.color"
                  />
                  <p class="text-xs font-semibold text-white">{{ ev.label }}</p>
                  <p class="text-[10px] text-denim-200/50 mt-0.5">
                    {{ ev.date }} · {{ ev.by }}
                  </p>
                  <p
                    v-if="ev.note"
                    class="text-[10px] text-denim-200/40 mt-0.5 italic"
                  >
                    {{ ev.note }}
                  </p>
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
import { ref, computed, onMounted } from "vue";
import {
  IconPlus,
  IconAlertTriangle,
  IconClock,
  IconCalendar,
  IconPencil,
} from "@/components/icons";
import { ShieldAlert, Clock4, CheckCircle, Flag } from "lucide-vue-next";
import { useTrouble } from "@/composables/useTrouble";
import { useEquipment } from "@/composables/useEquipment";
import { useSSE } from "@/composables/useSSE";
import { useI18n } from "@/i18n";
import { uploadImages } from "@/utils/upload";
import { compressImage } from "@/utils/imageCompress";
import type { TroubleStatus } from "@/types";

const { t } = useI18n();

// ── Types ──────────────────────────────────────────────────────
type TroubleView = {
  id: string;
  code: string;
  equipmentId: string;
  equipmentType: string;
  name: string;
  date: string;
  age: number;
  operation: string;
  reporter: string;
  status: "Alert" | "Open-Pending" | "Open-WO-Done" | "Finished";
  _apiStatus: TroubleStatus;
  woId: string | null;
  woStatus: string | null;
  timeline: any[];
};

// ── Composables ────────────────────────────────────────────────
const {
  items: trItems,
  loading: trLoading,
  error: trError,
  fetch: fetchTrouble,
  create: createTrouble,
} = useTrouble();

const { items: eqItems, fetch: fetchEqSearch } = useEquipment();

onMounted(() => fetchTrouble());

const { subscribe } = useSSE();
subscribe("trouble:status", () => fetchTrouble());
subscribe("trouble:created", () => fetchTrouble());

// ── Troubles from API ──────────────────────────────────────────
const STATUS_MAP: Record<TroubleStatus, TroubleView["status"]> = {
  OPEN: "Alert",
  ACKNOWLEDGED: "Open-Pending",
  IN_PROGRESS: "Open-Pending",
  RESOLVED: "Open-WO-Done",
  CLOSED: "Finished",
  REJECTED: "Finished",
};

const troubles = computed<TroubleView[]>(() =>
  trItems.value.map((t) => {
    const rep = (t as any).reportedBy;
    return {
      id: t.id,
      code: t.code,
      equipmentId: (t as any).equipment?.code ?? t.equipmentId,
      equipmentType: (t as any).equipment?.name ?? "—",
      name: t.title,
      date: t.createdAt.slice(0, 10),
      age: Math.floor(
        (Date.now() - new Date(t.createdAt).getTime()) / 86400000,
      ),
      operation:
        t.status === "OPEN" || t.status === "ACKNOWLEDGED"
          ? "Down"
          : t.status === "IN_PROGRESS"
            ? "Standby"
            : "Operations",
      reporter: rep ? `${rep.firstName} ${rep.lastName}` : "—",
      status: STATUS_MAP[t.status] ?? "Alert",
      _apiStatus: t.status,
      woId: null,
      woStatus: null,
      timeline:
        (t as any).statusHistory?.map((h: any) => ({
          label: h.toStatus,
          color: "bg-blue-400",
          date: new Date(h.createdAt).toLocaleString("id-ID"),
          by: "System",
          note: h.reason ?? "",
        })) ?? [],
    };
  }),
);

// ── Filters / pagination ───────────────────────────────────────
const activeStatusFilter = ref("");
const page = ref(1);
const PER_PAGE = 8;

function toggleStatusFilter(key: string) {
  activeStatusFilter.value = activeStatusFilter.value === key ? "" : key;
  page.value = 1;
}

const filteredTroubles = computed(() =>
  activeStatusFilter.value
    ? troubles.value.filter((t) => t.status === activeStatusFilter.value)
    : troubles.value,
);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTroubles.value.length / PER_PAGE)),
);
const displayedTroubles = computed(() =>
  filteredTroubles.value.slice(
    (page.value - 1) * PER_PAGE,
    page.value * PER_PAGE,
  ),
);

// ── KPIs ──────────────────────────────────────────────────────
const kpis = computed(() => [
  {
    label: "Alert",
    statusKey: "Alert",
    value: troubles.value.filter((t) => t.status === "Alert").length,
    color: "text-red-400",
    iconBg: "bg-red-500/10 text-red-400",
    ring: "border border-red-500/15",
    activeBg: "bg-red-500/10",
    icon: ShieldAlert,
    pulse: true,
    dotColor: "bg-red-400",
  },
  {
    label: "Open · Pending",
    statusKey: "Open-Pending",
    value: troubles.value.filter((t) => t.status === "Open-Pending").length,
    color: "text-yellow-300",
    iconBg: "bg-yellow-500/10",
    ring: "border border-yellow-500/15",
    activeBg: "bg-yellow-500/10",
    icon: Clock4,
    pulse: false,
    dotColor: "",
  },
  {
    label: "Open · WO Done",
    statusKey: "Open-WO-Done",
    value: troubles.value.filter((t) => t.status === "Open-WO-Done").length,
    color: "text-green-300",
    iconBg: "bg-green-500/10",
    ring: "border border-green-500/15",
    activeBg: "bg-green-500/10",
    icon: CheckCircle,
    pulse: false,
    dotColor: "",
  },
  {
    label: "Finished",
    statusKey: "Finished",
    value: troubles.value.filter((t) => t.status === "Finished").length,
    color: "text-denim-200/60",
    iconBg: "bg-denim-600/30",
    ring: "border border-denim-600/20",
    activeBg: "bg-denim-600/20",
    icon: Flag,
    pulse: false,
    dotColor: "",
  },
]);

// ── Helpers ────────────────────────────────────────────────────
function opColor(op: string) {
  return op === "Down"
    ? "bg-red-500/20 text-red-400"
    : op === "Standby"
      ? "bg-yellow-500/20 text-yellow-300"
      : "bg-green-500/20 text-green-400";
}
function statusBadge(s: string) {
  if (s === "Alert")
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  if (s === "Open-Pending")
    return "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30";
  if (s === "Open-WO-Done")
    return "bg-green-400/20 text-green-300 border border-green-400/30";
  return "bg-denim-600/40 text-denim-200/60 border border-denim-600/30";
}
function statusLabel(s: string) {
  if (s === "Alert") return "Alert";
  if (s === "Open-Pending") return "Open · Pending";
  if (s === "Open-WO-Done") return "Open · WO Done";
  if (s === "Finished") return "Finished";
  return s ?? "";
}
function nextStatus(s: string) {
  if (s === "Alert") return "Open-Pending";
  if (s === "Open-Pending") return "Open-WO-Done";
  return "Finished";
}
function canAck(t: TroubleView) {
  return t.status === "Alert";
}
function canScheduleWO(t: TroubleView) {
  return t.status === "Open-Pending" && !t.woId;
}
function ackLabel(t: TroubleView) {
  return t.status === "Alert" ? "Approve" : "ACK";
}
function ackStyle(t: TroubleView) {
  return t.status === "Alert"
    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
    : "bg-denim-600/50 text-denim-200";
}

// ── ACK ────────────────────────────────────────────────────────
const showAck = ref(false);
const ackTrouble = ref<TroubleView | null>(null);
const ackNote = ref("");
const ackTitle = computed(() =>
  ackTrouble.value?.status === "Alert"
    ? "SPV — Approve Trouble Report"
    : "Acknowledge",
);
function openAckModal(t: TroubleView) {
  ackTrouble.value = t;
  ackNote.value = "";
  showAck.value = true;
}
async function approveAck() {
  showAck.value = false;
  await fetchTrouble();
}

// ── History ────────────────────────────────────────────────────
const showHistory = ref(false);
const historyTrouble = ref<TroubleView | null>(null);
function openHistory(t: TroubleView) {
  historyTrouble.value = t;
  showHistory.value = true;
}

// ── Schedule WO (stub — opens WO create flow) ─────────────────
const showScheduleWO = ref(false);
function openScheduleWO(t: TroubleView) {
  /* TODO: open WO create with trouble linked */
}
function openEdit(t: TroubleView) {
  /* TODO */
}

// ── Equipment search for create form ──────────────────────────
const eqResults = ref<any[]>([]);
let eqSearchTimer: any = null;
function searchEquipment() {
  clearTimeout(eqSearchTimer);
  const q = createForm.value.equipmentSearch.trim();
  if (q.length < 2) {
    eqResults.value = [];
    return;
  }
  eqSearchTimer = setTimeout(async () => {
    await fetchEqSearch({ search: q, limit: 8 });
    eqResults.value = eqItems.value.slice(0, 8);
  }, 300);
}
function selectEquipment(eq: any) {
  createForm.value.selectedEquipment = eq;
  createForm.value.equipmentSearch = eq.code;
  eqResults.value = [];
}

// ── Create Trouble ─────────────────────────────────────────────
const showCreate = ref(false);
const submitting = ref(false);
const photoFiles = ref<File[]>([]);

const createForm = ref({
  equipmentSearch: "",
  selectedEquipment: null as any,
  operation: "",
  name: "",
  date: new Date().toISOString().slice(0, 10),
  severity: "MEDIUM" as string,
  condition: "",
  impact: "",
  earlyAction: "",
  chronology: "",
  attachments: [] as any[],
});

const createFormValid = computed(
  () =>
    !!createForm.value.selectedEquipment &&
    !!createForm.value.operation &&
    !!createForm.value.name &&
    !!createForm.value.condition &&
    !!createForm.value.impact &&
    !!createForm.value.earlyAction &&
    !!createForm.value.chronology,
);

function openCreateModal() {
  createForm.value = {
    equipmentSearch: "",
    selectedEquipment: null,
    operation: "",
    name: "",
    date: new Date().toISOString().slice(0, 10),
    severity: "MEDIUM",
    condition: "",
    impact: "",
    earlyAction: "",
    chronology: "",
    attachments: [],
  };
  photoFiles.value = [];
  eqResults.value = [];
  showCreate.value = true;
}

function onAttachFiles(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  photoFiles.value.push(...files);
  createForm.value.attachments.push(
    ...files.map((f) => ({ name: f.name, size: f.size })),
  );
}
function triggerFileInput() {
  document.getElementById("trouble-file-input")?.click();
}

async function submitTrouble() {
  if (!createFormValid.value || submitting.value) return;
  submitting.value = true;
  try {
    const description = [
      createForm.value.condition,
      createForm.value.impact,
      createForm.value.earlyAction,
      createForm.value.chronology,
    ]
      .filter(Boolean)
      .join("\n\n");
    const created: any = await createTrouble({
      title: createForm.value.name,
      description,
      severity: createForm.value.severity as any,
      equipmentId: createForm.value.selectedEquipment.id,
    });
    if (created?.id && photoFiles.value.length) {
      const base64s = await Promise.all(
        photoFiles.value.map((f) => compressImage(f, 1200)),
      );
      await uploadImages(base64s, "trouble", created.id);
    }
    showCreate.value = false;
    await fetchTrouble();
  } catch (err) {
    console.error(err);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
