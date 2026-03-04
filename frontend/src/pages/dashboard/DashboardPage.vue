<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div><h2 class="text-xl font-bold text-white">Dashboard</h2><div class="accent-bar mt-1.5"/></div>
      <select class="input max-w-[220px] text-sm"><option>PT Sumber Sarana Solusindo</option></select>
    </div>
    <!-- Donut row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card flex flex-col items-center py-4">
        <DonutChart :data="classYear"/><LegendRow :data="classYear"/>
        <p class="text-[11px] text-denim-200/60 mt-2 text-center">Tasks Classification in Year (2026)</p>
      </div>
      <div class="card flex flex-col items-center py-4">
        <DonutChart :data="classLastMonth"/><LegendRow :data="classLastMonth"/>
        <p class="text-[11px] text-denim-200/60 mt-2 text-center">Tasks Classification Last Month (Feb 2026)</p>
      </div>
      <div class="card flex flex-col items-center py-4">
        <DonutChart :data="classThisMonth"/><LegendRow :data="classThisMonth"/>
        <p class="text-[11px] text-denim-200/60 mt-2 text-center">Tasks Classification This Month (Mar 2026)</p>
      </div>
    </div>
    <!-- Bar row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card py-3"><BarChart :data="statusYear"/><p class="text-[11px] text-denim-200/60 mt-2 text-center">Tasks Status in Year (2026)</p></div>
      <div class="card py-3"><BarChart :data="statusLastMonth"/><p class="text-[11px] text-denim-200/60 mt-2 text-center">Tasks Status Last Month (Feb 2026)</p></div>
      <div class="card py-3"><BarChart :data="statusThisMonth"/><p class="text-[11px] text-denim-200/60 mt-2 text-center">Tasks Status This Month (Mar 2026)</p></div>
    </div>
    <!-- Trouble + Top + AI -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="card border border-red-500/20">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>Active Trouble Reports</h3>
          <RouterLink to="/trouble" class="text-xs text-caramel hover:underline">View all →</RouterLink>
        </div>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="t in activeTroubles" :key="t.id" class="flex items-start gap-3 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
            <div class="w-1.5 h-8 rounded-full shrink-0 mt-0.5" :class="sevCol(t.severity)"/>
            <div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">{{t.name}}</p><p class="text-xs text-denim-200/50 truncate">{{t.equipment}} · <span class="text-red-400">{{t.days}}d open</span></p></div>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0" :class="sPill(t.status)">{{t.status}}</span>
          </div>
          <p v-if="!activeTroubles.length" class="text-xs text-denim-200/40 text-center py-6">No active troubles</p>
        </div>
      </div>
      <div class="card">
        <h3 class="text-sm font-semibold text-white mb-3">Down Trouble Equipment (2026)</h3>
        <div class="space-y-3">
          <div v-for="(eq,i) in topTroubled" :key="eq.name" class="flex items-center gap-3">
            <span class="text-xs font-bold text-denim-200/30 w-4 shrink-0 text-right">{{i+1}}</span>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between text-xs mb-1"><span class="text-slate-300 truncate text-[11px]">{{eq.name}}</span><span class="text-caramel font-bold ml-2 shrink-0">{{eq.count}}x</span></div>
              <div class="h-1.5 bg-white/5 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" :class="i===0?'bg-red-500':i===1?'bg-orange-400':'bg-caramel/70'" :style="{width:`${(eq.count/topTroubled[0].count)*100}%`}"/></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card border border-caramel/10 bg-gradient-to-br from-denim-800/60 to-denim-900/80">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-8 h-8 rounded-lg bg-caramel/15 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFC677" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          </div>
          <div><p class="text-xs font-bold text-caramel">EnJive Assistant</p><p class="text-[10px] text-denim-200/40">AI · Live Analysis</p></div>
        </div>
        <div class="space-y-2">
          <p v-for="line in aiLines" :key="line" class="text-xs text-denim-100/70 leading-relaxed bg-white/5 rounded-lg px-3 py-2">{{line}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const DonutChart = {
  props: ['data'],
  setup(props: any) {
    const S=160,CX=80,CY=80,R=58,SW=24,C=2*Math.PI*R
    const total=computed(()=>props.data.reduce((a:number,d:any)=>a+d.value,0))
    const slices=computed(()=>{let off=0;return props.data.map((d:any)=>{const dash=total.value?(d.value/total.value)*C:0;const s={...d,dash,gap:C-dash,offset:off};off+=dash;return s})})
    return {S,CX,CY,R,SW,C,slices,total}
  },
  template:`<div class="relative" :style="{width:S+'px',height:S+'px'}">
    <svg :width="S" :height="S" :viewBox="'0 0 '+S+' '+S" style="transform:rotate(-90deg)">
      <circle :cx="CX" :cy="CY" :r="R" fill="none" stroke="rgba(255,255,255,0.06)" :stroke-width="SW"/>
      <circle v-for="(s,i) in slices" :key="i" :cx="CX" :cy="CY" :r="R" fill="none" :stroke="s.color" :stroke-width="SW" :stroke-dasharray="s.dash+' '+(C-s.dash)" :stroke-dashoffset="-s.offset" stroke-linecap="butt"/>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-bold text-white">{{total}}</span>
      <span class="text-[10px] text-denim-200/40">Total</span>
    </div>
  </div>`
}

const LegendRow = {
  props:['data'],
  template:`<div class="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 px-2">
    <div v-for="d in data" :key="d.label" class="flex items-center gap-1 text-[10px] text-denim-100/60">
      <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{background:d.color}"/>{{d.label}} {{d.value}}
    </div>
  </div>`
}

const BarChart = {
  props:['data'],
  setup(props:any){const max=computed(()=>Math.max(...props.data.map((d:any)=>d.value),1));return{max}},
  template:`<div class="flex items-end justify-around gap-px px-1" style="height:100px">
    <div v-for="d in data" :key="d.label" class="flex flex-col items-center flex-1 min-w-0">
      <span class="text-[9px] font-mono mb-0.5 truncate w-full text-center" :style="{color:d.value?d.color:'rgba(255,255,255,0.2)'}">{{d.value||'0'}}</span>
      <div class="w-full flex items-end justify-center" style="height:64px">
        <div class="w-full max-w-[20px] rounded-t-sm" :style="{height:d.value?Math.max((d.value/max)*60,3)+'px':'2px',background:d.value?d.color:'rgba(255,255,255,0.05)',transition:'height 0.6s'}"/>
      </div>
      <div class="text-[8px] text-denim-200/30 text-center mt-0.5 leading-tight" style="writing-mode:vertical-rl;transform:rotate(180deg);height:36px;overflow:hidden">{{d.label}}</div>
    </div>
  </div>`
}

const COLORS={preventive:'#3b82f6',certification:'#a855f7',corrective:'#22c55e',predictive:'#f97316'}
const classYear=[{label:'Preventive',value:1551,color:COLORS.preventive},{label:'Certification',value:5,color:COLORS.certification},{label:'Corrective',value:0,color:COLORS.corrective},{label:'Predictive',value:0,color:COLORS.predictive}]
const classLastMonth=[{label:'Preventive',value:853,color:COLORS.preventive},{label:'Certification',value:2,color:COLORS.certification},{label:'Corrective',value:0,color:COLORS.corrective},{label:'Predictive',value:0,color:COLORS.predictive}]
const classThisMonth=[{label:'Preventive',value:28,color:COLORS.preventive},{label:'Certification',value:0,color:COLORS.certification},{label:'Corrective',value:0,color:COLORS.corrective},{label:'Predictive',value:0,color:COLORS.predictive}]

const SC:Record<string,string>={'Waiting':'#6b7280','Reject':'#ef4444','Process':'#FFC677','Reporting':'#f59e0b','Review':'#3b82f6','Client Spv Review':'#8b5cf6','Chief Eng Review':'#06b6d4','Finish':'#22c55e'}
const SL=['Waiting','Reject','Process','Reporting','Review','Client Spv Review','Chief Eng Review','Finish']
const mk=(v:number[])=>SL.map((l,i)=>({label:l,value:v[i]??0,color:SC[l]}))
const statusYear=mk([572,0,153,0,1,0,36,794])
const statusLastMonth=mk([117,0,151,0,0,0,31,556])
const statusThisMonth=mk([5,0,0,0,1,0,5,17])

const activeTroubles=[
  {id:1,name:'AC Compressor Failure',equipment:'EDA_AC_FUNC_ROOM_1',severity:'HIGH',status:'ALERT',days:3},
  {id:2,name:'Genset tidak mau start',equipment:'EDA_GEN_B2_001',severity:'CRITICAL',status:'OPEN',days:7},
  {id:3,name:'Pompa air bocor',equipment:'EDA_PUMP_P1_003',severity:'MEDIUM',status:'OPEN',days:1},
]
const topTroubled=[{name:'AC Function Room',count:8},{name:'Genset B2',count:5},{name:'Panel Listrik Lt.3',count:4},{name:'CCTV Lobby Utama',count:3},{name:'Pompa Air Bersih',count:2}]
const aiLines=[
  '⚠️ 3 active trouble reports. Genset B2 down 7 days — escalation recommended.',
  '📊 PM compliance this month: 28 tasks (vs 853 last month). Review schedule urgently.',
  '💡 AC Function Room highest failure rate (8x/year). Recommend full inspection.',
]
const sevColor=(s:string)=>({CRITICAL:'bg-red-500',HIGH:'bg-orange-400',MEDIUM:'bg-yellow-400',LOW:'bg-green-400'}[s]??'bg-slate-400')
const sevColor2=(s:string)=>sevColor(s) // alias for template
function sevCol(s:string){return sevColor(s)}
const sPill=(s:string)=>s==='ALERT'?'bg-red-500/20 text-red-400':s==='OPEN'?'bg-yellow-400/20 text-yellow-300':'bg-green-500/20 text-green-400'
function sevC(s:string){return sevColor(s)}
const sevC2=sevC
// fix template refs
const sevColor_=sevColor
</script>
