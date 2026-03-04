<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
    :class="colorClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass" />
    {{ label ?? status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status: string;
  label?: string;
}>();

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  // Work Order
  DRAFT:       { badge: "bg-slate-500/15 text-slate-400",   dot: "bg-slate-400" },
  OPEN:        { badge: "bg-blue-500/15 text-blue-400",     dot: "bg-blue-400" },
  ASSIGNED:    { badge: "bg-violet-500/15 text-violet-400", dot: "bg-violet-400" },
  IN_PROGRESS: { badge: "bg-amber-500/15 text-amber-400",   dot: "bg-amber-400" },
  ON_HOLD:     { badge: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
  COMPLETED:   { badge: "bg-green-500/15 text-green-400",   dot: "bg-green-400" },
  CANCELLED:   { badge: "bg-red-500/15 text-red-400",       dot: "bg-red-400" },
  CLOSED:      { badge: "bg-slate-500/15 text-slate-500",   dot: "bg-slate-500" },
  // Equipment
  OPERATIONAL:       { badge: "bg-green-500/15 text-green-400",   dot: "bg-green-400" },
  UNDER_MAINTENANCE: { badge: "bg-amber-500/15 text-amber-400",   dot: "bg-amber-400" },
  OUT_OF_SERVICE:    { badge: "bg-red-500/15 text-red-400",       dot: "bg-red-400" },
  DECOMMISSIONED:    { badge: "bg-slate-500/15 text-slate-500",   dot: "bg-slate-500" },
  // Trouble
  ACKNOWLEDGED: { badge: "bg-cyan-500/15 text-cyan-400",    dot: "bg-cyan-400" },
  RESOLVED:     { badge: "bg-teal-500/15 text-teal-400",    dot: "bg-teal-400" },
  REJECTED:     { badge: "bg-rose-500/15 text-rose-400",    dot: "bg-rose-400" },
  // Priority
  LOW:      { badge: "bg-slate-500/15 text-slate-400", dot: "bg-slate-400" },
  MEDIUM:   { badge: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  HIGH:     { badge: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
  CRITICAL: { badge: "bg-red-500/15 text-red-400",     dot: "bg-red-400" },
};

const colors = computed(
  () => STATUS_COLORS[props.status] ?? { badge: "bg-slate-500/15 text-slate-400", dot: "bg-slate-400" }
);

const colorClass = computed(() => colors.value.badge);
const dotClass = computed(() => colors.value.dot);
</script>
