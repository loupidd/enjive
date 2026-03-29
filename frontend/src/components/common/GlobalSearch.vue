<template>
  <div class="relative" ref="rootEl">
    <!-- Input -->
    <div class="relative flex items-center">
      <Search :size="14" class="absolute left-3 text-denim-200/40 pointer-events-none z-10"/>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="input pl-9 pr-8 py-2 text-sm w-full"
        :class="open && suggestions.length ? 'rounded-b-none' : ''"
        autocomplete="off"
        @focus="open=true"
        @keydown.escape="close"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectIndex(highlighted)"
      />
      <button v-if="query" class="absolute right-3 text-denim-200/30 hover:text-white transition-colors z-10" @click="clear">
        <X :size="13"/>
      </button>
    </div>

    <!-- Dropdown -->
    <Transition name="search-drop">
      <div v-if="open && (suggestions.length || (query.length >= 2 && !suggestions.length))"
        class="absolute top-full left-0 right-0 z-50 bg-denim-800 border border-denim-600/50 border-t-0 rounded-b-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
      >
        <!-- Results -->
        <div v-if="suggestions.length">
          <div v-for="(group, gi) in groupedSuggestions" :key="group.category">
            <div class="px-3 py-1.5 text-[10px] font-bold text-denim-200/30 uppercase tracking-widest bg-denim-900/40 border-b border-denim-700/20">
              {{ group.category }}
            </div>
            <button
              v-for="(item, idx) in group.items" :key="item.id"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-denim-700/40 transition-colors border-b border-denim-700/10 last:border-0"
              :class="flatIndex(gi, idx) === highlighted ? 'bg-denim-700/40' : ''"
              @mouseenter="highlighted = flatIndex(gi, idx)"
              @click="selectItem(item)"
            >
              <!-- Icon -->
              <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :class="item.iconBg">
                <component :is="item.icon" :size="13" :class="item.iconColor"/>
              </div>
              <!-- Text -->
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-white truncate" v-html="highlight(item.primary, query)"/>
                <p class="text-[10px] text-denim-200/40 truncate">{{ item.secondary }}</p>
              </div>
              <!-- Tag -->
              <span v-if="item.badge" class="text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0" :class="item.badgeClass">
                {{ item.badge }}
              </span>
              <ChevronRight :size="12" class="text-denim-200/20 shrink-0"/>
            </button>
          </div>
        </div>

        <!-- No results -->
        <div v-else class="px-4 py-6 text-center">
          <SearchX :size="20" class="text-denim-200/20 mx-auto mb-2"/>
          <p class="text-xs text-denim-200/30">No results for "<span class="text-white">{{ query }}</span>"</p>
          <p v-if="closestMatch" class="text-[11px] text-caramel/60 mt-1">
            Did you mean <button class="text-caramel underline" @click="query=closestMatch">{{ closestMatch }}</button>?
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X, ChevronRight, SearchX, Cpu, ClipboardList, AlertTriangle, BarChart2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  placeholder?: string
  sources?: ('equipment' | 'workorders' | 'trouble')[]
}>(), {
  placeholder: 'Search equipment, tasks, trouble reports...',
  sources: () => ['equipment', 'workorders', 'trouble'],
})

const emit = defineEmits<{ select: [item: any] }>()

const router   = useRouter()
const query    = ref('')
const open     = ref(false)
const highlighted = ref(-1)
const rootEl   = ref<HTMLElement | null>(null)
const inputEl  = ref<HTMLInputElement | null>(null)

// ── Static search data — replace with API calls when backend ready ──
const EQUIPMENT_DATA = [
  { id:'EDA_AC_001',   name:'AC Lobby',           type:'AC Fasilitas',   location:'Lantai 1',   status:'Active' },
  { id:'EDA_AC_002',   name:'AC Function Room',   type:'AC Fasilitas',   location:'Lantai 2',   status:'Active' },
  { id:'EDA_GEN_001',  name:'Genset B2',           type:'Genset',         location:'Basement 2', status:'Active' },
  { id:'EDA_GEN_002',  name:'Genset Rooftop',      type:'Genset',         location:'Rooftop',    status:'Active' },
  { id:'EDA_PUMP_001', name:'Pompa Air Bersih',    type:'Pompa',          location:'Basement 1', status:'Active' },
  { id:'EDA_PUMP_003', name:'Pompa Transfer',      type:'Pompa',          location:'Basement 1', status:'Active' },
  { id:'EDA_PNL_001',  name:'Panel MDP B2',        type:'Panel Listrik',  location:'Basement 2', status:'Active' },
  { id:'EDA_PNL_002',  name:'Panel Lt.3',           type:'Panel Listrik',  location:'Lantai 3',   status:'Active' },
  { id:'EDA_CCTV_001', name:'CCTV Lobby Utama',    type:'CCTV',           location:'Lobby',      status:'Active' },
  { id:'EDA_FA_001',   name:'FA Panel Utama',       type:'Fire Alarm',     location:'Basement 1', status:'Active' },
  { id:'EDA_LIFT_001', name:'Lift Servis B1',       type:'Lift',           location:'Basement 1', status:'Active' },
  { id:'EDA_LIFT_002', name:'Lift Penumpang 1',     type:'Lift',           location:'Lobby',      status:'Active' },
]
const WO_DATA = [
  { id:'WO-2026-0001', equipment:'EDA_AC_001',   type:'Preventive',   status:'Waiting'  },
  { id:'WO-2026-0002', equipment:'EDA_GEN_001',  type:'Preventive',   status:'Process'  },
  { id:'WO-2026-0003', equipment:'EDA_PUMP_003', type:'Corrective',   status:'Reporting'},
  { id:'WO-2026-0004', equipment:'EDA_PNL_001',  type:'Thermography Investigation', status:'Review' },
  { id:'WO-2026-0007', equipment:'EDA_LIFT_001', type:'Preventive',   status:'Finish'   },
]
const TROUBLE_DATA = [
  { id:'TBL-2026-01', name:'AC Compressor Failure', equipment:'EDA_AC_002', status:'OPEN'   },
  { id:'TBL-2026-02', name:'Genset tidak mau start', equipment:'EDA_GEN_001',status:'OPEN'   },
  { id:'TBL-2026-03', name:'Pompa air bocor',        equipment:'EDA_PUMP_001',status:'CLOSED' },
]

