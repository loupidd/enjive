<!--
  ToastBar — lightweight session/error notification.
  Mounts once in AppLayout. Listens for enjive:toast custom events
  and the enjive:session-expired event from the axios interceptor.

  Dispatch a toast from anywhere:
    window.dispatchEvent(new CustomEvent("enjive:toast", {
      detail: { message: "...", type: "error" | "warn" | "info" | "success" }
    }))
-->
<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-sm min-w-[280px] max-w-sm"
        :class="styles[type]"
        role="alert"
      >
        <!-- Icon -->
        <div class="shrink-0">
          <svg
            v-if="type === 'error'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <svg
            v-else-if="type === 'warn'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <svg
            v-else-if="type === 'success'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <p class="text-xs font-medium flex-1 leading-snug">{{ message }}</p>

        <!-- Progress bar -->
        <div
          class="absolute bottom-0 left-0 h-0.5 rounded-b-xl transition-all"
          :class="progressColor[type]"
          :style="{ width: progress + '%' }"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const visible = ref(false);
const message = ref("");
const type = ref<"error" | "warn" | "info" | "success">("info");
const progress = ref(100);

const DURATION = 4000; // ms before auto-dismiss (longer for error)
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;

const styles: Record<string, string> = {
  error: "bg-red-950/90 border-red-500/40 text-red-200",
  warn: "bg-yellow-950/90 border-yellow-500/40 text-yellow-200",
  info: "bg-denim-800/90 border-denim-500/40 text-denim-100",
  success: "bg-green-950/90 border-green-500/40 text-green-200",
};
const progressColor: Record<string, string> = {
  error: "bg-red-500",
  warn: "bg-yellow-400",
  info: "bg-caramel",
  success: "bg-green-400",
};

function show(msg: string, t: typeof type.value = "info", duration = DURATION) {
  // Clear any running timer
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  message.value = msg;
  type.value = t;
  progress.value = 100;
  visible.value = true;

  const step = 100 / (duration / 50);
  progressTimer = setInterval(() => {
    progress.value = Math.max(0, progress.value - step);
  }, 50);

  hideTimer = setTimeout(() => {
    visible.value = false;
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }, duration);
}

// ── Event listeners ────────────────────────────────────────────
function onSessionExpired() {
  show("Your session has expired. Redirecting to login...", "error", 1800);
}

function onToast(e: Event) {
  const { message: msg, type: t } = (e as CustomEvent).detail ?? {};
  show(msg ?? "Something happened", t ?? "info");
}

// Check if the login page left a reason (set by api.ts before redirect)
function checkLoginReason() {
  const reason = sessionStorage.getItem("enjive:logout_reason");
  if (reason) {
    sessionStorage.removeItem("enjive:logout_reason");
    // Show on the login page after mount
    setTimeout(() => show(reason, "warn", 5000), 400);
  }
}

onMounted(() => {
  window.addEventListener("enjive:session-expired", onSessionExpired);
  window.addEventListener("enjive:toast", onToast);
  checkLoginReason();
});

onUnmounted(() => {
  window.removeEventListener("enjive:session-expired", onSessionExpired);
  window.removeEventListener("enjive:toast", onToast);
  if (hideTimer) clearTimeout(hideTimer);
  if (progressTimer) clearInterval(progressTimer);
});
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 16px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.97);
}
</style>
