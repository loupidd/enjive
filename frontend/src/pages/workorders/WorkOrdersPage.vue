<template>
  <div class="space-y-4">
    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">
          {{ t("nav.workOrders") }}
        </h2>
        <div class="accent-bar mt-1.5" />
      </div>
    </div>

    <!-- ── Pipeline visual (status flow) ───────────────────── -->
    <div class="card p-3 overflow-x-auto scrollbar-thin">
      <div class="flex items-center gap-0 min-w-max">
        <template v-for="(stage, i) in PIPELINE" :key="stage.key">
          <button
            class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-150 min-w-[80px]"
            :class="
              activeStageFilter === stage.key
                ? 'bg-caramel/15 ring-1 ring-caramel/40'
                : 'hover:bg-denim-700/30'
            "
            @click="toggleStageFilter(stage.key)"
          >
            <span class="text-lg font-bold" :class="stage.color">{{
              stageCounts[stage.key] || 0
            }}</span>
            <span
              class="text-[10px] text-denim-200/50 text-center leading-tight whitespace-nowrap"
              >{{ stage.label }}</span
            >
          </button>
          <div
            v-if="i < PIPELINE.length - 1"
            class="flex items-center text-denim-600/40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Collapsible Filters ───────────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-denim-700/10 transition-colors"
        @click="showFilters = !showFilters"
      >
        <div class="flex items-center gap-2">
          <IconFilter :size="13" class="text-caramel/60" />
          <span
            class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
            >{{ t("common.filter") }}</span
          >
          <span
            v-if="activeFilterCount > 0"
            class="text-[10px] bg-caramel/20 text-caramel px-1.5 py-0.5 rounded-full font-bold"
            >{{ activeFilterCount }} active</span
          >
        </div>
        <IconChevronDown
          :size="14"
          class="text-denim-200/35 transition-transform duration-200"
          :class="showFilters ? 'rotate-180' : ''"
        />
      </button>
      <Transition name="collapse">
        <div
          v-if="showFilters"
          class="border-t border-denim-700/30 px-4 pb-4 pt-3"
        >
          <div
            class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 w-full"
          >
            <div class="col-span-1">
              <label class="label">{{ t("workOrder.startDate") }}</label>
              <input
                v-model="filters.startDate"
                type="date"
                class="input text-xs"
              />
            </div>
            <div class="col-span-1">
              <label class="label">{{ t("workOrder.endDate") }}</label>
              <input
                v-model="filters.endDate"
                type="date"
                class="input text-xs"
              />
            </div>
            <div>
              <label class="label">Equipment Type</label>
              <select v-model="filters.equipmentType" class="input text-xs">
                <option value="">All</option>
                <option v-for="t in EQ_TYPES" :key="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ t("common.status") }}</label>
              <select v-model="filters.status" class="input text-xs">
                <option value="">All</option>
                <option v-for="s in STATUSES" :key="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="label">Interval</label>
              <select v-model="filters.interval" class="input text-xs">
                <option value="">All</option>
                <option v-for="iv in INTERVALS" :key="iv">{{ iv }}</option>
              </select>
            </div>
            <div>
              <label class="label">Maint. Type</label>
              <select v-model="filters.maintType" class="input text-xs">
                <option value="">All</option>
                <option>Preventive</option>
                <option>Corrective</option>
                <option>Predictive</option>
                <option>Thermography</option>
              </select>
            </div>
            <div>
              <label class="label">Technician</label>
              <select v-model="filters.technician" class="input text-xs">
                <option value="">All</option>
                <option v-for="t in TECHNICIANS" :key="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="label">Thermo.</label>
              <select v-model="filters.thermographic" class="input text-xs">
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-3">
            <button
              class="btn-secondary text-xs px-4 gap-1.5"
              @click="resetFilters"
            >
              <IconRefresh :size="12" />Reset
            </button>
            <button class="btn-primary text-xs px-4" @click="applyFilters">
              {{ t("common.filter") }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Task Table ───────────────────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
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
                Equipment
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide hidden sm:table-cell"
              >
                Trouble ID
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                Type
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide hidden md:table-cell"
              >
                Interval
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                Start
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide hidden md:table-cell"
              >
                Duration
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide hidden lg:table-cell"
              >
                Technician
              </th>
              <th
                class="px-3 py-3 text-left text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide min-w-[160px]"
              >
                Progress
              </th>
              <th
                class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                ACK
              </th>
              <th
                class="px-3 py-3 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in displayedTasks"
              :key="task.id"
              class="border-b border-denim-700/15 hover:bg-denim-700/10 transition-colors group"
              :class="task.troubleId ? 'bg-orange-500/3' : ''"
            >
              <!-- ID — show WO code like EDA__2026-04-WO-00204 -->
              <td class="px-3 py-2.5">
                <span
                  class="font-mono text-[11px] text-caramel font-semibold"
                  >{{ task.code || task.id }}</span
                >
              </td>

              <!-- Equipment -->
              <td class="px-3 py-2.5">
                <p class="font-mono text-[11px] text-white font-medium">
                  {{ task.equipmentId }}
                </p>
                <p class="text-[10px] text-denim-200/40 mt-0.5">
                  {{ task.equipmentType }}
                </p>
              </td>

              <!-- Trouble ID -->
              <td class="px-3 py-2.5 hidden sm:table-cell">
                <span
                  v-if="task.troubleId"
                  class="font-mono text-[11px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded"
                >
                  {{ task.troubleId }}
                </span>
                <span v-else class="text-denim-200/20 text-xs">—</span>
              </td>

              <!-- Type -->
              <td class="px-3 py-2.5">
                <span
                  class="text-[10px] px-2 py-0.5 rounded font-semibold"
                  :class="typeColor(task.type)"
                  >{{ task.type }}</span
                >
              </td>

              <!-- Interval -->
              <td
                class="px-3 py-2.5 text-xs text-denim-100/60 hidden md:table-cell"
              >
                {{ task.interval }}
              </td>

              <!-- Start Date -->
              <td class="px-3 py-2.5 text-xs text-denim-100/70">
                {{ task.startDate }}
              </td>

              <!-- Duration -->
              <td class="px-3 py-2.5 hidden md:table-cell">
                <span
                  v-if="task.status === 'Finish'"
                  class="text-xs text-green-400 font-medium"
                  >{{ task.duration }}</span
                >
                <span v-else class="text-xs text-denim-200/40"
                  >In progress</span
                >
              </td>

              <!-- Technician -->
              <td class="px-3 py-2.5 hidden lg:table-cell">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-5 h-5 rounded-full bg-denim-600 flex items-center justify-center text-[9px] font-bold text-denim-200 shrink-0"
                  >
                    {{
                      task.technician
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    }}
                  </div>
                  <span
                    class="text-xs text-denim-100/70 truncate max-w-[80px]"
                    >{{ task.technician }}</span
                  >
                </div>
              </td>

              <!-- Progress bar -->
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <div
                    class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="progressColor(task.status)"
                      :style="{ width: progressPct(task.status) + '%' }"
                    />
                  </div>
                  <span
                    class="text-[10px] font-semibold shrink-0"
                    :class="statusTextColor(task.status)"
                  >
                    {{ task.status }}
                  </span>
                </div>
                <div class="flex gap-px mt-1">
                  <div
                    v-for="stage in PIPELINE"
                    :key="stage.key"
                    class="flex-1 h-0.5 rounded-full transition-colors"
                    :class="
                      isStageReached(task.status, stage.key)
                        ? stage.dotColor
                        : 'bg-white/5'
                    "
                  />
                </div>
              </td>

              <!-- ACK Button -->
              <td class="px-3 py-2.5 text-center">
                <div class="relative inline-flex">
                  <button
                    v-if="canAck(task)"
                    class="px-3 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 active:scale-95 relative"
                    :class="ackStyle(task)"
                    @click="openAck(task)"
                  >
                    {{ ackLabel(task) }}
                  </button>
                  <!-- Urgency blink dot — shown when action needed by current user -->
                  <span
                    v-if="canAck(task)"
                    class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-caramel animate-ping"
                  />
                  <span
                    v-if="canAck(task)"
                    class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-caramel"
                  />
                  <span
                    v-if="!canAck(task)"
                    class="text-[10px] text-denim-200/20"
                    >—</span
                  >
                </div>
              </td>

              <!-- Actions -->
              <td class="px-3 py-2.5">
                <div class="flex items-center justify-center gap-1">
                  <!-- VIEW button — always visible, urgent analytics -->
                  <button
                    class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 border"
                    :class="viewBtnStyle(task)"
                    title="View Work Order"
                    @click="
                      router.push({
                        name: 'WorkOrderDetail',
                        params: { id: task.id },
                      })
                    "
                  >
                    <IconExternalLink :size="11" />
                    View
                  </button>
                  <!-- EDIT — only for editable statuses -->
                  <button
                    v-if="canEdit(task)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/40 hover:text-white transition-colors"
                    title="Edit"
                    @click="openEdit(task)"
                  >
                    <IconPencil :size="12" />
                  </button>
                  <!-- PRINT — only Finish -->
                  <button
                    v-if="task.status === 'Finish'"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-500/15 text-green-500/60 hover:text-green-400 transition-colors"
                    title="Print Report"
                    @click="printTask(task)"
                  >
                    <IconPrint :size="12" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!displayedTasks.length">
              <td colspan="11" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1"
                    class="text-denim-200/20"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="11" y2="17" />
                  </svg>
                  <p class="text-denim-200/30 text-sm">No tasks found</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between px-4 py-3 border-t border-denim-700/30"
      >
        <p class="text-xs text-denim-200/40">
          Showing {{ displayedTasks.length }} of
          {{ filteredTasks.length }} tasks
        </p>
        <div class="flex gap-1">
          <button
            class="px-3 py-1 text-xs rounded-lg hover:bg-denim-700/40 text-denim-200/50 transition-colors"
            :disabled="page === 1"
            @click="page--"
          >
            ← Prev
          </button>
          <span class="px-3 py-1 text-xs text-denim-200/50"
            >{{ page }} / {{ totalPages }}</span
          >
          <button
            class="px-3 py-1 text-xs rounded-lg hover:bg-denim-700/40 text-denim-200/50 transition-colors"
            :disabled="page >= totalPages"
            @click="page++"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- ── ACK / Approval Modal ─────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAckModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showAckModal = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div class="px-6 py-5 border-b border-denim-700/40">
              <h3 class="font-bold text-white text-base">
                {{ ackModalTitle }}
              </h3>
              <p class="text-xs text-denim-200/50 mt-1 font-mono">
                {{ ackTask?.code || ackTask?.id }} · {{ ackTask?.equipmentId }}
              </p>
            </div>

            <!-- Task summary -->
            <div class="px-6 py-4 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="bg-denim-900/50 rounded-lg p-3">
                  <p class="text-denim-200/40 mb-0.5">Type</p>
                  <p class="font-semibold" :class="typeColor(ackTask?.type)">
                    {{ ackTask?.type }}
                  </p>
                </div>
                <div class="bg-denim-900/50 rounded-lg p-3">
                  <p class="text-denim-200/40 mb-0.5">Interval</p>
                  <p class="text-white font-semibold">
                    {{ ackTask?.interval }}
                  </p>
                </div>
                <div class="bg-denim-900/50 rounded-lg p-3">
                  <p class="text-denim-200/40 mb-0.5">Technician</p>
                  <p class="text-white font-semibold">
                    {{ ackTask?.technician }}
                  </p>
                </div>
                <div class="bg-denim-900/50 rounded-lg p-3">
                  <p class="text-denim-200/40 mb-0.5">Current Status</p>
                  <p
                    class="font-semibold"
                    :class="statusTextColor(ackTask?.status)"
                  >
                    {{ ackTask?.status }}
                  </p>
                </div>
              </div>

              <!-- Note -->
              <div>
                <label class="label">{{ t("common.note") }}</label>
                <textarea
                  v-model="ackNote"
                  class="input resize-none"
                  rows="3"
                  placeholder="Optional note for this approval..."
                />
              </div>

              <!-- Work report hint for technician -->
              <div
                v-if="ackTask?.status === 'Waiting'"
                class="bg-caramel/5 border border-caramel/20 rounded-lg px-3 py-2.5 text-xs text-caramel/80"
              >
                💡 After approving, you will fill the Work Report for each
                activity in this task.
              </div>
            </div>

            <div class="px-6 pb-5 flex gap-2">
              <button
                class="btn-danger flex-1 justify-center"
                @click="rejectTask"
              >
                ✕ Reject
              </button>
              <button
                class="btn-primary flex-1 justify-center"
                @click="approveTask"
              >
                ✓ {{ ackActionLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Edit Task Modal ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showEditModal = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-lg"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40"
            >
              <div>
                <h3 class="font-bold text-white">Edit Task</h3>
                <p class="text-xs font-mono text-denim-200/50 mt-0.5">
                  {{ editingTask?.code || editingTask?.id }}
                </p>
              </div>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showEditModal = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label">Technician Coordinator</label>
                <select v-model="editForm.technician" class="input">
                  <option v-for="t in TECHNICIANS" :key="t" :value="t">
                    {{ t }}
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Note WO</label>
                <textarea
                  v-model="editForm.note"
                  class="input resize-none"
                  rows="3"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">{{ t("workOrder.startDate") }}</label>
                  <input
                    v-model="editForm.startDate"
                    type="date"
                    class="input"
                  />
                </div>
                <div>
                  <label class="label">Maintenance Type</label>
                  <select v-model="editForm.type" class="input">
                    <option>Preventive</option>
                    <option>Corrective</option>
                    <option>Predictive</option>
                    <option>Thermography Investigation</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="px-6 pb-5 flex justify-end gap-2">
              <button class="btn-secondary" @click="showEditModal = false">
                {{ t("common.cancel") }}
              </button>
              <button class="btn-primary" @click="saveEdit">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
import {
  IconFilter,
  IconChevronDown,
  IconPencil,
  IconPrint,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconRefresh,
  IconExternalLink,
} from "@/components/icons";
import { useWorkOrders } from "@/composables/useWorkOrders";
import { useSSE } from "@/composables/useSSE";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/auth.store";

const { t } = useI18n();

const {
  items: woItems,
  meta: woMeta,
  loading: woLoading,
  error: woError,
  fetch: fetchWOs,
  updateStatus,
} = useWorkOrders();

onMounted(() => fetchWOs());

const _auth = useAuthStore();

const { subscribe } = useSSE();
subscribe("wo:status", () => fetchWOs());
subscribe("wo:created", () => fetchWOs());

// ── Constants ─────────────────────────────────────────────────
const PIPELINE = computed(() => [
  {
    key: "Waiting",
    label: t("workOrder.statuses.Waiting"),
    color: "text-slate-400",
    dotColor: "bg-slate-400",
    bgColor: "bg-slate-400/15",
  },
  {
    key: "Process",
    label: t("workOrder.statuses.Process"),
    color: "text-caramel",
    dotColor: "bg-caramel",
    bgColor: "bg-caramel/15",
  },
  {
    key: "Reporting",
    label: t("workOrder.statuses.Reporting"),
    color: "text-yellow-300",
    dotColor: "bg-yellow-300",
    bgColor: "bg-yellow-300/15",
  },
  {
    key: "Review",
    label: t("workOrder.statuses.Review"),
    color: "text-blue-400",
    dotColor: "bg-blue-400",
    bgColor: "bg-blue-400/15",
  },
  {
    key: "Client Spv Review",
    label: t("workOrder.statuses.Client Spv Review"),
    color: "text-purple-400",
    dotColor: "bg-purple-400",
    bgColor: "bg-purple-400/15",
  },
  {
    key: "Chief Eng Review",
    label: t("workOrder.statuses.Chief Eng Review"),
    color: "text-cyan-400",
    dotColor: "bg-cyan-400",
    bgColor: "bg-cyan-400/15",
  },
  {
    key: "Finish",
    label: t("workOrder.statuses.Finish"),
    color: "text-green-400",
    dotColor: "bg-green-400",
    bgColor: "bg-green-400/15",
  },
  {
    key: "Reject",
    label: t("workOrder.statuses.Reject"),
    color: "text-red-400",
    dotColor: "bg-red-400",
    bgColor: "bg-red-400/15",
  },
]);

const PIPELINE_ORDER = [
  "Waiting",
  "Process",
  "Reporting",
  "Review",
  "Client Spv Review",
  "Chief Eng Review",
  "Finish",
];

const EQ_TYPES = [
  "AC Fasilitas",
  "Genset",
  "Panel Listrik",
  "CCTV",
  "Fire Alarm",
  "Pompa Air",
  "Lift / Elevator",
];
const INTERVALS = [
  "Once",
  "Daily",
  "Weekly",
  "Monthly",
  "Bi-Monthly",
  "3 Monthly",
  "4 Monthly",
  "6 Monthly",
  "Yearly",
  "4 Yearly",
];
const STATUSES = [
  "Waiting",
  "Process",
  "Reporting",
  "Review",
  "Client Spv Review",
  "Chief Eng Review",
  "Finish",
  "Reject",
];
// Technicians loaded from /users API — populated when edit modal opens
const TECHNICIANS = computed(() =>
  woItems.value
    .map((w: any) =>
      w.assignedTo
        ? `${w.assignedTo.firstName} ${w.assignedTo.lastName}`
        : null,
    )
    .filter((v: string | null): v is string => !!v)
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .sort(),
);

// Real user role from auth store
// currentRole defined above

// ── Tasks from API — mapped to the shape the template expects ──
const tasks = computed(() =>
  woItems.value.map((wo) => ({
    id: wo.id,
    code: wo.code,
    equipmentId: (wo as any).equipment?.code ?? wo.equipmentId,
    equipmentType:
      (wo as any).equipment?.name ??
      (wo as any).equipment?.code ??
      wo.equipmentId,
    troubleId: (wo as any).troubleReportId ?? null,
    type:
      wo.type === "PREVENTIVE"
        ? "Preventive"
        : wo.type === "CORRECTIVE"
          ? "Corrective"
          : wo.type === "INSPECTION"
            ? "Predictive"
            : wo.type,
    interval: "Monthly",
    startDate: wo.createdAt?.slice(0, 10) ?? "",
    duration: wo.actualHours ? wo.actualHours + "h" : "",
    technician: (wo as any).assignedTo
      ? `${(wo as any).assignedTo.firstName} ${(wo as any).assignedTo.lastName}`
      : "Unassigned",
    note: wo.description ?? "",
    status:
      wo.status === "DRAFT"
        ? "Waiting"
        : wo.status === "OPEN"
          ? "Waiting"
          : wo.status === "ASSIGNED"
            ? "Process"
            : wo.status === "IN_PROGRESS"
              ? "Process"
              : wo.status === "ON_HOLD"
                ? "Review"
                : wo.status === "COMPLETED"
                  ? "Finish"
                  : wo.status === "CANCELLED"
                    ? "Reject"
                    : wo.status === "CLOSED"
                      ? "Finish"
                      : "Waiting",
    _apiStatus: wo.status,
    noteWO: "",
  })),
);

// ── Filters ───────────────────────────────────────────────────
const filters = ref({
  startDate: "",
  endDate: "",
  equipmentType: "",
  status: "",
  interval: "",
  maintType: "",
  technician: "",
  thermographic: "",
});
const activeFilter = ref({ ...filters.value });
const activeStageFilter = ref("");
const showFilters = ref(false);
const activeFilterCount = computed(
  () => Object.values(activeFilter.value).filter((v) => v).length,
);
const page = ref(1);
const PER_PAGE = 8;

function resetFilters() {
  filters.value = {
    startDate: "",
    endDate: "",
    equipmentType: "",
    status: "",
    interval: "",
    maintType: "",
    technician: "",
    thermographic: "",
  };
  activeFilter.value = { ...filters.value };
  activeStageFilter.value = "";
  page.value = 1;
}
function applyFilters() {
  activeFilter.value = { ...filters.value };
  activeStageFilter.value = "";
  page.value = 1;
}
function toggleStageFilter(key: string) {
  activeStageFilter.value = activeStageFilter.value === key ? "" : key;
  page.value = 1;
}

const filteredTasks = computed(() => {
  return tasks.value.filter((t) => {
    if (activeStageFilter.value && t.status !== activeStageFilter.value)
      return false;
    if (
      activeFilter.value.equipmentType &&
      t.equipmentType !== activeFilter.value.equipmentType
    )
      return false;
    if (activeFilter.value.status && t.status !== activeFilter.value.status)
      return false;
    if (
      activeFilter.value.interval &&
      t.interval !== activeFilter.value.interval
    )
      return false;
    if (activeFilter.value.maintType && t.type !== activeFilter.value.maintType)
      return false;
    if (
      activeFilter.value.technician &&
      t.technician !== activeFilter.value.technician
    )
      return false;
    if (
      activeFilter.value.thermographic === "yes" &&
      t.type !== "Thermography Investigation"
    )
      return false;
    if (
      activeFilter.value.thermographic === "no" &&
      t.type === "Thermography Investigation"
    )
      return false;
    return true;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTasks.value.length / PER_PAGE)),
);
const displayedTasks = computed(() =>
  filteredTasks.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE),
);

// ── KPIs ──────────────────────────────────────────────────────
const kpiFilter = ref("");
const kpis = computed(() => [
  {
    label: "Waiting",
    value: tasks.value.filter((t) => t.status === "Waiting").length,
    color: "text-slate-300",
    border: "border-denim-600/30 bg-denim-800/40",
    key: "Waiting",
    active: kpiFilter.value === "Waiting",
    onClick: () => {
      kpiFilter.value = kpiFilter.value === "Waiting" ? "" : "Waiting";
      page.value = 1;
    },
  },
  {
    label: "Active",
    value: tasks.value.filter((t) =>
      [
        "Process",
        "Reporting",
        "Review",
        "Client Spv Review",
        "Chief Eng Review",
      ].includes(t.status),
    ).length,
    color: "text-caramel",
    border: "border-caramel/20 bg-caramel/5",
    key: "Active",
    active: kpiFilter.value === "Active",
    onClick: () => {
      kpiFilter.value = kpiFilter.value === "Active" ? "" : "Active";
      page.value = 1;
    },
  },
  {
    label: "Finished",
    value: tasks.value.filter((t) => t.status === "Finish").length,
    color: "text-green-400",
    border: "border-green-500/20 bg-green-500/5",
    key: "Finished",
    active: kpiFilter.value === "Finished",
    onClick: () => {
      kpiFilter.value = kpiFilter.value === "Finished" ? "" : "Finished";
      page.value = 1;
    },
  },
  {
    label: "Rejected",
    value: tasks.value.filter((t) => t.status === "Reject").length,
    color: "text-red-400",
    border: "border-red-500/20 bg-red-500/5",
  },
]);

const stageCounts = computed(() => {
  const counts: Record<string, number> = {};
  tasks.value.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });
  return counts;
});

// ── Progress helpers ──────────────────────────────────────────
function progressPct(status: string) {
  const idx = PIPELINE_ORDER.indexOf(status);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / PIPELINE_ORDER.length) * 100);
}
function progressColor(status: string) {
  if (status === "Finish") return "bg-green-500";
  if (status === "Reject") return "bg-red-500";
  if (status === "Waiting") return "bg-slate-500";
  return "bg-caramel";
}
function statusTextColor(status: string) {
  const map: Record<string, string> = {
    Waiting: "text-slate-400",
    Process: "text-caramel",
    Reporting: "text-yellow-300",
    Review: "text-blue-400",
    "Client Spv Review": "text-purple-400",
    "Chief Eng Review": "text-cyan-400",
    Finish: "text-green-400",
    Reject: "text-red-400",
  };
  return map[status] ?? "text-denim-200";
}
function isStageReached(taskStatus: string, stageKey: string) {
  if (taskStatus === "Reject") return stageKey === "Reject";
  const taskIdx = PIPELINE_ORDER.indexOf(taskStatus);
  const stageIdx = PIPELINE_ORDER.indexOf(stageKey);
  return stageIdx <= taskIdx;
}

