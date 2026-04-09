<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div><h2 class="text-xl font-bold text-white">Activity</h2><div class="accent-bar mt-1.5"/></div>
    </div>

    <!-- ── STEP 1: Filter form (always visible) ─────────────── -->
    <div class="card">
      <p class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide mb-3">Search Activities</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="label">Equipment Type <span class="text-red-400">*</span></label>
          <select v-model="filter.equipmentType" class="input" @change="filter.activityId=''">
            <option value="">Select type</option>
            <option v-for="t in equipmentTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="label">Maintenance Classification <span class="text-red-400">*</span></label>
          <select v-model="filter.classification" class="input">
            <option value="">Select</option>
            <option>Preventive</option>
            <option>Corrective</option>
            <option>Predictive</option>
            <option>Thermography Investigation</option>
          </select>
        </div>
        <div>
          <label class="label">Maintenance Interval <span class="text-red-400">*</span></label>
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
            <option>4 Yearly</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <button class="btn-secondary text-xs px-4" @click="resetFilter">Cancel</button>
        <button class="btn-primary text-xs px-4" @click="applyFilter" :disabled="!filterValid">
          Next →
        </button>
      </div>
    </div>

    <!-- ── STEP 2: Activity table (shown after filter applied) ── -->
    <template v-if="showTable">
      <!-- Context info card -->
      <div class="card p-0 overflow-hidden">
        <div class="px-4 py-3 bg-denim-700/30 border-b border-denim-700/40 flex items-center justify-between flex-wrap gap-2">
          <div class="flex gap-6 text-xs">
            <div><span class="text-denim-200/50">Equipment Type</span><span class="mx-2 text-denim-200/30">·</span><span class="text-white font-semibold">{{ appliedFilter.equipmentType }}</span></div>
            <div><span class="text-denim-200/50">Classification</span><span class="mx-2 text-denim-200/30">·</span><span class="font-semibold" :class="classColor(appliedFilter.classification)">{{ appliedFilter.classification }}</span></div>
            <div><span class="text-denim-200/50">Interval</span><span class="mx-2 text-denim-200/30">·</span><span class="text-white font-semibold">{{ appliedFilter.interval }}</span></div>
          </div>
          <button class="btn-primary text-xs px-3 py-1.5" @click="showAddActivity=true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Activity
          </button>
        </div>

        <!-- Activity table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[780px]">
            <thead>
              <tr class="border-b border-denim-700/30">
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide w-10">No</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Activity</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Type</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Status</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Answer Type</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Optimum</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Min</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Max</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Unit</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Sort</th>
                <th class="px-4 py-2.5 text-center text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(act, i) in filteredActivities"
                :key="act.id"
                class="border-b border-denim-700/15 hover:bg-denim-700/15 transition-colors"
              >
                <td class="px-4 py-2.5 text-denim-200/40 text-xs">{{ i + 1 }}</td>
                <td class="px-4 py-2.5 font-medium text-white">{{ act.name }}</td>
                <td class="px-4 py-2.5">
                  <span class="text-xs px-2 py-0.5 rounded font-medium" :class="actTypeColor(act.type)">{{ act.type }}</span>
                </td>
                <td class="px-4 py-2.5 text-center">
                  <button
                    class="text-xs px-2 py-0.5 rounded font-bold transition-colors"
                    :class="act.status==='Enable'?'bg-green-500/15 text-green-400 hover:bg-green-500/25':'bg-denim-600/40 text-denim-200/50 hover:bg-denim-600/60'"
                    @click="toggleStatus(act)"
                  >{{ act.status }}</button>
                </td>
                <td class="px-4 py-2.5 text-denim-100/70 text-sm">{{ act.answerType }}</td>
                <td class="px-4 py-2.5 text-center text-denim-100/60 text-xs">{{ act.optimum || "—" }}</td>
                <td class="px-4 py-2.5 text-center text-denim-100/60 text-xs">{{ act.min || "—" }}</td>
                <td class="px-4 py-2.5 text-center text-denim-100/60 text-xs">{{ act.max || "—" }}</td>
                <td class="px-4 py-2.5 text-center text-caramel/80 text-xs font-medium">{{ act.unit || "—" }}</td>
                <td class="px-4 py-2.5 text-center text-denim-200/40 text-xs">{{ act.sort }}</td>
                <td class="px-4 py-2.5 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-denim-600/60 text-denim-200/50 hover:text-white transition-colors"
                      @click="editActivity(act)" title="Edit">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-denim-200/50 hover:text-red-400 transition-colors"
                      @click="deleteActivity(act.id)" title="Delete">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredActivities.length">
                <td colspan="11" class="px-4 py-10 text-center">
                  <p class="text-denim-200/40 text-sm mb-3">No activities defined yet for this combination</p>
                  <button class="btn-primary text-xs px-4" @click="showAddActivity=true">+ Add First Activity</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ── Add / Edit Activity Modal ────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddActivity" class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeActivityModal">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-lg">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40">
              <div>
                <h3 class="font-bold text-white">{{ editingActivity ? "Edit Activity" : "Add Activity" }}</h3>
                <p class="text-xs text-denim-200/50 mt-0.5">{{ appliedFilter.equipmentType }} · {{ appliedFilter.classification }} · {{ appliedFilter.interval }}</p>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="closeActivityModal">✕</button>
            </div>

            <!-- Form -->
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label">Activity Name <span class="text-red-400">*</span></label>
                <input v-model="actForm.name" class="input" placeholder="e.g. Cleaning Filter"/>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Activity Type <span class="text-red-400">*</span></label>
                  <select v-model="actForm.type" class="input">
                    <option value="">Select</option>
                    <option v-for="t in ACTIVITY_TYPES" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div>
                  <label class="label">Answer Type <span class="text-red-400">*</span></label>
                  <select v-model="actForm.answerType" class="input" @change="actForm.unit='';actForm.optimum='';actForm.min='';actForm.max=''">
                    <option value="">Select</option>
                    <option>Qualitative</option>
                    <option>Quantitative</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>

              <!-- Unit (always shown) -->
              <div>
                <label class="label">Unit <span v-if="actForm.answerType==='Quantitative'" class="text-red-400">*</span></label>
                <input v-model="actForm.unit" class="input" :placeholder="actForm.answerType==='Qualitative'?'e.g. Bersih, Baik':actForm.answerType==='Quantitative'?'e.g. °C, PSI, kW':'Custom unit'"/>
              </div>

              <!-- Quantitative bounds -->
              <div v-if="actForm.answerType==='Quantitative'" class="grid grid-cols-3 gap-3">
                <div><label class="label">Optimum</label><input v-model="actForm.optimum" class="input" placeholder="0"/></div>
                <div><label class="label">Minimum</label><input v-model="actForm.min" class="input" placeholder="0"/></div>
                <div><label class="label">Maximum</label><input v-model="actForm.max" class="input" placeholder="0"/></div>
              </div>

              <div>
                <label class="label">Sort Number</label>
                <input v-model.number="actForm.sort" type="number" class="input w-28" placeholder="1"/>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-5 flex justify-end gap-2">
              <button class="btn-secondary" @click="closeActivityModal">Cancel</button>
              <button class="btn-primary" @click="submitActivity" :disabled="!actFormValid">
                {{ editingActivity ? "Save Changes" : "Add Activity" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useActivities } from "@/composables/useActivities"

const { items: actLogs, loading: actLoading, error: actError, fetch: fetchActivities } = useActivities()
onMounted(() => fetchActivities({ limit: 50 }))

const ACTIVITY_TYPES = ["Addition","Adjustment","Cleaning","Function Test","Measurement","Others","Replacement","Thermographic Investigation","Visual"]

// ── Filter state ──────────────────────────────────────────
const filter = ref({ equipmentType: "", classification: "", interval: "" })
const appliedFilter = ref({ equipmentType: "", classification: "", interval: "" })
const showTable = ref(false)
const filterValid = computed(() => filter.value.equipmentType && filter.value.classification && filter.value.interval)

function applyFilter() {
  appliedFilter.value = { ...filter.value }
  showTable.value = true
}
function resetFilter() {
  filter.value = { equipmentType: "", classification: "", interval: "" }
  showTable.value = false
}

const equipmentTypes = ["AC Fasilitas","Genset","Panel Listrik","CCTV","Fire Alarm","Pompa Air","Lift / Elevator"]

// ── Activity templates (local — these define PM checklists per equipment type)
// In future this can be persisted to /activities API with a "template" flag
const allActivities = ref([
  {id:1, equipmentType:"AC Fasilitas", classification:"Preventive", interval:"Monthly",   name:"Cleaning Filter",   type:"Cleaning",   status:"Enable", answerType:"Qualitative",  optimum:"",  min:"",  max:"",  unit:"Bersih",  sort:1},
  {id:2, equipmentType:"AC Fasilitas", classification:"Preventive", interval:"Monthly",   name:"Cek Kondensasi",    type:"Visual",     status:"Enable", answerType:"Qualitative",  optimum:"",  min:"",  max:"",  unit:"Normal",  sort:2},
  {id:3, equipmentType:"AC Fasilitas", classification:"Preventive", interval:"3 Monthly", name:"Cek Freon",         type:"Measurement",status:"Enable", answerType:"Quantitative", optimum:"150",min:"100",max:"200",unit:"PSI",   sort:1},
  {id:4, equipmentType:"AC Fasilitas", classification:"Preventive", interval:"3 Monthly", name:"Cek Ampere",        type:"Measurement",status:"Enable", answerType:"Quantitative", optimum:"8",  min:"5",  max:"12", unit:"Ampere",sort:2},
  {id:5, equipmentType:"AC Fasilitas", classification:"Thermography Investigation", interval:"6 Monthly", name:"Thermography Check", type:"Thermographic Investigation", status:"Enable", answerType:"Qualitative", optimum:"",min:"",max:"",unit:"Normal",sort:1},
  {id:6, equipmentType:"Genset",       classification:"Preventive", interval:"Monthly",   name:"Cek Level Oli",     type:"Visual",     status:"Enable", answerType:"Qualitative",  optimum:"",  min:"",  max:"",  unit:"Normal",  sort:1},
  {id:7, equipmentType:"Genset",       classification:"Preventive", interval:"Monthly",   name:"Cek Level Air Radiator",type:"Visual", status:"Enable", answerType:"Qualitative",  optimum:"",  min:"",  max:"",  unit:"Normal",  sort:2},
])

const filteredActivities = computed(() =>
  allActivities.value.filter(a =>
    a.equipmentType === appliedFilter.value.equipmentType &&
    a.classification === appliedFilter.value.classification &&
    a.interval === appliedFilter.value.interval
  ).sort((a,b) => a.sort - b.sort)
)

// ── Activity Modal ────────────────────────────────────────
const showAddActivity = ref(false)
const editingActivity = ref<any>(null)
const actForm = ref({ name:"", type:"", answerType:"", unit:"", optimum:"", min:"", max:"", sort:1 })

const actFormValid = computed(() =>
  actForm.value.name && actForm.value.type && actForm.value.answerType &&
  (actForm.value.answerType !== "Quantitative" || actForm.value.unit)
)

function editActivity(act: any) {
  editingActivity.value = act
  actForm.value = { name:act.name, type:act.type, answerType:act.answerType, unit:act.unit, optimum:act.optimum, min:act.min, max:act.max, sort:act.sort }
  showAddActivity.value = true
}

function closeActivityModal() {
  showAddActivity.value = false
  editingActivity.value = null
  actForm.value = { name:"", type:"", answerType:"", unit:"", optimum:"", min:"", max:"", sort:1 }
}

function submitActivity() {
  if(!actFormValid.value) return
  if(editingActivity.value) {
    const idx = allActivities.value.findIndex(a => a.id === editingActivity.value.id)
    if(idx >= 0) allActivities.value[idx] = { ...allActivities.value[idx], ...actForm.value }
  } else {
    allActivities.value.push({
      id: Date.now(),
      equipmentType:  appliedFilter.value.equipmentType,
      classification: appliedFilter.value.classification,
      interval:       appliedFilter.value.interval,
      name:       actForm.value.name,
      type:       actForm.value.type,
      status:     "Enable",
      answerType: actForm.value.answerType,
      optimum:    actForm.value.optimum,
      min:        actForm.value.min,
      max:        actForm.value.max,
      unit:       actForm.value.unit,
      sort:       actForm.value.sort || 1,
    })
  }
  closeActivityModal()
}

function toggleStatus(act: any) {
  act.status = act.status === "Enable" ? "Disable" : "Enable"
}

function deleteActivity(id: number) {
  if(confirm("Delete this activity?")) allActivities.value = allActivities.value.filter(a => a.id !== id)
}

// ── Colors ────────────────────────────────────────────────
function classColor(c: string) {
  if(c==="Preventive") return "text-blue-400"
  if(c==="Corrective") return "text-green-400"
  if(c==="Predictive") return "text-orange-400"
  return "text-purple-400"
}

function actTypeColor(t: string) {
  const map: Record<string,string> = {
    "Cleaning":                   "bg-blue-500/15 text-blue-300",
    "Measurement":                "bg-yellow-500/15 text-yellow-300",
    "Visual":                     "bg-cyan-500/15 text-cyan-300",
    "Function Test":              "bg-green-500/15 text-green-300",
    "Replacement":                "bg-red-500/15 text-red-300",
    "Thermographic Investigation":"bg-purple-500/15 text-purple-300",
    "Adjustment":                 "bg-orange-500/15 text-orange-300",
    "Addition":                   "bg-teal-500/15 text-teal-300",
    "Others":                     "bg-denim-600/40 text-denim-200/60",
  }
  return map[t] ?? "bg-denim-600/40 text-denim-200/60"
}
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
