<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">{{ t("nav.activities") }}</h2>
        <div class="accent-bar mt-1.5" />
      </div>
    </div>

    <!-- Filter form -->
    <div class="card">
      <p
        class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide mb-3"
      >
        Search Activities
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="label"
            >Equipment Type <span class="text-red-400">*</span></label
          >
          <select v-model="filter.equipmentType" class="input">
            <option value="">Select type</option>
            <option v-for="tp in equipmentTypes" :key="tp" :value="tp">
              {{ tp }}
            </option>
          </select>
        </div>
        <div>
          <label class="label"
            >Maintenance Classification
            <span class="text-red-400">*</span></label
          >
          <select v-model="filter.classification" class="input">
            <option value="">Select</option>
            <option>Preventive</option>
            <option>Corrective</option>
            <option>Predictive</option>
            <option>Thermography Investigation</option>
          </select>
        </div>
        <div>
          <label class="label"
            >Maintenance Interval <span class="text-red-400">*</span></label
          >
          <select v-model="filter.interval" class="input">
            <option value="">Select</option>
            <option>Once</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Bi-Monthly</option>
            <option>3 Monthly</option>
            <option>4 Monthly</option>
            <option>6 Monthly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <button class="btn-secondary text-xs px-4" @click="resetFilter">
          {{ t("common.cancel") }}
        </button>
        <button
          class="btn-primary text-xs px-4"
          @click="applyFilter"
          :disabled="!filterValid"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Activity table -->
    <template v-if="showTable">
      <div class="card p-0 overflow-hidden">
        <div
          class="px-4 py-3 bg-denim-700/30 border-b border-denim-700/40 flex items-center justify-between flex-wrap gap-2"
        >
          <div class="flex gap-6 text-xs">
            <div>
              <span class="text-denim-200/50">Equipment Type</span
              ><span class="mx-2 text-denim-200/30">·</span
              ><span class="text-white font-semibold">{{
                appliedFilter.equipmentType
              }}</span>
            </div>
            <div>
              <span class="text-denim-200/50">Classification</span
              ><span class="mx-2 text-denim-200/30">·</span
              ><span
                class="font-semibold"
                :class="classColor(appliedFilter.classification)"
                >{{ appliedFilter.classification }}</span
              >
            </div>
            <div>
              <span class="text-denim-200/50">Interval</span
              ><span class="mx-2 text-denim-200/30">·</span
              ><span class="text-white font-semibold">{{
                appliedFilter.interval
              }}</span>
            </div>
          </div>
          <button
            class="btn-primary text-xs px-3 py-1.5"
            @click="showAddActivity = true"
          >
            + {{ t("common.add") }}
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[780px]">
            <thead>
              <tr class="border-b border-denim-700/30">
                <th
                  class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide w-10"
                >
                  No
                </th>
                <th
                  class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Activity
                </th>
                <th
                  class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Type
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  {{ t("common.status") }}
                </th>
                <th
                  class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Answer
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Optimum
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Min
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Max
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Unit
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  Sort
                </th>
                <th
                  class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide"
                >
                  {{ t("common.action") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(act, i) in filteredActivities"
                :key="act.id"
                class="border-b border-denim-700/15 hover:bg-denim-700/15 transition-colors"
              >
                <td class="px-4 py-2.5 text-denim-200/40 text-xs">
                  {{ i + 1 }}
                </td>
                <td class="px-4 py-2.5 font-medium text-white">
                  {{ act.name }}
                </td>
                <td class="px-4 py-2.5">
                  <span
                    class="text-xs px-2 py-0.5 rounded font-medium"
                    :class="actTypeColor(act.type)"
                    >{{ act.type }}</span
                  >
                </td>
                <td class="px-4 py-2.5 text-center">
                  <button
                    class="text-xs px-2 py-0.5 rounded font-bold transition-colors"
                    :class="
                      act.status === 'Enable'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-denim-600/40 text-denim-200/50'
                    "
                    @click="toggleStatus(act)"
                  >
                    {{ act.status }}
                  </button>
                </td>
                <td class="px-4 py-2.5 text-denim-100/70 text-sm">
                  {{ act.answerType }}
                </td>
                <td class="px-4 py-2.5 text-center text-denim-100/60 text-xs">
                  {{ act.optimum || "—" }}
                </td>
                <td class="px-4 py-2.5 text-center text-denim-100/60 text-xs">
                  {{ act.min || "—" }}
                </td>
                <td class="px-4 py-2.5 text-center text-denim-100/60 text-xs">
                  {{ act.max || "—" }}
                </td>
                <td
                  class="px-4 py-2.5 text-center text-caramel/80 text-xs font-medium"
                >
                  {{ act.unit || "—" }}
                </td>
                <td class="px-4 py-2.5 text-center text-denim-200/40 text-xs">
                  {{ act.sort }}
                </td>
                <td class="px-4 py-2.5 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/50 hover:text-white"
                      @click="editActivity(act)"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                      </svg>
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-denim-200/50 hover:text-red-400"
                      @click="deleteActivity(act.id)"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredActivities.length">
                <td colspan="11" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div
                      class="w-12 h-12 rounded-2xl bg-denim-700/30 flex items-center justify-center"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="text-denim-200/20"
                      >
                        <path
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p class="text-denim-200/40 text-sm">
                      {{ t("common.noData") }}
                    </p>
                    <button
                      class="btn-primary text-xs px-4"
                      @click="showAddActivity = true"
                    >
                      + {{ t("common.add") }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddActivity"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeActivityModal"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-lg"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40"
            >
              <div>
                <h3 class="font-bold text-white">
                  {{
                    editingActivity ? t("common.edit") : t("common.add")
                  }}
                  Activity
                </h3>
                <p class="text-xs text-denim-200/50 mt-0.5">
                  {{ appliedFilter.equipmentType }} ·
                  {{ appliedFilter.classification }} ·
                  {{ appliedFilter.interval }}
                </p>
              </div>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="closeActivityModal"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label"
                  >Activity Name <span class="text-red-400">*</span></label
                >
                <input
                  v-model="actForm.name"
                  class="input"
                  placeholder="e.g. Cleaning Filter"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >Type <span class="text-red-400">*</span></label
                  >
                  <select v-model="actForm.type" class="input">
                    <option value="">Select</option>
                    <option v-for="tp in ACTIVITY_TYPES" :key="tp" :value="tp">
                      {{ tp }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="label"
                    >Answer Type <span class="text-red-400">*</span></label
                  >
                  <select
                    v-model="actForm.answerType"
                    class="input"
                    @change="
                      actForm.unit = '';
                      actForm.optimum = '';
                      actForm.min = '';
                      actForm.max = '';
                    "
                  >
                    <option value="">Select</option>
                    <option>Qualitative</option>
                    <option>Quantitative</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">Unit</label>
                <input
                  v-model="actForm.unit"
                  class="input"
                  :placeholder="
                    actForm.answerType === 'Quantitative'
                      ? 'e.g. °C, PSI'
                      : 'e.g. Bersih, Baik'
                  "
                />
              </div>
              <div
                v-if="actForm.answerType === 'Quantitative'"
                class="grid grid-cols-3 gap-3"
              >
                <div>
                  <label class="label">Optimum</label
                  ><input
                    v-model="actForm.optimum"
                    class="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="label">Min</label
                  ><input v-model="actForm.min" class="input" placeholder="0" />
                </div>
                <div>
                  <label class="label">Max</label
                  ><input v-model="actForm.max" class="input" placeholder="0" />
                </div>
              </div>
              <div>
                <label class="label">Sort</label>
                <input
                  v-model.number="actForm.sort"
                  type="number"
                  class="input w-28"
                  placeholder="1"
                />
              </div>
            </div>
            <div class="px-6 pb-5 flex justify-end gap-2">
              <button class="btn-secondary" @click="closeActivityModal">
                {{ t("common.cancel") }}
              </button>
              <button
                class="btn-primary"
                @click="submitActivity"
                :disabled="!actFormValid"
              >
                {{ editingActivity ? t("common.save") : t("common.add") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "@/i18n";
import { useActivities } from "@/composables/useActivities";
import { useEquipment } from "@/composables/useEquipment";

const { t } = useI18n();
const { fetch: fetchActivities } = useActivities();
const { items: eqItems, fetchAll } = useEquipment();
onMounted(() => {
  fetchActivities({ limit: 50 });
  fetchAll();
});

const ACTIVITY_TYPES = [
  "Addition",
  "Adjustment",
  "Cleaning",
  "Function Test",
  "Measurement",
  "Others",
  "Replacement",
  "Thermographic Investigation",
  "Visual",
];

// Derive equipment types from real equipment data
const equipmentTypes = computed(() => {
  const cats = new Set(eqItems.value.map((e) => e.category).filter(Boolean));
  return Array.from(cats).sort() as string[];
});

// ── Filter ─────────────────────────────────────────────────────
const filter = ref({ equipmentType: "", classification: "", interval: "" });
const appliedFilter = ref({
  equipmentType: "",
  classification: "",
  interval: "",
});
const showTable = ref(false);
const filterValid = computed(
  () =>
    filter.value.equipmentType &&
    filter.value.classification &&
    filter.value.interval,
);

function applyFilter() {
  appliedFilter.value = { ...filter.value };
  showTable.value = true;
}
function resetFilter() {
  filter.value = { equipmentType: "", classification: "", interval: "" };
  showTable.value = false;
}

// ── Local activity templates ───────────────────────────────────
// These define PM checklists per equipment type/classification/interval.
// In future: persisted to /activities API with a "template" flag.
const allActivities = ref<any[]>([]);

const filteredActivities = computed(() =>
  allActivities.value
    .filter(
      (a) =>
        a.equipmentType === appliedFilter.value.equipmentType &&
        a.classification === appliedFilter.value.classification &&
        a.interval === appliedFilter.value.interval,
    )
    .sort((a, b) => a.sort - b.sort),
);

// ── Activity Modal ─────────────────────────────────────────────
const showAddActivity = ref(false);
const editingActivity = ref<any>(null);
const actForm = ref({
  name: "",
  type: "",
  answerType: "",
  unit: "",
  optimum: "",
  min: "",
  max: "",
  sort: 1,
});
const actFormValid = computed(
  () => actForm.value.name && actForm.value.type && actForm.value.answerType,
);

function editActivity(act: any) {
  editingActivity.value = act;
  actForm.value = {
    name: act.name,
    type: act.type,
    answerType: act.answerType,
    unit: act.unit,
    optimum: act.optimum,
    min: act.min,
    max: act.max,
    sort: act.sort,
  };
  showAddActivity.value = true;
}
function closeActivityModal() {
  showAddActivity.value = false;
  editingActivity.value = null;
  actForm.value = {
    name: "",
    type: "",
    answerType: "",
    unit: "",
    optimum: "",
    min: "",
    max: "",
    sort: 1,
  };
}
function submitActivity() {
  if (!actFormValid.value) return;
  if (editingActivity.value) {
    const idx = allActivities.value.findIndex(
      (a) => a.id === editingActivity.value.id,
    );
    if (idx >= 0)
      allActivities.value[idx] = {
        ...allActivities.value[idx],
        ...actForm.value,
      };
  } else {
    allActivities.value.push({
      id: Date.now(),
      equipmentType: appliedFilter.value.equipmentType,
      classification: appliedFilter.value.classification,
      interval: appliedFilter.value.interval,
      ...actForm.value,
      status: "Enable",
    });
  }
  closeActivityModal();
}
function toggleStatus(act: any) {
  act.status = act.status === "Enable" ? "Disable" : "Enable";
}
function deleteActivity(id: number) {
  if (confirm("Delete this activity?"))
    allActivities.value = allActivities.value.filter((a) => a.id !== id);
}

// ── Colors ─────────────────────────────────────────────────────
function classColor(c: string) {
  return c === "Preventive"
    ? "text-blue-400"
    : c === "Corrective"
      ? "text-green-400"
      : c === "Predictive"
        ? "text-orange-400"
        : "text-purple-400";
}
function actTypeColor(tp: string) {
  const m: Record<string, string> = {
    Cleaning: "bg-blue-500/15 text-blue-300",
    Measurement: "bg-yellow-500/15 text-yellow-300",
    Visual: "bg-cyan-500/15 text-cyan-300",
    "Function Test": "bg-green-500/15 text-green-300",
    Replacement: "bg-red-500/15 text-red-300",
    "Thermographic Investigation": "bg-purple-500/15 text-purple-300",
    Adjustment: "bg-orange-500/15 text-orange-300",
    Addition: "bg-teal-500/15 text-teal-300",
    Others: "bg-denim-600/40 text-denim-200/60",
  };
  return m[tp] ?? "bg-denim-600/40 text-denim-200/60";
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