// ── Type colors ───────────────────────────────────────────────
function typeColor(type: string) {
  if (type === "Preventive") return "bg-blue-500/15 text-blue-300";
  if (type === "Corrective") return "bg-orange-500/15 text-orange-300";
  if (type === "Predictive") return "bg-green-500/15 text-green-300";
  if (type === "Thermography Investigation")
    return "bg-purple-500/15 text-purple-300";
  return "bg-denim-600/40 text-denim-200";
}

// ── ACK logic (role-based) ────────────────────────────────────
function canAck(task: any) {
  if (task.status === "Finish" || task.status === "Reject") return false;
  const role = _auth.user?.role;
  // Full 6-step pipeline role mapping
  if (role === "TECHNICIAN") {
    return task.status === "Waiting" || task.status === "Process";
  }
  if (role === "MANAGER") {
    return [
      "Reporting",
      "Review",
      "Client Spv Review",
      "Chief Eng Review",
    ].includes(task.status);
  }
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return !["Finish", "Reject"].includes(task.status);
  }
  return false;
}
function canEdit(task: any) {
  if (task.status === "Finish" || task.status === "Reject") return false;
  if (_auth.user?.role === "TECHNICIAN" && task.status === "Waiting")
    return true;
  if (
    _auth.user?.role === "MANAGER" &&
    ["Waiting", "Process", "Reporting"].includes(task.status)
  )
    return true;
  if (_auth.user?.role === "ADMIN") return true;
  return false;
}
function ackLabel(task: any) {
  const labels: Record<string, string> = {
    Waiting: "Start Work",
    Process: "Submit Report",
    Reporting: "Lead Tech Review",
    Review: "SPV Approve",
    "Client Spv Review": "Chief SPV Approve",
    "Chief Eng Review": "Final Approve",
  };
  return labels[task.status] ?? "ACK";
}
function ackStyle(task: any) {
  const s = task.status;
  if (s === "Waiting")
    return "bg-caramel text-denim-950 hover:bg-caramel/80 shadow-md shadow-caramel/20";
  if (s === "Process")
    return "bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 border border-yellow-400/30";
  if (s === "Reporting")
    return "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30";
  if (s === "Review")
    return "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30";
  if (s === "Client Spv Review")
    return "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30";
  if (s === "Chief Eng Review")
    return "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30";
  return "bg-denim-600/50 text-denim-200 hover:bg-denim-600";
}
function ackActionLabel() {
  if (!ackTask.value) return "Approve";
  return ackLabel(ackTask.value);
}

