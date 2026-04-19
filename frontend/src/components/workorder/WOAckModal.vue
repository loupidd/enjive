<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div
            class="px-5 py-4 border-b border-denim-700/40 flex items-center justify-between"
          >
            <h3 class="font-bold text-white text-sm">{{ title }}</h3>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
              @click="$emit('update:modelValue', false)"
            >
              ✕
            </button>
          </div>
          <div class="p-5 space-y-4">
            <!-- Status transition preview -->
            <div class="flex items-center gap-3 justify-center py-2">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-semibold bg-denim-600/40 text-denim-200"
              >
                {{ currentStatus }}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                class="text-denim-200/40"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span
                class="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-500/20 text-green-400"
              >
                {{ nextStatus }}
              </span>
            </div>
            <div>
              <label class="label">{{ t("workOrder.notes") }}</label>
              <textarea
                :value="note"
                @input="
                  $emit(
                    'update:note',
                    ($event.target as HTMLTextAreaElement).value,
                  )
                "
                class="input resize-none"
                rows="3"
                :placeholder="t('common.note') + ' (optional)'"
              />
            </div>
            <div class="flex gap-2">
              <button
                class="btn-danger flex-1 justify-center"
                @click="$emit('reject')"
              >
                {{ t("workOrder.reject") }}
              </button>
              <button
                class="btn-primary flex-1 justify-center"
                @click="$emit('approve')"
              >
                {{ t("workOrder.approve") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from "@/i18n";
const { t } = useI18n();

defineProps<{
  modelValue: boolean;
  title: string;
  currentStatus: string;
  nextStatus: string;
  note: string;
}>();

defineEmits<{
  "update:modelValue": [v: boolean];
  "update:note": [v: string];
  approve: [];
  reject: [];
}>();
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
