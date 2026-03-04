<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div><h2 class="text-xl font-bold text-white">Equipment</h2><div class="accent-bar mt-1.5"/></div>
      <div class="flex gap-2">
        <button class="btn-secondary text-xs px-3 py-1.5" @click="exportXls">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          XLS
        </button>
        <button class="btn-secondary text-xs px-3 py-1.5" @click="showAddType=true">+ Type</button>
        <button class="btn-primary text-xs px-3 py-1.5" @click="openAddEquipment(null)">+ Equipment</button>
      </div>
    </div>

    <!-- Equipment Types Table -->
    <div class="card p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-denim-700/40">
            <th class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide">Equipment Type</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide">Total Equipment</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide">Maintainer</th>
            <th class="px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="type in equipmentTypes" :key="type.id"
            class="border-b border-denim-700/20 hover:bg-denim-700/20 transition-colors cursor-pointer"
            @click="goToType(type)"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" :class="typeIcon(type.classification).bg">
                  <span>{{ typeIcon(type.classification).icon }}</span>
                </div>
                <div>
                  <p class="font-semibold text-white">{{ type.name }}</p>
                  <p class="text-xs text-denim-200/50">{{ type.classification }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-lg font-bold text-caramel">{{ type.total }}</span>
            </td>
            <td class="px-4 py-3 text-denim-100/70 text-sm">{{ type.maintainer }}</td>
            <td class="px-4 py-3 text-right">
              <button class="btn-secondary px-2 py-1 text-xs" @click.stop="editType(type)">Edit</button>
            </td>
          </tr>
          <tr v-if="!equipmentTypes.length">
            <td colspan="4" class="px-4 py-10 text-center text-denim-200/40 text-sm">No equipment types yet</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Type Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddType" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showAddType=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-sm">
            <div class="flex items-center justify-between px-5 py-4 border-b border-denim-700/40">
              <h3 class="font-bold text-white">{{ editingType ? "Edit Type" : "New Equipment Type" }}</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showAddType=false">✕</button>
            </div>
            <div class="px-5 py-4 space-y-3">
              <div><label class="label">Type Name <span class="text-red-400">*</span></label>
                <input v-model="typeForm.name" class="input" placeholder="e.g. AC Fasilitas"/></div>
              <div><label class="label">Classification <span class="text-red-400">*</span></label>
                <select v-model="typeForm.classification" class="input">
                  <option value="">Select</option>
                  <option>Civil</option><option>Electrical</option><option>Electronic</option><option>Mechanical</option><option>Others</option>
                </select>
              </div>
            </div>
            <div class="px-5 pb-4 flex justify-end gap-2">
              <button class="btn-secondary" @click="showAddType=false">Cancel</button>
              <button class="btn-primary" @click="submitType" :disabled="!typeForm.name||!typeForm.classification">
                {{ editingType ? "Save" : "Add Type" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add/Edit Equipment Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddEquipment" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" @click.self="showAddEquipment=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10 rounded-t-2xl">
              <h3 class="font-bold text-white">{{ editingEquipment ? "Edit Equipment" : "Add New Equipment" }}</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showAddEquipment=false">✕</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Equipment ID <span class="text-red-400">*</span></label>
                  <input v-model="eqForm.id" class="input font-mono text-xs" placeholder="EDA_AC_001" :disabled="!!editingEquipment"/></div>
                <div><label class="label">Device Name <span class="text-red-400">*</span></label>
                  <input v-model="eqForm.name" class="input" placeholder="AC Function Room"/></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Classification <span class="text-red-400">*</span></label>
                  <select v-model="eqForm.classification" class="input">
                    <option value="">Select</option>
                    <option>Civil</option><option>Electrical</option><option>Electronic</option><option>Mechanical</option><option>Others</option>
                  </select>
                </div>
                <div><label class="label">Equipment Type <span class="text-red-400">*</span></label>
                  <select v-model="eqForm.type" class="input">
                    <option value="">Select</option>
                    <option v-for="t in equipmentTypes" :key="t.id" :value="t.name">{{ t.name }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Section / System <span class="text-red-400">*</span></label>
                  <select v-model="eqForm.section" class="input">
                    <option value="">Select</option>
                    <option v-for="s in SECTIONS" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div><label class="label">Critical Level (1-5) <span class="text-red-400">*</span></label>
                  <select v-model="eqForm.criticalLevel" class="input">
                    <option value="">Select</option>
                    <option v-for="n in 5" :key="n" :value="n">{{ n }}{{ n===5?" (Highest)":n===1?" (Lowest)":"" }}</option>
                  </select>
                </div>
              </div>
              <div><label class="label">Plant / Site</label>
                <input v-model="eqForm.plant" class="input" placeholder="Essence Darmawangsa Apartment"/></div>
              <div><label class="label">Location Floor / Level</label>
                <input v-model="eqForm.location" class="input" placeholder="Lantai 2 / Basement 1"/></div>

              <!-- Coordinates -->
              <div class="grid grid-cols-3 gap-3 items-end">
                <div><label class="label">Latitude</label>
                  <input v-model="eqForm.lat" class="input font-mono text-xs" placeholder="-6.2685346"/></div>
                <div><label class="label">Longitude</label>
                  <input v-model="eqForm.lng" class="input font-mono text-xs" placeholder="106.8074791"/></div>
                <button class="btn-secondary text-xs h-9" @click="getLocation">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                  Get Location
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Model Number</label><input v-model="eqForm.model" class="input" placeholder=""/></div>
                <div><label class="label">Serial Number</label><input v-model="eqForm.serial" class="input" placeholder=""/></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Size / Capacity</label><input v-model="eqForm.capacity" class="input" placeholder="e.g. 2 PK, 50 kW"/></div>
                <div><label class="label">Brand / Maker</label><input v-model="eqForm.brand" class="input" placeholder=""/></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Vendor</label><input v-model="eqForm.vendor" class="input" placeholder=""/></div>
                <div><label class="label">Maintainer <span class="text-red-400">*</span></label>
                  <select v-model="eqForm.maintainer" class="input">
                    <option>PT Sumber Sarana Solusindo</option>
                  </select>
                </div>
              </div>
              <div><label class="label">Date of Installation</label>
                <input v-model="eqForm.installDate" type="date" class="input"/></div>
              <div><label class="label">Other Notes</label>
                <textarea v-model="eqForm.other" class="input resize-none" rows="2"/></div>
              <div>
                <label class="label">Photo (Thumbnail)</label>
                <div class="border-2 border-dashed border-denim-600/50 rounded-lg p-4 text-center hover:border-caramel/40 transition-colors cursor-pointer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2 text-denim-200/40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p class="text-xs text-denim-200/40">Click to upload photo</p>
                </div>
              </div>
            </div>
            <div class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
              <button class="btn-secondary" @click="showAddEquipment=false">Cancel</button>
              <button class="btn-primary" @click="submitEquipment" :disabled="!isEqValid">
                {{ editingEquipment ? "Save Changes" : "Add Equipment" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const SECTIONS = ["Access Control","Air Bersih","Air Conditioner","CCTV","FAF","Fire Alarm","Fire Fighting","Genset","IHB","Lighting","Panel Listrik","Pool / Kolam Renang","Power House","Pump","Tata Suara","VAC","Videophone"]

// ── Equipment Types data ───────────────────────────────────
const equipmentTypes = ref([
  {id:1, name:"AC Fasilitas",     classification:"Mechanical",  total:12, maintainer:"PT Sumber Sarana Solusindo"},
  {id:2, name:"Genset",           classification:"Electrical",  total:3,  maintainer:"PT Sumber Sarana Solusindo"},
  {id:3, name:"Panel Listrik",    classification:"Electrical",  total:8,  maintainer:"PT Sumber Sarana Solusindo"},
  {id:4, name:"CCTV",             classification:"Electronic",  total:24, maintainer:"PT Sumber Sarana Solusindo"},
  {id:5, name:"Fire Alarm",       classification:"Electronic",  total:6,  maintainer:"PT Sumber Sarana Solusindo"},
  {id:6, name:"Pompa Air",        classification:"Mechanical",  total:5,  maintainer:"PT Sumber Sarana Solusindo"},
  {id:7, name:"Lift / Elevator",  classification:"Mechanical",  total:4,  maintainer:"PT Sumber Sarana Solusindo"},
])

function typeIcon(c: string) {
  const map: Record<string,{bg:string,icon:string}> = {
    Mechanical:  {bg:"bg-blue-500/15 text-blue-400",   icon:"⚙️"},
    Electrical:  {bg:"bg-yellow-500/15 text-yellow-400",icon:"⚡"},
    Electronic:  {bg:"bg-purple-500/15 text-purple-400",icon:"📡"},
    Civil:       {bg:"bg-green-500/15 text-green-400",  icon:"🏗️"},
    Others:      {bg:"bg-denim-600/50 text-denim-200",  icon:"🔧"},
  }
  return map[c] ?? map.Others
}

// ── Navigate to type detail ────────────────────────────────
function goToType(type: any) {
  router.push({ name: 'EquipmentList', params: { typeId: type.id } })
}

// ── Add Type ───────────────────────────────────────────────
const showAddType  = ref(false)
const editingType  = ref<any>(null)
const typeForm = ref({name:"", classification:""})

function editType(t: any) { editingType.value=t; typeForm.value={name:t.name,classification:t.classification}; showAddType.value=true }
function submitType() {
  if(editingType.value) {
    const idx = equipmentTypes.value.findIndex(t=>t.id===editingType.value.id)
    if(idx>=0) equipmentTypes.value[idx]={...equipmentTypes.value[idx],...typeForm.value}
  } else {
    equipmentTypes.value.push({id:Date.now(),name:typeForm.value.name,classification:typeForm.value.classification,total:0,maintainer:"PT Sumber Sarana Solusindo"})
  }
  showAddType.value=false; editingType.value=null; typeForm.value={name:"",classification:""}
}

// ── Add Equipment ──────────────────────────────────────────
const showAddEquipment = ref(false)
const editingEquipment = ref<any>(null)
const eqForm = ref({id:"",name:"",classification:"",type:"",section:"",criticalLevel:"",plant:"Essence Darmawangsa Apartment",location:"",lat:"",lng:"",model:"",serial:"",capacity:"",brand:"",vendor:"",maintainer:"PT Sumber Sarana Solusindo",installDate:"",other:""})

function openAddEquipment(eq: any) {
  editingEquipment.value = eq
  if(eq) Object.assign(eqForm.value, eq)
  else eqForm.value={id:"",name:"",classification:"",type:"",section:"",criticalLevel:"",plant:"Essence Darmawangsa Apartment",location:"",lat:"",lng:"",model:"",serial:"",capacity:"",brand:"",vendor:"",maintainer:"PT Sumber Sarana Solusindo",installDate:"",other:""}
  showAddEquipment.value=true
}

const isEqValid = computed(()=>eqForm.value.id&&eqForm.value.name&&eqForm.value.classification&&eqForm.value.type&&eqForm.value.section&&eqForm.value.criticalLevel&&eqForm.value.maintainer)

function getLocation() {
  navigator.geolocation?.getCurrentPosition(p=>{eqForm.value.lat=String(p.coords.latitude);eqForm.value.lng=String(p.coords.longitude)})
}

function submitEquipment() {
  // TODO: API call
  showAddEquipment.value=false
}

function exportXls() { alert("XLS export — coming soon") }
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