// ── ACK Modal ─────────────────────────────────────────────────
const showAckModal = ref(false);
const ackTask = ref<any>(null);
const ackNote = ref("");
const ackModalTitle = computed(() => {
  if (!ackTask.value) return "";
  const titles: Record<string, string> = {
    Waiting: "Approve & Start Task",
    Process: "Submit Technician Report",
    Reporting: "Lead Tech Review",
    Review: "Client SPV Approval",
    "Client Spv Review": "Chief SPV Approval",
    "Chief Eng Review": "Chief Engineer Finalization",
  };
  return titles[ackTask.value.status] ?? "Acknowledge Task";
});

function openAck(task: any) {
  ackTask.value = task;
  ackNote.value = "";
  showAckModal.value = true;
}

async function approveTask() {
  if (!ackTask.value) return;
  // Map display pipeline step → API status that backend accepts
  // The backend WorkOrderStatus enum is the source of truth
  const nextApiStatus: Record<string, string> = {
    Waiting: "ASSIGNED", // tech accepts → assigned
    Process: "IN_PROGRESS", // tech submits report → in progress flagged
    Reporting: "ON_HOLD", // lead reviews → on hold pending spv
    Review: "ON_HOLD", // spv approves → on hold pending chief
    "Client Spv Review": "ON_HOLD", // chief spv approves → on hold pending chief eng
    "Chief Eng Review": "COMPLETED", // chief eng finalizes → completed
  };
  const next = nextApiStatus[ackTask.value.status];
  if (next) {
    try {
      await updateStatus(ackTask.value.id, next, ackNote.value || undefined);
    } catch {
      /* error shown via woError */
    }
    await fetchWOs();
  }
  showAckModal.value = false;
}