// ── Fuzzy helpers ─────────────────────────────────────────────
function normalize(s: string) { return s.toLowerCase().replace(/[-_\s]/g,'') }

// Levenshtein distance for typo suggestions
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({length:m+1}, (_,i) => Array(n+1).fill(0).map((_,j) => i===0?j:j===0?i:0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

function matches(haystack: string, needle: string): boolean {
  const h = normalize(haystack), n = normalize(needle)
  return h.includes(n) || levenshtein(h.slice(0, n.length+2), n) <= 1
}

// Highlight matching text
function highlight(text: string, q: string): string {
  if(!q) return text
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi')
  return text.replace(re, '<mark class="bg-caramel/30 text-caramel rounded-sm px-0.5">$1</mark>')
}

// ── Suggestions ───────────────────────────────────────────────
const suggestions = computed((): any[] => {
  const q = query.value.trim()
  if(q.length < 2) return []
  const results: any[] = []

  if(props.sources.includes('equipment')) {
    EQUIPMENT_DATA.filter(e => matches(e.id, q) || matches(e.name, q) || matches(e.type, q))
      .slice(0, 4).forEach(e => results.push({
        id: e.id, category:'Equipment', primary: e.name, secondary: `${e.id} · ${e.type} · ${e.location}`,
        badge: e.status, badgeClass: 'bg-green-500/15 text-green-400',
        icon: Cpu, iconBg:'bg-caramel/10', iconColor:'text-caramel',
        route: `/equipment/detail/${e.id}`,
      }))
  }
  if(props.sources.includes('workorders')) {
    WO_DATA.filter(w => matches(w.id, q) || matches(w.equipment, q) || matches(w.type, q))
      .slice(0, 3).forEach(w => results.push({
        id: w.id, category:'Work Orders', primary: w.id, secondary: `${w.equipment} · ${w.type}`,
        badge: w.status, badgeClass: 'bg-caramel/15 text-caramel',
        icon: ClipboardList, iconBg:'bg-blue-500/10', iconColor:'text-blue-400',
        route: `/work-orders/${w.id}`,
      }))
  }
  if(props.sources.includes('trouble')) {
    TROUBLE_DATA.filter(t => matches(t.id, q) || matches(t.name, q) || matches(t.equipment, q))
      .slice(0, 3).forEach(t => results.push({
        id: t.id, category:'Trouble Reports', primary: t.name, secondary: `${t.id} · ${t.equipment}`,
        badge: t.status, badgeClass: t.status==='OPEN'?'bg-red-500/15 text-red-400':'bg-green-500/15 text-green-400',
        icon: AlertTriangle, iconBg:'bg-red-500/10', iconColor:'text-red-400',
        route: `/trouble`,
      }))
  }
  return results
})

// Group by category
const groupedSuggestions = computed(() => {
  const groups: Record<string, any[]> = {}
  suggestions.value.forEach(item => {
    if(!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return Object.entries(groups).map(([category, items]) => ({ category, items }))
})

// Flat index for keyboard nav
function flatIndex(gi: number, idx: number) {
  let n = 0
  for(let i=0; i<gi; i++) n += groupedSuggestions.value[i].items.length
  return n + idx
}

// Closest typo suggestion
const closestMatch = computed(() => {
  const q = normalize(query.value)
  if(!q || suggestions.value.length) return ''
  let best = '', bestDist = 3
  const candidates = [
    ...EQUIPMENT_DATA.map(e => e.name),
    ...EQUIPMENT_DATA.map(e => e.id),
    ...WO_DATA.map(w => w.id),
    ...TROUBLE_DATA.map(t => t.name),
  ]
  candidates.forEach(c => {
    const nc = normalize(c)
    const d = levenshtein(q, nc.slice(0, Math.max(q.length, nc.length)))
    if(d < bestDist) { bestDist=d; best=c }
  })
  return best
})

// ── Keyboard nav ──────────────────────────────────────────────
function moveDown() {
  const max = suggestions.value.length - 1
  highlighted.value = highlighted.value >= max ? 0 : highlighted.value + 1
}
function moveUp() {
  highlighted.value = highlighted.value <= 0 ? suggestions.value.length - 1 : highlighted.value - 1
}
function selectIndex(idx: number) {
  const item = suggestions.value[idx]
  if(item) selectItem(item)
  else if(query.value) router.push({ path:'/equipment', query:{ q:query.value } })
}
function selectItem(item: any) {
  emit('select', item)
  router.push(item.route)
  close()
}
function clear() { query.value=''; open.value=false; highlighted.value=-1; inputEl.value?.focus() }
function close() { open.value=false; highlighted.value=-1 }

// ── Click outside ─────────────────────────────────────────────
function handleClickOutside(e: MouseEvent) {
  if(rootEl.value && !rootEl.value.contains(e.target as Node)) close()
}
onMounted(()   => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

watch(query, () => { highlighted.value=-1; open.value=true })
</script>

<style scoped>
.search-drop-enter-active { transition: all 0.12s ease; }
.search-drop-leave-active { transition: all 0.08s ease; }
.search-drop-enter-from, .search-drop-leave-to { opacity:0; transform:translateY(-4px); }
</style>
