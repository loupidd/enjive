<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <!-- Dialog -->
        <div
          class="relative bg-surface-800 border border-white/10 rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]"
          :class="[maxWidthClass]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 class="text-base font-semibold text-slate-100">{{ title }}</h2>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              @click="emit('update:modelValue', false)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-white/5">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
  title: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const maxWidthClass = computed(() => ({
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
}[props.maxWidth ?? "md"]));
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
