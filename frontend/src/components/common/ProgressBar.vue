<template>
  <div class="w-full">
    <div v-if="label || showValue" class="flex justify-between items-center mb-1.5">
      <span v-if="label" class="text-xs text-slate-400">{{ label }}</span>
      <span v-if="showValue" class="text-xs font-mono text-slate-400">{{ Math.round(clampedValue) }}%</span>
    </div>
    <div
      class="w-full rounded-full overflow-hidden"
      :class="[trackClass, sizeClass]"
    >
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="barClass"
        :style="{ width: `${clampedValue}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  value: number;
  label?: string;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}>();

const clampedValue = computed(() => Math.max(0, Math.min(100, props.value)));

const BAR_COLORS: Record<string, string> = {
  default: "bg-brand-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  info:    "bg-cyan-500",
};

const SIZE_MAP: Record<string, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const barClass = computed(() => BAR_COLORS[props.variant ?? "default"]);
const trackClass = computed(() => "bg-white/5");
const sizeClass = computed(() => SIZE_MAP[props.size ?? "md"]);
</script>
