<template>
  <button
    class="flex items-center gap-1.5 rounded-lg border transition-colors"
    :class="[
      compact ? 'p-1.5 justify-center' : 'text-xs px-2.5 py-1.5',
      locale === 'id'
        ? 'bg-denim-700/40 border-denim-600/40 text-denim-200/60 hover:text-white hover:border-denim-500/60'
        : 'bg-caramel/10 border-caramel/20 text-caramel hover:bg-caramel/20',
    ]"
    :title="locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'"
    @click="toggle"
  >
    <!-- Globe icon — always shown -->
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      />
    </svg>
    <!-- Label — hidden when compact -->
    <span v-if="!compact" class="font-bold tracking-wide text-[11px]">
      {{ locale === "id" ? "ID" : "EN" }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from "@/i18n";

defineProps<{ compact?: boolean }>();

const { locale, setLocale } = useI18n();
function toggle() {
  setLocale(locale.value === "id" ? "en" : "id");
}
</script>
