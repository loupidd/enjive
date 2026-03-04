<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div><h2 class="text-xl font-bold text-white">Schedule</h2><div class="accent-bar mt-1.5"/></div>
      <button class="btn-primary" @click="openCreate(null)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Schedule
      </button>
    </div>

    <!-- Calendar nav -->
    <div class="card p-0 overflow-hidden">
      <!-- Month navigation -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-denim-700/40">
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="prevMonth">&#8592; Prev</button>
        <h3 class="text-base font-bold text-white">{{ monthLabel }}</h3>
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="nextMonth">Next &#8594;</button>
      </div>

      <!-- Day labels -->
      <div class="grid grid-cols-7 border-b border-denim-700/40">
        <div v-for="d in DAYS" :key="d"
          class="py-2 text-center text-[11px] font-semibold text-denim-200/50 uppercase tracking-wide">
          {{ d }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="min-h-[90px] border-b border-r border-denim-700/20 p-1.5 relative cursor-pointer transition-colors"
          :class="[
            cell.currentMonth ? 'bg-transparent hover:bg-denim-700/20' : 'bg-denim-900/40',
            cell.isToday ? 'ring-1 ring-inset ring-caramel/40' : '',
          ]"
          @click="openCreate(cell.date)"
          @contextmenu.prevent="openCreate(cell.date)"
        >
          <!-- Day number -->
          <span
            class="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1"
            :class="cell.isToday
              ? 'bg-caramel text-denim-950'
              : cell.currentMonth ? 'text-slate-300' : 'text-denim-200/25'"
          >{{ cell.day }}</span>

          <!-- Schedule dots/chips -->
          <div class="space-y-0.5">
            <div
              v-for="(ev, ei) in cell.events.slice(0,3)"
              :key="ei"
              class="text-[9px] leading-tight px-1.5 py-0.5 rounded font-medium truncate cursor-pointer"
              :class="classColor(ev.classification)"
              @click.stop="openDetail(ev)"
            >{{ ev.equipmentId }}</div>
            <div v-if="cell.events.length > 3" class="text-[9px] text-denim-200/40 pl-1">
              +{{ cell.events.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-3 text-[11px]">
      <div v-for="l in LEGEND" :key="l.label" class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm" :class="l.color"/>
        <span class="text-denim-200/60">{{ l.label }}</span>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16"
          @click.self="showModal=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10">
              <div>
                <h2 class="text-base font-bold text-white">{{ editMode ? "Edit Schedule" : "New Schedule" }}</h2>
                <p class="text-xs text-denim-200/50 mt-0.5">{{ selectedDateLabel }}</p>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50 hover:text-white"
                @click="showModal=false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <!-- Equipment Type -->
              <div>
                <label class="label">Equipment Type <span class="text-red-400">*</span></label>
                <select v-model="form.equipmentType" class="input" @change="form.equipmentId=''">
                  <option value="">Select type</option>
                  <option v-for="t in equipmentTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <!-- Equipment ID -->
              <div>
                <label class="label">Equipment ID <span class="text-red-400">*</span></label>
                <select v-model="form.equipmentId" class="input" :disabled="!form.equipmentType">
                  <option value="">Select equipment</option>
                  <option v-for="e in filteredEquipment" :key="e.id" :value="e.id">{{ e.id }} – {{ e.name }}</option>
                </select>
              </div>

              <!-- Classification + Interval -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Maintenance Classification <span class="text-red-400">*</span></label>
                  <select v-model="form.classification" class="input">
                    <option value="">Select</option>
                    <option>Preventive</option>
                    <option>Corrective</option>
                    <option>Predictive</option>
                    <option>Thermography Investigation</option>
                  </select>
                </div>
                <div>
                  <label class="label">Interval <span class="text-red-400">*</span></label>
                  <select v-model="form.interval" class="input">
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

              <!-- Date -->
              <div>
                <label class="label">Date <span class="text-red-400">*</span></label>
                <input v-model="form.date" type="date" class="input"/>
              </div>

              <!-- Technician Coordinator -->
              <div>
                <label class="label">Technician Coordinator <span class="text-red-400">*</span></label>
                <select v-model="form.technicianId" class="input">
                  <option value="">Select technician</option>
                  <option v-for="t in technicians" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="label">Description</label>
                <textarea v-model="form.description" class="input resize-none" rows="2" placeholder="Optional notes..."/>
              </div>

              <!-- Repeat -->
              <div class="flex items-center gap-3 py-1">
                <button
                  class="w-10 h-5 rounded-full transition-colors relative"
                  :class="form.repeat ? 'bg-caramel' : 'bg-denim-600'"
                  @click="form.repeat = !form.repeat"
                >
                  <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    :class="form.repeat ? 'left-5' : 'left-0.5'"/>
                </button>
                <label class="text-sm text-slate-300">Repeat to next schedules</label>
              </div>

              <!-- Duplicate warning -->
              <div v-if="duplicateWarning" class="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" class="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <p class="text-xs text-yellow-300">{{ duplicateWarning }}</p>
              </div>
            </div>

            <div class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-3">
              <button class="btn-secondary" @click="showModal=false">Cancel</button>
              <button class="btn-primary" @click="submitForm" :disabled="!isFormValid">
                {{ editMode ? "Save Changes" : "Create Schedule" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showDetail=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div class="flex items-center justify-between px-5 py-4 border-b border-denim-700/40">
              <h3 class="text-sm font-bold text-white">Schedule Detail</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showDetail=false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-if="detailEvent" class="px-5 py-4 space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-denim-200/50">Equipment</span><span class="text-white font-medium">{{ detailEvent.equipmentId }}</span></div>
              <div class="flex justify-between"><span class="text-denim-200/50">Classification</span>
                <span class="text-xs px-2 py-0.5 rounded font-medium" :class="classColor(detailEvent.classification)">{{ detailEvent.classification }}</span>
              </div>
              <div class="flex justify-between"><span class="text-denim-200/50">Interval</span><span class="text-white">{{ detailEvent.interval }}</span></div>
              <div class="flex justify-between"><span class="text-denim-200/50">Date</span><span class="text-white">{{ detailEvent.date }}</span></div>
              <div class="flex justify-between"><span class="text-denim-200/50">Technician</span><span class="text-white">{{ detailEvent.technician }}</span></div>
              <div v-if="detailEvent.description" class="pt-1 border-t border-denim-700/40"><p class="text-denim-200/50 text-xs mb-1">Notes</p><p class="text-white text-xs">{{ detailEvent.description }}</p></div>
            </div>
            <div class="flex gap-2 px-5 pb-4">
              <button class="btn-secondary flex-1 justify-center text-xs" @click="editEvent(detailEvent)">Edit</button>
              <button class="btn-danger flex-1 justify-center text-xs" @click="deleteEvent(detailEvent)">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const LEGEND = [
  {label:'Preventive',color:'bg-blue-500/30 text-blue-300'},
  {label:'Corrective',color:'bg-green-500/30 text-green-300'},
  {label:'Predictive',color:'bg-orange-500/30 text-orange-300'},
  {label:'Thermography',color:'bg-purple-500/30 text-purple-300'},
]

// ── Calendar state ─────────────────────────────────────────
const today = new Date()
const currentYear  = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const monthLabel = computed(() => new Date(currentYear.value, currentMonth.value).toLocaleDateString('en-US',{month:'long',year:'numeric'}))

function prevMonth(){if(currentMonth.value===0){currentMonth.value=11;currentYear.value--}else currentMonth.value--}
function nextMonth(){if(currentMonth.value===11){currentMonth.value=0;currentYear.value++}else currentMonth.value++}

// ── Events (placeholder) ──────────────────────────────────
const events = ref([
  {id:1,equipmentId:'EDA_AC_001',equipmentType:'AC Fasilitas',classification:'Preventive',interval:'Monthly',date:`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-05`,technician:'Ahmad Fauzi',description:'',repeat:false},
  {id:2,equipmentId:'EDA_GEN_001',equipmentType:'Genset',classification:'Predictive',interval:'3 Monthly',date:`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-12`,technician:'Budi Santoso',description:'',repeat:false},
  {id:3,equipmentId:'EDA_PUMP_003',equipmentType:'Pompa',classification:'Thermography Investigation',interval:'6 Monthly',date:`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,technician:'Citra Dewi',description:'',repeat:false},
])

// ── Calendar cells ────────────────────────────────────────
const calendarCells = computed(() => {
  const year = currentYear.value, month = currentMonth.value
  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()
  const cells = []
  // prev month padding
  for(let i=first-1;i>=0;i--){
    const d = daysInPrev-i
    cells.push({day:d,currentMonth:false,isToday:false,date:fmtDate(year,month-1,d),events:[]})
  }
  // current month
  for(let d=1;d<=daysInMonth;d++){
    const dateStr = fmtDate(year,month,d)
    const todayStr = fmtDate(today.getFullYear(),today.getMonth(),today.getDate())
    cells.push({day:d,currentMonth:true,isToday:dateStr===todayStr,date:dateStr,
      events:events.value.filter(e=>e.date===dateStr)})
  }
  // next month padding
  const remaining = 42 - cells.length
  for(let d=1;d<=remaining;d++){
    cells.push({day:d,currentMonth:false,isToday:false,date:fmtDate(year,month+1,d),events:[]})
  }
  return cells
})

function fmtDate(y:number,m:number,d:number){
  const date=new Date(y,m,d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

// ── Modal state ───────────────────────────────────────────
const showModal = ref(false)
const showDetail = ref(false)
const editMode = ref(false)
const editingId = ref<number|null>(null)
const detailEvent = ref<any>(null)
const selectedDateLabel = ref('')

const form = ref({equipmentType:'',equipmentId:'',classification:'',interval:'',date:'',technicianId:'',description:'',repeat:false})

function openCreate(date: string|null){
  editMode.value=false; editingId.value=null
  form.value={equipmentType:'',equipmentId:'',classification:'',interval:'',date:date??''  ,technicianId:'',description:'',repeat:false}
  selectedDateLabel.value=date?new Date(date+'T00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}):'' 
  showModal.value=true
}

function openDetail(ev:any){detailEvent.value=ev;showDetail.value=true}

function editEvent(ev:any){
  showDetail.value=false
  editMode.value=true;editingId.value=ev.id
  form.value={equipmentType:ev.equipmentType,equipmentId:ev.equipmentId,classification:ev.classification,interval:ev.interval,date:ev.date,technicianId:ev.technician,description:ev.description,repeat:ev.repeat}
  selectedDateLabel.value=''
  showModal.value=true
}

function deleteEvent(ev:any){
  events.value=events.value.filter(e=>e.id!==ev.id)
  showDetail.value=false
}

// Duplicate detection
const duplicateWarning = computed(()=>{
  if(!form.value.equipmentId||!form.value.classification||!form.value.date) return null
  const dup=events.value.find(e=>
    e.equipmentId===form.value.equipmentId &&
    e.classification===form.value.classification &&
    e.date===form.value.date &&
    e.id!==editingId.value
  )
  return dup?`Duplicate detected: ${form.value.equipmentId} already has a ${form.value.classification} scheduled on this date.`:null
})

const isFormValid = computed(()=>
  form.value.equipmentType && form.value.equipmentId &&
  form.value.classification && form.value.interval &&
  form.value.date && form.value.technicianId && !duplicateWarning.value
)

function submitForm(){
  if(!isFormValid.value) return
  if(editMode.value && editingId.value){
    const idx=events.value.findIndex(e=>e.id===editingId.value)
    if(idx>=0) events.value[idx]={...events.value[idx],...form.value,technician:form.value.technicianId}
  } else {
    events.value.push({id:Date.now(),equipmentId:form.value.equipmentId,equipmentType:form.value.equipmentType,classification:form.value.classification,interval:form.value.interval,date:form.value.date,technician:form.value.technicianId,description:form.value.description,repeat:form.value.repeat})
  }
  showModal.value=false
}

// ── Static data ───────────────────────────────────────────
const equipmentTypes=['AC Fasilitas','Genset','Pompa','Panel Listrik','CCTV','Fire Alarm','Lift']
const equipmentMap:Record<string,{id:string,name:string}[]>={
  'AC Fasilitas':[{id:'EDA_AC_001',name:'AC Lobby'},{id:'EDA_AC_002',name:'AC Function Room'}],
  'Genset':[{id:'EDA_GEN_001',name:'Genset B2'},{id:'EDA_GEN_002',name:'Genset Rooftop'}],
  'Pompa':[{id:'EDA_PUMP_001',name:'Pompa Air Bersih'},{id:'EDA_PUMP_003',name:'Pompa Transfer'}],
  'Panel Listrik':[{id:'EDA_PNL_001',name:'Panel MDP B2'},{id:'EDA_PNL_002',name:'Panel Lt.3'}],
  'CCTV':[{id:'EDA_CCTV_001',name:'CCTV Lobby Utama'}],
  'Fire Alarm':[{id:'EDA_FA_001',name:'FA Panel Utama'}],
  'Lift':[{id:'EDA_LIFT_001',name:'Lift Servis B1'},{id:'EDA_LIFT_002',name:'Lift Penumpang 1'}],
}
const filteredEquipment=computed(()=>equipmentMap[form.value.equipmentType]??[])
const technicians=[{id:'ahmad',name:'Ahmad Fauzi'},{id:'budi',name:'Budi Santoso'},{id:'citra',name:'Citra Dewi'},{id:'dodi',name:'Dodi Prasetyo'}]

function classColor(c:string){
  if(c==='Preventive') return 'bg-blue-500/25 text-blue-300 border border-blue-500/20'
  if(c==='Corrective') return 'bg-green-500/25 text-green-300 border border-green-500/20'
  if(c==='Predictive') return 'bg-orange-500/25 text-orange-300 border border-orange-500/20'
  if(c==='Thermography Investigation') return 'bg-purple-500/25 text-purple-300 border border-purple-500/20'
  return 'bg-denim-600/50 text-denim-200'
}
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
