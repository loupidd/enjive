<template>
  <div class="space-y-4">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Users</h2>
        <div class="accent-bar mt-1.5"/>
      </div>
      <button v-if="isAdmin" class="btn-primary text-xs gap-1.5 px-3" @click="openCreate">
        <IconPlus :size="13"/> Add User
      </button>
    </div>

    <!-- ── Filters row ──────────────────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <div class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-denim-700/30">

        <!-- Company -->
        <div class="px-4 py-3">
          <label class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5">Company</label>
          <div class="flex gap-1 flex-wrap">
            <button v-for="c in COMPANIES" :key="c.key"
              class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
              :class="filters.company===c.key
                ? 'bg-caramel/15 border-caramel/40 text-caramel font-semibold'
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70 hover:border-denim-500/50'"
              @click="filters.company = filters.company===c.key ? '' : c.key"
            >{{ c.label }}</button>
          </div>
        </div>

        <!-- Status -->
        <div class="px-4 py-3">
          <label class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5">Status</label>
          <div class="flex gap-1 flex-wrap">
            <button v-for="s in STATUSES" :key="s.key"
              class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
              :class="filters.status===s.key
                ? s.activeClass
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'"
              @click="filters.status = filters.status===s.key ? '' : s.key"
            >{{ s.label }}</button>
          </div>
        </div>

        <!-- Account Level -->
        <div class="px-4 py-3">
          <label class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5">Account Level</label>
          <div class="flex gap-1 flex-wrap">
            <button v-for="lv in LEVELS" :key="lv"
              class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
              :class="filters.level===lv
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-semibold'
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'"
              @click="filters.level = filters.level===lv ? '' : lv"
            >{{ lv }}</button>
          </div>
        </div>

      </div>

      <!-- Search + count bar -->
      <div class="flex items-center gap-3 px-4 py-2.5 border-t border-denim-700/20">
        <div class="relative flex-1 max-w-xs">
          <IconSearch :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-denim-200/30"/>
          <input v-model="search" class="input pl-8 py-1.5 text-xs" placeholder="Search name, email, ID..."/>
          <button v-if="search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-denim-200/30 hover:text-white" @click="search=''">
            <IconX :size="12"/>
          </button>
        </div>
        <span class="text-xs text-denim-200/30 ml-auto">{{ filteredUsers.length }} user{{ filteredUsers.length!==1?'s':'' }}</span>
        <button v-if="hasFilters" class="text-[11px] text-caramel/70 hover:text-caramel" @click="resetFilters">Clear filters</button>
      </div>
    </div>

    <!-- ── Table ────────────────────────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px]">
          <thead>
            <tr class="border-b border-denim-700/30 bg-denim-900/20">
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide w-10">No</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">Name</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">ID Account</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">Email</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">Company</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">Account Level</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide">Position</th>
              <th class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide w-20">Status</th>
              <th v-if="isAdmin" class="px-4 py-2.5 w-16"/>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, i) in pagedUsers" :key="user.id"
              class="border-b border-denim-700/10 hover:bg-denim-700/10 transition-colors group"
            >
              <td class="px-4 py-3 text-[11px] text-denim-200/25">{{ (page-1)*PER_PAGE+i+1 }}</td>

              <!-- Name + avatar -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    :style="{ background: avatarColor(user.name) }">
                    {{ initials(user.name) }}
                  </div>
                  <span class="text-xs font-medium text-white">{{ user.name }}</span>
                </div>
              </td>

              <td class="px-4 py-3 font-mono text-[11px] text-caramel/80">{{ user.accountId }}</td>
              <td class="px-4 py-3 text-[11px] text-denim-200/50">{{ user.email }}</td>

              <!-- Company -->
              <td class="px-4 py-3 text-[11px] text-denim-200/60 max-w-[160px] truncate" :title="user.company">
                {{ user.company }}
              </td>

              <!-- Level badge -->
              <td class="px-4 py-3">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold" :class="levelColor(user.level)">
                  {{ user.level }}
                </span>
              </td>

              <td class="px-4 py-3 text-[11px] text-denim-200/50">{{ user.position }}</td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  :class="user.status==='Active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'">
                  {{ user.status }}
                </span>
              </td>

              <!-- Admin actions -->
              <td v-if="isAdmin" class="px-3 py-3">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-denim-600/50 text-denim-200/50 hover:text-white transition-colors" @click="openEdit(user)" title="Edit">
                    <IconPencil :size="12"/>
                  </button>
                  <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-denim-200/30 hover:text-red-400 transition-colors" @click="confirmDelete(user)" title="Delete">
                    <IconTrash :size="12"/>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagedUsers.length">
              <td :colspan="isAdmin ? 9 : 8" class="px-4 py-12 text-center text-xs text-denim-200/25">
                No users found matching your filters
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-denim-700/20">
        <p class="text-xs text-denim-200/30">Showing {{ (page-1)*PER_PAGE+1 }}–{{ Math.min(page*PER_PAGE, filteredUsers.length) }} of {{ filteredUsers.length }}</p>
        <div class="flex items-center gap-1">
          <button class="btn-secondary px-2.5 py-1 text-xs" :disabled="page===1" @click="page--">← Prev</button>
          <span class="text-xs text-denim-200/40 px-2">{{ page }}/{{ totalPages }}</span>
          <button class="btn-secondary px-2.5 py-1 text-xs" :disabled="page===totalPages" @click="page++">Next →</button>
        </div>
      </div>
    </div>

    <!-- ── Create/Edit Modal ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16" @click.self="showModal=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10">
              <h2 class="text-sm font-bold text-white">{{ editMode ? 'Edit User' : 'Add New User' }}</h2>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showModal=false">
                <IconX :size="14"/>
              </button>
            </div>

            <div class="px-6 py-5 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Full Name <span class="text-red-400">*</span></label>
                  <input v-model="form.name" class="input text-sm" placeholder="Full name"/>
                </div>
                <div>
                  <label class="label">ID Account <span class="text-red-400">*</span></label>
                  <input v-model="form.accountId" class="input text-sm font-mono" placeholder="USR-XXXX"/>
                </div>
              </div>
              <div>
                <label class="label">Email <span class="text-red-400">*</span></label>
                <input v-model="form.email" type="email" class="input text-sm" placeholder="user@example.com"/>
              </div>
              <div v-if="!editMode">
                <label class="label">Password <span class="text-red-400">*</span></label>
                <input v-model="form.password" type="password" class="input text-sm" placeholder="Minimum 8 characters"/>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Company <span class="text-red-400">*</span></label>
                  <select v-model="form.company" class="input text-sm">
                    <option value="">Select company</option>
                    <option v-for="c in COMPANIES.filter(c=>c.key)" :key="c.key" :value="c.label">{{ c.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="label">Account Level <span class="text-red-400">*</span></label>
                  <select v-model="form.level" class="input text-sm">
                    <option value="">Select level</option>
                    <option v-for="lv in LEVELS" :key="lv">{{ lv }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Position</label>
                  <input v-model="form.position" class="input text-sm" placeholder="e.g. Engineer"/>
                </div>
                <div>
                  <label class="label">Status</label>
                  <select v-model="form.status" class="input text-sm">
                    <option>Active</option>
                    <option>Disable</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2">
              <button class="btn-secondary text-xs" @click="showModal=false">Cancel</button>
              <button class="btn-primary text-xs" :disabled="!isFormValid" @click="saveUser">
                {{ editMode ? 'Save Changes' : 'Create User' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete confirm ────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showDelete=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div class="px-6 py-6 text-center">
              <div class="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <IconTrash :size="20" class="text-red-400"/>
              </div>
              <h3 class="text-sm font-bold text-white mb-1">Delete User?</h3>
              <p class="text-xs text-denim-200/50">
                Are you sure you want to delete <span class="text-white font-semibold">{{ deleteTarget?.name }}</span>? This cannot be undone.
              </p>
            </div>
            <div class="flex gap-2 px-6 pb-5">
              <button class="btn-secondary flex-1 justify-center text-xs" @click="showDelete=false">Cancel</button>
              <button class="btn-danger flex-1 justify-center text-xs" @click="deleteUser">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconPlus, IconPencil, IconTrash, IconX, IconSearch } from '@/components/icons'

// ── Role check — replace with real auth store ─────────────────
const currentRole = ref('ADMIN') // ADMIN | PLANNER | TECHNICIAN | VIEWER
const isAdmin = computed(() => currentRole.value === 'ADMIN')

// ── Constants ─────────────────────────────────────────────────
const COMPANIES = [
  { key: '',          label: 'All' },
  { key: 'BM',        label: 'BM Essence Darmawangsa Apartment' },
  { key: 'SSS',       label: 'PT Sumber Sarana Solusindo' },
]
const STATUSES = [
  { key: '',        label: 'All',     activeClass: 'border-denim-500/50 text-denim-200/70 bg-denim-700/20' },
  { key: 'Active',  label: 'Active',  activeClass: 'bg-green-500/15 border-green-500/40 text-green-400 font-semibold' },
  { key: 'Disable', label: 'Disable', activeClass: 'bg-red-500/15 border-red-500/40 text-red-400 font-semibold' },
]
const LEVELS = ['Administrator','Engineer','Guest','Helper','Supervisor','Supporting','Technician','Viewer']

const PER_PAGE = 10

// ── Level color O(1) ──────────────────────────────────────────
const LEVEL_COLORS = new Map([
  ['Administrator', 'bg-red-500/15 text-red-300'],
  ['Engineer',      'bg-blue-500/15 text-blue-300'],
  ['Supervisor',    'bg-purple-500/15 text-purple-300'],
  ['Technician',    'bg-caramel/15 text-caramel'],
  ['Viewer',        'bg-denim-600/40 text-denim-200/60'],
  ['Guest',         'bg-denim-600/30 text-denim-200/40'],
  ['Helper',        'bg-green-500/15 text-green-300'],
  ['Supporting',    'bg-cyan-500/15 text-cyan-300'],
])
function levelColor(lv: string) { return LEVEL_COLORS.get(lv) ?? 'bg-denim-600/30 text-denim-200' }

// Avatar helpers
const AVATAR_PALETTE = ['#7A4A00','#02314E','#1e40af','#065f46','#7c3aed','#be185d','#b45309']
function avatarColor(name: string) {
  let h = 0; for(const c of name) h = (h*31+c.charCodeAt(0))%AVATAR_PALETTE.length
  return AVATAR_PALETTE[Math.abs(h)]
}
function initials(name: string) { return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() }

// ── Mock users ────────────────────────────────────────────────
const users = ref([
  { id:1,  name:'Mr Admin',            accountId:'s3.solusi',            email:'s3.solusi@gmail.com',                    company:'PT Sumber Sarana Solusindo',       level:'Administrator', position:'Administrator',          status:'Active' },
  { id:2,  name:'Agus Yudi',           accountId:'ce_view',              email:'ce_view@sssolusindo.com',                 company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Viewer',                 status:'Active' },
  { id:3,  name:'Ari Handiatna',       accountId:'teknisi10',            email:'teknisi10@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:4,  name:'Dede Noerjaman',      accountId:'om_view',              email:'om_view@sssolusindo.com',                 company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Viewer',                 status:'Active' },
  { id:5,  name:'Djoko Triyono',       accountId:'PPI_view',             email:'PPI_view@sssolusindo.com',                company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Viewer',                 status:'Active' },
  { id:6,  name:'Fakhri Rabbani',      accountId:'teknisi1_np',          email:'teknisi1_np@sssolusindo.com',             company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:7,  name:'M Basir',             accountId:'ace_view',             email:'ace_view@sssolusindo.com',                company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Viewer',                 status:'Active' },
  { id:8,  name:'M Latif',             accountId:'teknisi5',             email:'teknisi5@sssolusindo.com',                company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:9,  name:'Manager',             accountId:'manager.sumbersarana', email:'manager.sumbersarana@sssolusindo.com',    company:'PT Sumber Sarana Solusindo',       level:'Supervisor',    position:'Manager',                status:'Active' },
  { id:10, name:'Muhammad Fauzi',      accountId:'teknisi3',             email:'teknisi3@sssolusindo.com',                company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:11, name:'Planner',             accountId:'planner',              email:'planner@sssolusindo.com',                 company:'PT Sumber Sarana Solusindo',       level:'Engineer',      position:'Planner',                status:'Active' },
  { id:12, name:'Planner 2',           accountId:'planner_2',            email:'planner_2@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Engineer',      position:'Planner',                status:'Active' },
  { id:13, name:'Qirom',               accountId:'qirom',                email:'qirom@sssolusindo.com',                   company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Engineering Supervisor', status:'Active' },
  { id:14, name:'Ramdani',             accountId:'ramdani',              email:'ramdani@sssolusindo.com',                 company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Engineering Supervisor', status:'Active' },
  { id:15, name:'Ramdhan Reza',        accountId:'admin',                email:'admin@sssolusindo.com',                   company:'PT Sumber Sarana Solusindo',       level:'Engineer',      position:'Admin Site',             status:'Active' },
  { id:16, name:'Renaldy Alexander',   accountId:'teknisi1',             email:'teknisi1@sssolusindo.com',                company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:17, name:'Ridho Alif Fiansyah', accountId:'teknisi13',            email:'teknisi13@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:18, name:'Rizky Putra Utama',   accountId:'teknisi11',            email:'teknisi11@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:19, name:'Soleh',               accountId:'teknisi14',            email:'teknisi14@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:20, name:'Sugianto',            accountId:'teknisi6',             email:'teknisi6@sssolusindo.com',                company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
  { id:21, name:'Suryo Nugroho',       accountId:'teknisi17',            email:'teknisi17@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Technician',             status:'Active' },
  { id:22, name:'Syahrial',            accountId:'BM_view',              email:'BM_view@sssolusindo.com',                 company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Viewer',                 status:'Active' },
  { id:23, name:'Syarifudin',          accountId:'syarifudin',           email:'syarifudin@sssolusindo.com',              company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Engineering Supervisor', status:'Active' },
  { id:24, name:'Tedi',                accountId:'tedi',                 email:'tedi@sssolusindo.com',                    company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Engineering Supervisor', status:'Active' },
  { id:25, name:'Testing Account',     accountId:'soluman.tec',          email:'soluman.tec@gmail.com',                   company:'PT Sumber Sarana Solusindo',       level:'Engineer',      position:'Software Test',          status:'Active' },
  { id:26, name:'Wulan',               accountId:'wara',                 email:'wara@sssolusindo.com',                    company:'BM Essence Darmawangsa Apartment', level:'Viewer',        position:'Viewer',                 status:'Active' },
  { id:27, name:'Yohanes',             accountId:'supervisor1',          email:'supervisor1@sssolusindo.com',             company:'PT Sumber Sarana Solusindo',       level:'Supervisor',    position:'Supervisor',             status:'Active' },
  { id:28, name:'Yohanes (Teknisi)',   accountId:'teknisi7',             email:'teknisi7@sssolusindo.com',               company:'PT Sumber Sarana Solusindo',       level:'Technician',    position:'Engineer',               status:'Active' },
])
// ── Filters ───────────────────────────────────────────────────
const filters = ref({ company:'', status:'', level:'' })
const search  = ref('')
const page    = ref(1)

const hasFilters = computed(() => filters.value.company || filters.value.status || filters.value.level || search.value)
function resetFilters() { filters.value={company:'',status:'',level:''}; search.value=''; page.value=1 }

const filteredUsers = computed(() => {
  let list = users.value
  if(filters.value.company) {
    const cLabel = COMPANIES.find(c=>c.key===filters.value.company)?.label
    if(cLabel) list = list.filter(u => u.company===cLabel)
  }
  if(filters.value.status) list = list.filter(u => u.status===filters.value.status)
  if(filters.value.level)  list = list.filter(u => u.level===filters.value.level)
  if(search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.accountId.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length/PER_PAGE)))
const pagedUsers = computed(() => filteredUsers.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))

// ── CRUD (Admin only) ─────────────────────────────────────────
const showModal   = ref(false)
const showDelete  = ref(false)
const editMode    = ref(false)
const editingId   = ref<number|null>(null)
const deleteTarget = ref<any>(null)

const form = ref({ name:'', accountId:'', email:'', password:'', company:'', level:'', position:'', status:'Active' })

const isFormValid = computed(() =>
  form.value.name && form.value.accountId && form.value.email &&
  form.value.company && form.value.level &&
  (editMode.value || form.value.password.length >= 8)
)

function openCreate() {
  editMode.value=false; editingId.value=null
  form.value = { name:'',accountId:'',email:'',password:'',company:'',level:'',position:'',status:'Active' }
  showModal.value=true
}
function openEdit(user:any) {
  editMode.value=true; editingId.value=user.id
  form.value = { name:user.name, accountId:user.accountId, email:user.email, password:'', company:user.company, level:user.level, position:user.position, status:user.status }
  showModal.value=true
}
function saveUser() {
  if(!isFormValid.value) return
  if(editMode.value && editingId.value) {
    const idx = users.value.findIndex(u=>u.id===editingId.value)
    if(idx>=0) users.value[idx]={ ...users.value[idx], ...form.value }
  } else {
    users.value.push({ id:Date.now(), name:form.value.name, accountId:form.value.accountId, email:form.value.email, company:form.value.company, level:form.value.level, position:form.value.position, status:form.value.status })
  }
  showModal.value=false
}
function confirmDelete(user:any) { deleteTarget.value=user; showDelete.value=true }
function deleteUser() {
  if(deleteTarget.value) users.value=users.value.filter(u=>u.id!==deleteTarget.value.id)
  showDelete.value=false; deleteTarget.value=null
}
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