async function rejectTask() {
  if (!ackTask.value) return;
  try {
    await updateStatus(
      ackTask.value.id,
      "CANCELLED",
      ackNote.value || undefined,
    );
  } catch {
    /* error shown via woError */
  }
  await fetchWOs();
  showAckModal.value = false;
}

// ── Edit Modal ────────────────────────────────────────────────
const showEditModal = ref(false);
const editingTask = ref<any>(null);
const editForm = ref({ technician: "", note: "", startDate: "", type: "" });

function openEdit(task: any) {
  editingTask.value = task;
  editForm.value = {
    technician: task.technician,
    note: task.note,
    startDate: task.startDate,
    type: task.type,
  };
  showEditModal.value = true;
}
function saveEdit() {
  const idx = tasks.value.findIndex((t) => t.id === editingTask.value.id);
  if (idx >= 0) Object.assign(tasks.value[idx], editForm.value);
  showEditModal.value = false;
}

function viewBtnStyle(task: any) {
  // Highlight based on whether current user has a pending action
  if (canAck(task))
    return "bg-caramel/15 border-caramel/40 text-caramel hover:bg-caramel/25 shadow-sm shadow-caramel/10";
  if (task.status === "Finish")
    return "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20";
  if (task.status === "Reject")
    return "bg-red-500/10 border-red-500/20 text-red-400/70 hover:bg-red-500/15";
  return "bg-denim-700/30 border-denim-600/30 text-denim-200/50 hover:text-white hover:bg-denim-700/60";
}

function printTask(task: any) {
  // Navigate to detail page, it handles printing with the proper PDF layout
  router.push(`/work-orders/${task.id}?print=1`);
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
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 800px;
}
</style>
