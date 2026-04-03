<template>
  <div class="space-y-4" id="wo-screen">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-1.5 text-sm text-caramel hover:text-caramel/80 transition-colors" @click="router.back()">
          <IconArrowLeft :size="14" stroke-width="2.5"/> Back
        </button>
        <div class="h-4 w-px bg-denim-600/50"/>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-bold text-white font-mono">{{ wo.id }}</h2>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold" :class="TYPE_COLORS.get(wo.type) ?? 'bg-denim-600/40 text-denim-200'">{{ wo.type }}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold" :class="STATUS_COLORS.get(wo.status) ?? 'bg-denim-600/40 text-denim-200'">{{ wo.status }}</span>
          </div>
          <p class="text-[11px] text-denim-200/40 mt-0.5 font-mono">{{ wo.equipmentId }} · {{ wo.interval }} · {{ wo.startDate }}</p>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button v-if="canEdit && wo.status !== 'Finish'" class="btn-secondary gap-1.5 text-xs px-3" @click="showEditWO=true">
          <IconPencil :size="13"/> Edit
        </button>
        <button v-if="canPrint" class="btn-secondary gap-1.5 text-xs px-3" @click="printReport">
          <IconPrint :size="13"/> Print Report
        </button>
        <button v-if="canACK" class="btn-primary gap-1.5 text-xs px-3" @click="showACK=true">
          <IconCheck :size="13"/> {{ ackLabel }}
        </button>
      </div>
    </div>

    <!-- ── Progress pipeline ────────────────────────────────── -->
    <div class="card p-3 overflow-x-auto">
      <div class="flex items-center gap-0 min-w-max">
        <template v-for="(stage, i) in PIPELINE" :key="stage.key">
          <div class="flex flex-col items-center px-3 min-w-[68px]">
            <div class="w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-all"
              :class="isReached(stage.key)
                ? (wo.status===stage.key ? stage.activeBg+' ring-2 ring-offset-1 ring-offset-denim-800 '+stage.ring : stage.doneBg)
                : 'bg-denim-700/30'"
            >
              <IconCheck v-if="isDone(stage.key)" :size="12" class="text-white"/>
              <div v-else-if="wo.status===stage.key" class="w-2 h-2 rounded-full animate-pulse" :class="stage.dotColor"/>
              <div v-else class="w-2 h-2 rounded-full bg-denim-600"/>
            </div>
            <span class="text-[9px] text-center leading-tight whitespace-nowrap"
              :class="wo.status===stage.key ? stage.textColor : isReached(stage.key) ? 'text-denim-200/50' : 'text-denim-200/20'"
            >{{ stage.label }}</span>
            <span v-if="wo.status===stage.key" class="text-[8px] text-caramel/50 mt-0.5 font-semibold">NOW</span>
          </div>
          <div v-if="i < PIPELINE.length-1" class="h-px flex-1 min-w-[12px]"
            :class="isReached(stage.key) && isReached(PIPELINE[i+1].key) ? 'bg-caramel/30' : 'bg-denim-700/25'"
          />
        </template>
      </div>
    </div>

    <!-- ── Guided step banner (for technician) ──────────────── -->
    <!-- Read-only notice for review/approval stages -->
    <div v-if="!isWorkerEditable && !['Finish','Reject'].includes(wo.status)" class="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
      <div class="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
        <IconFileText :size="13" class="text-blue-400"/>
      </div>
      <div class="flex-1">
        <p class="text-xs font-semibold text-blue-300">Review Mode — <span class="font-normal text-blue-300/70">This work order is pending {{ wo.status }}. You can view but not edit the report content.</span></p>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full font-bold" :class="STATUS_COLORS.get(wo.status) ?? ''">{{ wo.status }}</span>
    </div>

    <!-- Completed notice -->
    <div v-if="['Finish','Reject'].includes(wo.status)" class="flex items-center gap-3 px-4 py-3 rounded-xl border" :class="wo.status==='Finish' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'">
      <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0" :class="wo.status==='Finish' ? 'bg-green-500/15' : 'bg-red-500/15'">
        <IconCheckCircle v-if="wo.status==='Finish'" :size="13" class="text-green-400"/>
        <IconX v-else :size="13" class="text-red-400"/>
      </div>
      <p class="text-xs font-semibold" :class="wo.status==='Finish' ? 'text-green-300' : 'text-red-300'">
        {{ wo.status==='Finish' ? 'Work Order Completed — This report is finalized and read-only.' : 'Work Order Rejected — This report is archived.' }}
      </p>
    </div>

    <div v-if="currentStep && isWorkerEditable" class="flex items-center gap-3 px-4 py-3 rounded-xl border" :class="currentStep.bannerClass">
      <component :is="currentStep.icon" :size="18" :class="currentStep.iconClass"/>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold" :class="currentStep.titleClass">Step {{ currentStep.num }}: {{ currentStep.title }}</p>
        <p class="text-xs opacity-70 mt-0.5">{{ currentStep.hint }}</p>
      </div>
      <span class="text-[10px] font-bold opacity-50 shrink-0">{{ currentStep.num }}/{{ STEPS.length }}</span>
    </div>

    <!-- ── Main 2-col ───────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- LEFT: WO Info + Equipment + Workers + Timeline -->
      <div class="space-y-4">

        <!-- WO Info card -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center gap-2">
            <IconClipboard :size="14" class="text-caramel/60"/>
            <h3 class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Work Order</h3>
          </div>
          <div class="divide-y divide-denim-700/10">
            <div v-for="row in woInfoRows" :key="row.label" class="flex px-4 py-2 gap-3">
              <span class="text-[11px] text-denim-200/35 w-24 shrink-0">{{ row.label }}</span>
              <span class="text-[11px] flex-1 font-medium">
                <span v-if="row.badge" class="px-1.5 py-0.5 rounded text-[10px] font-semibold" :class="row.badge">{{ row.value }}</span>
                <span v-else :class="row.mono ? 'font-mono text-caramel' : 'text-white'">{{ row.value || '—' }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Equipment quick ref -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <IconCpu :size="14" class="text-caramel/60"/>
              <h3 class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Equipment</h3>
            </div>
            <RouterLink :to="`/equipment/detail/${wo.equipmentId}`" class="text-[10px] text-caramel hover:underline">View →</RouterLink>
          </div>
          <div class="px-4 py-3 space-y-1.5 text-[11px]">
            <div class="flex justify-between"><span class="text-denim-200/35">ID</span><span class="font-mono text-caramel font-semibold">{{ wo.equipmentId }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/35">Name</span><span class="text-white">{{ wo.equipmentName }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/35">Type</span><span class="text-white">{{ wo.equipmentType }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/35">Location</span><span class="text-white">{{ wo.location }}</span></div>
          </div>
        </div>

        <!-- Linked Trouble (corrective only) -->
        <div v-if="wo.troubleId" class="card p-0 overflow-hidden border border-orange-500/20">
          <div class="px-4 py-3 border-b border-orange-500/10 flex items-center gap-2">
            <IconAlertTriangle :size="14" class="text-orange-400"/>
            <h3 class="text-xs font-semibold text-orange-300/60 uppercase tracking-wide">Linked Trouble</h3>
          </div>
          <div class="px-4 py-3 space-y-1.5 text-[11px]">
            <div class="flex justify-between"><span class="text-denim-200/35">ID</span><span class="font-mono text-orange-400 font-semibold">{{ wo.troubleId }}</span></div>
            <div class="flex justify-between"><span class="text-denim-200/35">Name</span><span class="text-white">{{ wo.troubleName }}</span></div>
          </div>
        </div>

        <!-- Workers -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center gap-2">
            <IconUsers :size="14" class="text-caramel/60"/>
            <h3 class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Workers</h3>
          </div>
          <div class="divide-y divide-denim-700/10">
            <div v-for="w in wo.workers" :key="w.name" class="flex items-center gap-3 px-4 py-2.5">
              <div class="w-7 h-7 rounded-full bg-caramel/15 flex items-center justify-center text-[10px] font-bold text-caramel shrink-0">
                {{ w.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2) }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-medium text-white truncate">{{ w.name }}</p>
                <p class="text-[10px] text-denim-200/35">{{ w.position }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Timeline -->
        <div class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center gap-2">
            <IconClock :size="14" class="text-caramel/60"/>
            <h3 class="text-xs font-semibold text-denim-200/50 uppercase tracking-wide">Timeline</h3>
          </div>
          <div class="px-4 py-4">
            <div class="relative pl-5">
              <div class="absolute left-1.5 top-2 bottom-2 w-px bg-denim-600/20"/>
              <div v-for="(ev, i) in wo.timeline" :key="i" class="relative mb-4 last:mb-0">
                <div class="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-denim-800" :class="ev.color"/>
                <p class="text-xs font-semibold text-white">{{ ev.label }}</p>
                <p class="text-[10px] text-denim-200/40 mt-0.5">{{ ev.date }} · {{ ev.by }}</p>
                <p v-if="ev.note" class="text-[10px] text-denim-200/25 mt-1 italic bg-denim-700/10 rounded px-2 py-1">{{ ev.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Step-by-step work area -->
      <div class="lg:col-span-2 space-y-4">

        <!-- ── STEP 1: Activities Checklist ────────────────── -->
        <div class="card p-0 overflow-hidden" :class="isWorkerEditable && activeWorkStep===1 ? 'ring-1 ring-caramel/30' : ''">
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                :class="completedCount===wo.activities.length && wo.activities.length > 0 ? 'bg-green-500 text-white' : 'bg-denim-700 text-denim-200/60'"
              >{{ completedCount===wo.activities.length && wo.activities.length > 0 ? '✓' : '1' }}</div>
              <h3 class="text-xs font-semibold text-denim-200/60 uppercase tracking-wide">
                {{ ACTIVITY_LABEL.get(wo.type) ?? 'Activities' }}
              </h3>
            </div>
            <span class="text-[11px]" :class="completedCount===wo.activities.length && wo.activities.length>0 ? 'text-green-400' : 'text-denim-200/35'">
              {{ completedCount }}/{{ wo.activities.length }}
            </span>
          </div>
          <!-- Progress bar -->
          <div class="h-0.5 bg-denim-700/20">
            <div class="h-full bg-caramel transition-all duration-500"
              :style="{width: wo.activities.length ? (completedCount/wo.activities.length*100)+'%' : '0%'}"/>
          </div>

          <!-- Thermography: image-based upload per item -->
          <div v-if="wo.type==='Thermography Investigation'" class="divide-y divide-denim-700/10">
            <div v-for="(act, i) in wo.activities" :key="act.id" class="px-4 py-4">
              <div class="flex items-start gap-3">
                <span class="text-[10px] text-denim-200/25 w-5 text-right shrink-0 mt-1">{{ i+1 }}</span>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-semibold text-white">{{ act.name }}</p>
                    <span class="text-[9px] px-1.5 py-0.5 rounded" :class="ACT_TYPE_COLORS.get(act.type) ?? 'bg-denim-600/30 text-denim-200'">{{ act.type }}</span>
                  </div>
                  <!-- Thermal image upload + temperature reading -->
                  <div class="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label class="text-[10px] text-denim-200/40 mb-1 block">Before (thermal image)</label>
                      <label v-if="isWorkerEditable && !act.imgBefore" class="aspect-video border-2 border-dashed border-denim-700/40 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-caramel/30 transition-colors">
                        <IconImage :size="18" class="text-denim-200/20 mb-1"/>
                        <span class="text-[10px] text-denim-200/30">Upload</span>
                        <input type="file" accept="image/*" class="hidden" @change="e=>setThermImg(act,'imgBefore',e)"/>
                      </label>
                      <div v-else-if="act.imgBefore" class="aspect-video rounded-lg overflow-hidden relative group">
                        <img :src="act.imgBefore" class="w-full h-full object-cover"/>
                        <button v-if="isWorkerEditable" class="absolute top-1 right-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" @click="act.imgBefore=''">
                          <IconX :size="9" class="text-white"/>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="text-[10px] text-denim-200/40 mb-1 block">After (thermal image)</label>
                      <label v-if="isWorkerEditable && !act.imgAfter" class="aspect-video border-2 border-dashed border-denim-700/40 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-caramel/30 transition-colors">
                        <IconImage :size="18" class="text-denim-200/20 mb-1"/>
                        <span class="text-[10px] text-denim-200/30">Upload</span>
                        <input type="file" accept="image/*" class="hidden" @change="e=>setThermImg(act,'imgAfter',e)"/>
                      </label>
                      <div v-else-if="act.imgAfter" class="aspect-video rounded-lg overflow-hidden relative group">
                        <img :src="act.imgAfter" class="w-full h-full object-cover"/>
                        <button v-if="isWorkerEditable" class="absolute top-1 right-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" @click="act.imgAfter=''">
                          <IconX :size="9" class="text-white"/>
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Temp reading -->
                  <div class="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <label class="text-[10px] text-denim-200/40 mb-1 block">Max Temp (°C)</label>
                      <input v-model="act.tempMax" type="number" step="0.1" class="input text-xs py-1" :disabled="!isWorkerEditable" placeholder="0.0"/>
                    </div>
                    <div>
                      <label class="text-[10px] text-denim-200/40 mb-1 block">Delta T (°C)</label>
                      <input v-model="act.deltaT" type="number" step="0.1" class="input text-xs py-1" :disabled="!isWorkerEditable" placeholder="0.0"/>
                    </div>
                    <div>
                      <label class="text-[10px] text-denim-200/40 mb-1 block">Result</label>
                      <select v-model="act.finalResult" class="input text-xs py-1" :disabled="!isWorkerEditable" @change="markDone(act)">
                        <option value="">—</option><option>Normal</option><option>Warning</option><option>Critical</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-2">
                    <label class="text-[10px] text-denim-200/40 mb-1 block">Finding / Remarks</label>
                    <input v-model="act.note" class="input text-xs py-1" :disabled="!isWorkerEditable" placeholder="Describe findings..."/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preventive / Corrective / Predictive: table checklist -->
          <div v-else>
            <!-- Column headers -->
            <div class="grid text-[10px] font-semibold text-denim-200/30 uppercase tracking-wide border-b border-denim-700/15 px-4 py-2 gap-2"
              style="grid-template-columns:2rem 1fr 6rem 7rem 7rem 3.5rem">
              <span>#</span><span>Activity</span><span>Type</span>
              <span class="text-center">Before</span><span class="text-center">After</span><span class="text-center">Unit</span>
            </div>
            <div class="divide-y divide-denim-700/8">
              <div v-for="(act, i) in wo.activities" :key="act.id"
                class="grid px-4 py-3 gap-2 items-center transition-colors"
                style="grid-template-columns:2rem 1fr 6rem 7rem 7rem 3.5rem"
                :class="act.done ? 'bg-green-500/3' : ''"
              >
                <!-- Number + check -->
                <div class="flex flex-col items-center gap-1">
                  <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
                    :class="act.done ? 'bg-caramel border-caramel' : 'border-denim-600'"
                  >
                    <IconCheck v-if="act.done" :size="10" class="text-denim-950"/>
                    <span v-else class="text-[9px] text-denim-200/30">{{ i+1 }}</span>
                  </div>
                </div>
                <!-- Name -->
                <div>
                  <p class="text-xs font-medium text-white">{{ act.name }}</p>
                  <p v-if="act.optimum" class="text-[10px] text-denim-200/30 mt-0.5">Optimum: {{ act.optimum }}{{ act.unit }}</p>
                </div>
                <!-- Type badge -->
                <span class="text-[9px] px-1.5 py-0.5 rounded self-start mt-0.5" :class="ACT_TYPE_COLORS.get(act.type) ?? 'bg-denim-600/30 text-denim-200'">{{ act.type }}</span>
                <!-- Before (pre inspection) -->
                <div>
                  <template v-if="isWorkerEditable && !act.done">
                    <input v-if="act.answerType==='Quantitative'" v-model="act.preInspection" type="number" class="input text-xs py-1 w-full" :placeholder="act.optimum||'value'"/>
                    <select v-else v-model="act.preInspection" class="input text-xs py-1 w-full">
                      <option value="">—</option><option>OK</option><option>Not OK</option><option>NA</option>
                    </select>
                  </template>
                  <span v-else class="text-xs" :class="act.preInspection?'text-white':'text-denim-200/20'">{{ act.preInspection||'—' }}</span>
                </div>
                <!-- After (final result) + done button -->
                <div class="flex items-center gap-1">
                  <div class="flex-1">
                    <template v-if="isWorkerEditable && !act.done">
                      <input v-if="act.answerType==='Quantitative'" v-model="act.finalResult" type="number" class="input text-xs py-1 w-full" :placeholder="act.optimum||'value'"/>
                      <select v-else v-model="act.finalResult" class="input text-xs py-1 w-full">
                        <option value="">—</option><option>OK</option><option>Not OK</option><option>NA</option>
                      </select>
                    </template>
                    <span v-else class="text-xs font-semibold" :class="act.finalResult==='OK'?'text-green-400':act.finalResult==='Not OK'?'text-red-400':act.finalResult?'text-caramel':'text-denim-200/20'">{{ act.finalResult||'—' }}</span>
                  </div>
                  <button v-if="isWorkerEditable && !act.done && act.finalResult" class="w-6 h-6 rounded-full bg-caramel/20 hover:bg-caramel/40 flex items-center justify-center transition-colors shrink-0" @click="markDone(act)" title="Mark done">
                    <IconCheck :size="11" class="text-caramel"/>
                  </button>
                  <button v-if="isWorkerEditable && act.done" class="w-5 h-5 flex items-center justify-center text-denim-200/20 hover:text-red-400 transition-colors shrink-0" @click="act.done=false" title="Undo">
                    <IconX :size="9"/>
                  </button>
                </div>
                <!-- Unit -->
                <span class="text-[10px] text-denim-200/30 text-center">{{ act.unit||'—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── STEP 2: Work Report ──────────────────────────── -->
        <div class="card p-0 overflow-hidden"
          :class="[isWorkerEditable && activeWorkStep===2 ? 'ring-1 ring-caramel/30' : '', isWorkerEditable && activeWorkStep < 2 ? 'opacity-50 pointer-events-none' : '']"
        >
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                :class="wo.workReport ? 'bg-green-500 text-white' : 'bg-denim-700 text-denim-200/60'"
              >{{ wo.workReport ? '✓' : '2' }}</div>
              <h3 class="text-xs font-semibold text-denim-200/60 uppercase tracking-wide">Maintenance Report</h3>
            </div>
            <span v-if="wo.workReport" class="text-[10px] text-green-400 flex items-center gap-1">
              <IconCheckCircle :size="11"/> Submitted
            </span>
            <span v-else-if="isWorkerEditable && activeWorkStep < 2" class="text-[10px] text-denim-200/30">Complete activities first</span>
          </div>
          <div class="px-4 py-4 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Duration (hours)</label>
                <input v-model="workReportForm.duration" type="number" step="0.1" class="input text-sm" :disabled="!isWorkerEditable||!!wo.workReport" placeholder="0.0"/>
              </div>
              <div>
                <label class="label">Equipment Status</label>
                <select v-model="workReportForm.healthy" class="input text-sm" :disabled="!isWorkerEditable||!!wo.workReport">
                  <option value="">Select…</option>
                  <option>Optimum</option><option>Minor Issue</option><option>Critical</option><option>Down</option>
                </select>
              </div>
            </div>
            <div>
              <label class="label">Condition After Work</label>
              <textarea v-model="workReportForm.condition" class="input resize-none" rows="2" :disabled="!isWorkerEditable||!!wo.workReport" placeholder="Describe equipment condition..."/>
            </div>
            <div>
              <label class="label">Work Summary</label>
              <textarea v-model="workReportForm.summary" class="input resize-none" rows="2" :disabled="!isWorkerEditable||!!wo.workReport" placeholder="What was done..."/>
            </div>

            <!-- Found trouble toggle -->
            <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-denim-700/30 bg-denim-900/30">
              <button class="w-10 h-5 rounded-full transition-all relative shrink-0" :class="workReportForm.hasTrouble?'bg-red-500':'bg-denim-600'" :disabled="!isWorkerEditable||!!wo.workReport" @click="workReportForm.hasTrouble=!workReportForm.hasTrouble">
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" :class="workReportForm.hasTrouble?'left-5':'left-0.5'"/>
              </button>
              <div class="flex-1">
                <p class="text-xs font-medium text-white">Found Trouble During Work</p>
                <p class="text-[10px] text-denim-200/35">Creates a linked Trouble Report</p>
              </div>
              <span v-if="workReportForm.hasTrouble" class="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                <IconAlertTriangle :size="11"/> Will create TR
              </span>
            </div>

            <div v-if="isWorkerEditable && !wo.workReport" class="flex justify-end">
              <button class="btn-primary gap-1.5 text-xs" @click="submitReport">
                <IconCheck :size="13"/> Submit Report
              </button>
            </div>
          </div>
        </div>

        <!-- ── STEP 3: Documentation (photos) ──────────────── -->
        <div class="card p-0 overflow-hidden"
          :class="isWorkerEditable && activeWorkStep < 3 ? 'opacity-50 pointer-events-none' : ''"
        >
          <div class="px-4 py-3 border-b border-denim-700/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                :class="wo.photos.length > 0 ? 'bg-green-500 text-white' : 'bg-denim-700 text-denim-200/60'"
              >{{ wo.photos.length > 0 ? '✓' : '3' }}</div>
              <h3 class="text-xs font-semibold text-denim-200/60 uppercase tracking-wide">Documentation</h3>
            </div>
            <label v-if="isWorkerEditable" class="text-[10px] text-caramel hover:underline flex items-center gap-1 cursor-pointer">
              <IconPlus :size="11"/> Add Photo
              <input type="file" accept="image/*" multiple class="hidden" @change="addPhotos"/>
            </label>
          </div>
          <div class="p-4">
            <div v-if="wo.photos.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div v-for="(photo, i) in wo.photos" :key="i" class="relative group">
                <div class="aspect-video bg-denim-900/60 rounded-lg overflow-hidden border border-denim-700/30">
                  <img :src="photo.url" class="w-full h-full object-cover"/>
                </div>
                <input v-model="photo.note" class="input text-xs mt-1.5 py-1" :placeholder="'Note for photo '+(i+1)" :disabled="!isWorkerEditable"/>
                <button v-if="isWorkerEditable" class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" @click="wo.photos.splice(i,1)">
                  <IconX :size="9" class="text-white"/>
                </button>
              </div>
            </div>
            <div v-else-if="isWorkerEditable"
              class="border-2 border-dashed border-denim-700/30 rounded-xl p-8 text-center cursor-pointer hover:border-caramel/25 transition-colors"
              @click="($refs.photoInput as HTMLElement)?.click()"
            >
              <IconImage :size="22" class="text-denim-200/15 mx-auto mb-2"/>
              <p class="text-xs text-denim-200/25">Click or drag photos here</p>
              <p class="text-[10px] text-denim-200/15 mt-1">Each photo can have a note attached</p>
            </div>
            <p v-else class="text-xs text-denim-200/20 text-center py-4">No documentation uploaded</p>
            <input ref="photoInput" type="file" accept="image/*" multiple class="hidden" @change="addPhotos"/>
          </div>
        </div>

      </div>
    </div>

    <!-- ── ACK Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showACK" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showACK=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md">
            <div class="px-5 py-4 border-b border-denim-700/40 flex items-center justify-between">
              <h3 class="font-bold text-white text-sm">{{ ackLabel }}</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showACK=false"><IconX :size="14"/></button>
            </div>
            <div class="p-5 space-y-4">
              <div class="flex items-center gap-3 justify-center py-2">
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold" :class="STATUS_COLORS.get(wo.status)">{{ wo.status }}</span>
                <IconChevronRight :size="16" class="text-denim-200/40"/>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold" :class="STATUS_COLORS.get(nextStatus) ?? 'bg-green-500/20 text-green-400'">{{ nextStatus }}</span>
              </div>
              <div>
                <label class="label">Note / Remark</label>
                <textarea v-model="ackNote" class="input resize-none" rows="3" placeholder="Optional remark..."/>
              </div>
              <div class="flex gap-2">
                <button class="btn-danger flex-1 justify-center" @click="rejectWO">Reject</button>
                <button class="btn-primary flex-1 justify-center" @click="approveWO">Approve</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Edit WO Modal ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditWO" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showEditWO=false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-lg">
            <div class="px-5 py-4 border-b border-denim-700/40 flex items-center justify-between">
              <h3 class="font-bold text-white text-sm">Edit Work Order</h3>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50" @click="showEditWO=false"><IconX :size="14"/></button>
            </div>
            <div class="p-5 space-y-3">
              <div>
                <label class="label">Technician Coordinator</label>
                <select v-model="wo.technician" class="input text-sm">
                  <option v-for="t in TECHNICIANS" :key="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="label">Start Date</label>
                <input v-model="wo.startDate" type="date" class="input text-sm"/>
              </div>
              <div>
                <label class="label">Work Order Note</label>
                <textarea v-model="wo.noteWO" class="input resize-none" rows="2"/>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button class="btn-secondary text-xs" @click="showEditWO=false">Cancel</button>
                <button class="btn-primary text-xs" @click="showEditWO=false">Save</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Print report — teleported to body so @media print body>* works correctly -->
    <Teleport to="body">
      <div id="print-report">
        <PrintReport :wo="wo" :workReportForm="workReportForm"/>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter, useRoute, RouterLink } from "vue-router"
import {
  IconArrowLeft, IconPencil, IconPrint, IconCheck, IconCheckCircle,
  IconClipboard, IconCpu, IconActivity, IconFileText, IconClock,
  IconAlertTriangle, IconExternalLink, IconUsers, IconImage,
  IconPlus, IconX, IconChevronRight
} from "@/components/icons"
import PrintReport from "@/components/print/PrintReport.vue"

const router = useRouter()
const route  = useRoute()
const woId   = route.params.id as string

// ── O(1) Maps ─────────────────────────────────────────────────
const STATUS_COLORS = new Map([
  ["Waiting","bg-slate-500/20 text-slate-300"],["Process","bg-caramel/20 text-caramel"],
  ["Reporting","bg-yellow-400/20 text-yellow-300"],["Review","bg-blue-500/20 text-blue-400"],
  ["Client Spv Review","bg-purple-500/20 text-purple-400"],["Chief Eng Review","bg-cyan-500/20 text-cyan-400"],
  ["Finish","bg-green-500/20 text-green-400"],["Reject","bg-red-500/20 text-red-400"],
])
const TYPE_COLORS = new Map([
  ["Preventive","bg-blue-500/15 text-blue-300"],["Corrective","bg-orange-500/15 text-orange-300"],
  ["Predictive","bg-green-500/15 text-green-300"],["Thermography Investigation","bg-purple-500/15 text-purple-300"],
])
const ACT_TYPE_COLORS = new Map([
  ["Cleaning","bg-blue-500/15 text-blue-300"],["Measurement","bg-yellow-500/15 text-yellow-300"],
  ["Visual","bg-cyan-500/15 text-cyan-300"],["Function Test","bg-green-500/15 text-green-300"],
  ["Replacement","bg-red-500/15 text-red-300"],["Thermographic Investigation","bg-purple-500/15 text-purple-300"],
  ["Adjustment","bg-orange-500/15 text-orange-300"],["Addition","bg-denim-500/30 text-denim-200"],
])

// Activity section label by type
const ACTIVITY_LABEL = new Map([
  ["Preventive","Activity Checklist"],["Corrective","Corrective Activities"],
  ["Predictive","Predictive Checks"],["Thermography Investigation","Thermographic Survey"],
])

// Classification → default activities
const DEFAULT_ACTIVITIES: Record<string, any[]> = {
  "Preventive": [
    { id:1, name:"Visual Inspection",     type:"Visual",        answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:2, name:"Cleaning",              type:"Cleaning",      answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:3, name:"Function Test",         type:"Function Test", answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:4, name:"Parameter Measurement", type:"Measurement",   answerType:"Quantitative", unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
  ],
  "Corrective": [
    { id:1, name:"Identify Root Cause",   type:"Visual",        answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:2, name:"Repair / Replacement",  type:"Replacement",   answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:3, name:"Function Test Post-Repair", type:"Function Test", answerType:"Qualitative", unit:"", optimum:"", preInspection:"", finalResult:"", done:false },
    { id:4, name:"Final Measurement",     type:"Measurement",   answerType:"Quantitative", unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
  ],
  "Predictive": [
    { id:1, name:"Vibration Measurement", type:"Measurement",   answerType:"Quantitative", unit:"mm/s", optimum:"", preInspection:"", finalResult:"", done:false },
    { id:2, name:"Temperature Check",     type:"Measurement",   answerType:"Quantitative", unit:"°C",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:3, name:"Oil Analysis",          type:"Measurement",   answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
    { id:4, name:"Condition Assessment",  type:"Visual",        answerType:"Qualitative",  unit:"",   optimum:"", preInspection:"", finalResult:"", done:false },
  ],
  "Thermography Investigation": [
    { id:1, name:"Hot Point #1", type:"Thermographic Investigation", answerType:"Qualitative", unit:"°C", optimum:"", imgBefore:"", imgAfter:"", tempMax:"", deltaT:"", finalResult:"", note:"", done:false },
  ],
}

// ── Pipeline ───────────────────────────────────────────────────
const PIPELINE = [
  { key:"Waiting",           label:"Waiting",    activeBg:"bg-slate-500",  doneBg:"bg-slate-500/40",  ring:"ring-slate-400",  dotColor:"bg-slate-400",  textColor:"text-slate-300" },
  { key:"Process",           label:"Process",    activeBg:"bg-caramel",    doneBg:"bg-caramel/40",    ring:"ring-caramel",    dotColor:"bg-caramel",    textColor:"text-caramel" },
  { key:"Reporting",         label:"Reporting",  activeBg:"bg-yellow-400", doneBg:"bg-yellow-400/40", ring:"ring-yellow-400", dotColor:"bg-yellow-400", textColor:"text-yellow-300" },
  { key:"Review",            label:"Review",     activeBg:"bg-blue-500",   doneBg:"bg-blue-500/40",   ring:"ring-blue-500",   dotColor:"bg-blue-400",   textColor:"text-blue-400" },
  { key:"Client Spv Review", label:"Spv Review", activeBg:"bg-purple-500", doneBg:"bg-purple-500/40", ring:"ring-purple-500", dotColor:"bg-purple-400", textColor:"text-purple-400" },
  { key:"Chief Eng Review",  label:"Chief Eng",  activeBg:"bg-cyan-500",   doneBg:"bg-cyan-500/40",   ring:"ring-cyan-500",   dotColor:"bg-cyan-400",   textColor:"text-cyan-400" },
  { key:"Finish",            label:"Finish",     activeBg:"bg-green-500",  doneBg:"bg-green-500/40",  ring:"ring-green-500",  dotColor:"bg-green-400",  textColor:"text-green-400" },
]
const PIPELINE_ORDER = PIPELINE.map(p=>p.key)

// ── Role ───────────────────────────────────────────────────────
const currentRole = ref("TECHNICIAN")
const ACK_RULES = new Map([
  ["Waiting",           { roles:["TECHNICIAN","ADMIN"], next:"Process",           label:"Start Work" }],
  ["Process",           { roles:["TECHNICIAN","ADMIN"], next:"Reporting",         label:"Submit Report" }],
  ["Reporting",         { roles:["LEAD_TECH","ADMIN"],  next:"Review",            label:"Approve Report" }],
  ["Review",            { roles:["CLIENT_SPV","ADMIN"], next:"Client Spv Review", label:"Approve (Spv)" }],
  ["Client Spv Review", { roles:["CLIENT_SPV","ADMIN"], next:"Chief Eng Review",  label:"Approve (Chief Spv)" }],
  ["Chief Eng Review",  { roles:["CHIEF_ENG","ADMIN"],  next:"Finish",            label:"Final Approval" }],
])
const canACK  = computed(() => { const r=ACK_RULES.get(wo.value.status); return !!r&&r.roles.includes(currentRole.value) })
const ackLabel    = computed(() => ACK_RULES.get(wo.value.status)?.label ?? "Approve")
const nextStatus  = computed(() => ACK_RULES.get(wo.value.status)?.next ?? "Finish")
const canEdit     = computed(() => ["ADMIN","PLANNER"].includes(currentRole.value))
const PRINTABLE_STATUSES = new Set(["Review","Client Spv Review","Chief Eng Review","Finish"])
const canPrint    = computed(() => PRINTABLE_STATUSES.has(wo.value.status))
const isWorkerEditable = computed(() => ["TECHNICIAN","LEAD_TECH"].includes(currentRole.value) && ["Process","Waiting"].includes(wo.value.status))

const TECHNICIANS = ["Ahmad Fauzi","Budi Santoso","Citra Dewi","Dodi Prasetyo","Eko Wahyudi"]

// ── WO Data ───────────────────────────────────────────────────
// Mock WO data keyed by ID so different IDs show different types
const WO_MOCK_DATA: Record<string, any> = {
  "WO-2026-0001": { equipmentId:"EDA_AC_001",  equipmentName:"AC Lobby",       equipmentType:"AC Fasilitas",  section:"Air Conditioner", location:"Lantai 1",  type:"Preventive",                interval:"Monthly",  technician:"Ahmad Fauzi",  status:"Waiting",           troubleId:null },
  "WO-2026-0002": { equipmentId:"EDA_GEN_001", equipmentName:"Genset B2",      equipmentType:"Genset",        section:"Genset",           location:"Basement 2",type:"Preventive",                interval:"3 Monthly",technician:"Budi Santoso", status:"Process",           troubleId:null },
  "WO-2026-0003": { equipmentId:"EDA_PUMP_003",equipmentName:"Pompa Transfer", equipmentType:"Pompa",         section:"Pump",             location:"Basement 1",type:"Corrective",                interval:"Once",     technician:"Citra Dewi",   status:"Reporting",         troubleId:"TBL-2026-01" },
  "WO-2026-0004": { equipmentId:"EDA_PNL_001", equipmentName:"Panel MDP B2",   equipmentType:"Panel Listrik", section:"Panel Listrik",    location:"Basement 2",type:"Thermography Investigation",interval:"6 Monthly",technician:"Ahmad Fauzi",  status:"Review",            troubleId:null },
  "WO-2026-0005": { equipmentId:"EDA_AC_002",  equipmentName:"AC Function Room",equipmentType:"AC Fasilitas", section:"Air Conditioner",  location:"Lantai 2",  type:"Preventive",                interval:"Monthly",  technician:"Dodi Prasetyo",status:"Client Spv Review", troubleId:null },
  "WO-2026-0006": { equipmentId:"EDA_CCTV_001",equipmentName:"CCTV Lobby",     equipmentType:"CCTV",          section:"CCTV",             location:"Lobby",     type:"Predictive",                interval:"6 Monthly",technician:"Eko Wahyudi",  status:"Chief Eng Review",  troubleId:null },
  "WO-2026-0007": { equipmentId:"EDA_LIFT_001",equipmentName:"Lift Servis B1", equipmentType:"Lift",          section:"Lift",             location:"Basement 1",type:"Preventive",                interval:"Monthly",  technician:"Budi Santoso", status:"Finish",            troubleId:null },
  "WO-2026-0008": { equipmentId:"EDA_FA_001",  equipmentName:"FA Panel Utama", equipmentType:"Fire Alarm",    section:"Fire Alarm",       location:"Basement 1",type:"Predictive",                interval:"6 Monthly",technician:"Ahmad Fauzi",  status:"Reject",            troubleId:null },
}
const mockBase = WO_MOCK_DATA[woId] ?? WO_MOCK_DATA["WO-2026-0001"]

const wo = ref({
  id:            woId || "WO-2026-0001",
  equipmentId:   mockBase.equipmentId,
  equipmentName: mockBase.equipmentName,
  equipmentType: mockBase.equipmentType,
  section:       mockBase.section,
  location:      mockBase.location,
  type:          mockBase.type,
  interval:      mockBase.interval,
  startDate:     "2026-02-25",
  technician:    mockBase.technician,
  status:        mockBase.status,
  troubleId:     mockBase.troubleId as string|null,
  troubleName:   mockBase.troubleId ? "Pompa Transfer bocor" : null as string|null,
  noteWO:        "Scheduled maintenance work order.",
  workReport:    null as any,
  workers: [
    { name:"Ahmad Fauzi",  position:"Engineer" },
    { name:"Budi Santoso", position:"Engineer" },
  ],
  activities: (DEFAULT_ACTIVITIES[mockBase.type] ?? DEFAULT_ACTIVITIES["Preventive"]).map((a:any)=>({...a})),
  photos:     [] as {url:string,note:string}[],
  timeline: [
    { label:"WO Created", color:"bg-slate-500",  date:"2026-02-25 08:00", by:"System",      note:"" },
    { label:"Started",    color:"bg-caramel",    date:"2026-02-25 09:15", by:"Ahmad Fauzi", note:"" },
  ],
  signatures: [] as any[],
})

// ── Form state ─────────────────────────────────────────────────
const showACK     = ref(false)
const showEditWO  = ref(false)
const ackNote     = ref("")
const workReportForm = ref({ duration:"", healthy:"", condition:"", summary:"", hasTrouble:false })

// ── Guided steps ───────────────────────────────────────────────
const completedCount = computed(() =>
  wo.value.type === "Thermography Investigation"
    ? wo.value.activities.filter(a => a.finalResult && a.finalResult !== "").length
    : wo.value.activities.filter(a => a.done).length
)

const activeWorkStep = computed(() => {
  if (!isWorkerEditable.value) return 0
  if (completedCount.value < wo.value.activities.length) return 1
  if (!wo.value.workReport) return 2
  return 3
})

const STEPS = [
  { num:1, title:"Fill Activities",  hint:"Complete each activity row below — enter values and mark done.", icon:"IconActivity", bannerClass:"bg-caramel/5 border-caramel/20",   iconClass:"text-caramel", titleClass:"text-caramel" },
  { num:2, title:"Submit Report",    hint:"All activities done! Fill in the work report and submit.",      icon:"IconFileText", bannerClass:"bg-blue-500/5 border-blue-500/20", iconClass:"text-blue-400", titleClass:"text-blue-300" },
  { num:3, title:"Add Photos",       hint:"Upload documentation photos with notes.",                       icon:"IconImage",    bannerClass:"bg-green-500/5 border-green-500/20",iconClass:"text-green-400",titleClass:"text-green-300" },
]
const currentStep = computed(() => isWorkerEditable.value ? STEPS[activeWorkStep.value - 1] ?? null : null)

// ── Pipeline helpers ───────────────────────────────────────────
function isReached(key:string) { return PIPELINE_ORDER.indexOf(key)<=PIPELINE_ORDER.indexOf(wo.value.status) }
function isDone(key:string)    { return PIPELINE_ORDER.indexOf(key)<PIPELINE_ORDER.indexOf(wo.value.status) }

// ── Activity actions ───────────────────────────────────────────
function markDone(act:any) { if(act.finalResult) act.done=true }

function addHotPoint() {
  const nextId = Math.max(0, ...wo.value.activities.map((a:any)=>a.id)) + 1
  wo.value.activities.push({
    id: nextId, name:`Hot Point #${nextId}`,
    type:"Thermographic Investigation", answerType:"Qualitative",
    unit:"°C", optimum:"", imgBefore:"", imgAfter:"",
    tempMax:"", deltaT:"", finalResult:"", note:"", done:false
  })
}

async function setThermImg(act:any, field:'imgBefore'|'imgAfter', e:Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if(f) act[field] = await compressImage(f, 800)
}

// ── Report + photos ────────────────────────────────────────────
function submitReport() {
  wo.value.workReport = { ...workReportForm.value, submittedAt:new Date().toLocaleString() }
  wo.value.status = "Reporting"
  wo.value.timeline.push({ label:"Report Submitted", color:"bg-yellow-400", date:new Date().toLocaleString(), by:wo.value.technician, note:workReportForm.value.summary })
}

async function addPhotos(e:Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if(!files.length) return
  const urls = await compressImages(files)
  urls.forEach(url => wo.value.photos.push({ url, note:"" }))
  ;(e.target as HTMLInputElement).value = ""
}

// ── ACK actions ────────────────────────────────────────────────
function approveWO() {
  wo.value.timeline.push({ label:ackLabel.value, color:"bg-green-500", date:new Date().toLocaleString(), by:"Current User", note:ackNote.value })
  wo.value.signatures.push({ role:wo.value.status, name:"Current User", date:new Date().toLocaleDateString(), note:ackNote.value })
  wo.value.status = nextStatus.value
  ackNote.value=""; showACK.value=false
}
function rejectWO() {
  wo.value.timeline.push({ label:"Rejected", color:"bg-red-500", date:new Date().toLocaleString(), by:"Current User", note:ackNote.value })
  wo.value.status = "Reject"
  ackNote.value=""; showACK.value=false
}
function printReport() { window.print() }

onMounted(() => {
  // Auto-trigger print if navigated from task list with ?print=1
  if (route.query.print === '1' && canPrint.value) {
    setTimeout(() => window.print(), 800)
  }
})

// ── WO info rows ───────────────────────────────────────────────
const woInfoRows = computed(() => [
  { label:"WO ID",      value:wo.value.id,         mono:true,  badge:null },
  { label:"Type",       value:wo.value.type,        mono:false, badge:TYPE_COLORS.get(wo.value.type) ?? null },
  { label:"Interval",   value:wo.value.interval,    mono:false, badge:null },
  { label:"Start Date", value:wo.value.startDate,   mono:false, badge:null },
  { label:"Status",     value:wo.value.status,      mono:false, badge:STATUS_COLORS.get(wo.value.status) ?? null },
  { label:"Note",       value:wo.value.noteWO,      mono:false, badge:null },
])
</script>

<style>
/* Screen: hide print report */
#print-report {
  display: none;
  position: fixed;
  top: 0; left: 0;
}

@media print {
  /* Hide everything except the print report */
  body > *:not(#print-report) { display: none !important; }

  #print-report {
    display: block !important;
    position: static !important;
    width: 100%;
    background: #ffffff !important;
  }

  @page {
    size: A4 portrait;
    /* Clean white margins — no black bar */
    margin: 20mm 18mm 22mm 18mm;
    background: #ffffff;
  }

  /* Ensure no dark backgrounds bleed into print */
  html, body, #app, #print-report {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #111111 !important;
    font-size: 9pt !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Kill any dark bg that Tailwind/Vue might apply */
  * { background-color: transparent; }
  .print-doc, .print-doc * { background-color: transparent; }
  .print-doc { background-color: #ffffff !important; }
  .print-th  { background-color: #02314E !important; }
  .print-pill-blue  { background-color: #dbeafe !important; }
  .print-pill-green { background-color: #dcfce7 !important; }
  .print-pill-gray  { background-color: #f1f5f9 !important; }
  .print-note-box   { background-color: #f8fafc !important; }
  .print-sig-card   { background-color: #fafafa !important; }
  .print-table tbody tr:nth-child(even) .print-td { background-color: #f8fafc !important; }
}
</style>
<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .15s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
