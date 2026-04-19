<template>
  <div class="space-y-0">
    <div
      v-if="!items.length"
      class="py-6 text-center text-xs text-denim-200/25"
    >
      {{ t("common.noData") }}
    </div>
    <div v-for="(ev, i) in items" :key="i" class="flex gap-3">
      <!-- Dot + line -->
      <div class="flex flex-col items-center">
        <div
          class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
          :class="ev.color || 'bg-denim-500'"
        />
        <div
          v-if="i < items.length - 1"
          class="flex-1 w-px bg-denim-700/40 my-1"
        />
      </div>
      <!-- Content -->
      <div class="pb-4 min-w-0 flex-1">
        <p class="text-xs font-semibold text-white">{{ ev.label }}</p>
        <p class="text-[10px] text-denim-200/40 mt-0.5">
          {{ ev.date }} · {{ ev.by }}
        </p>
        <p
          v-if="ev.note"
          class="text-[10px] text-denim-200/50 mt-1 bg-denim-800/50 rounded px-2 py-1"
        >
          {{ ev.note }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "@/i18n";
const { t } = useI18n();

defineProps<{
  items: {
    label: string;
    color?: string;
    date: string;
    by: string;
    note?: string;
  }[];
}>();
</script>
