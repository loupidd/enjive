import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// ── Global error boundary ─────────────────────────────────────
// Catches unhandled errors from composables and component lifecycle hooks
// that would otherwise produce a blank screen.
app.config.errorHandler = (err, instance, info) => {
  console.error("[EnJive] Unhandled error:", err);
  console.error("[EnJive] Component:", instance?.$options?.name ?? "unknown");
  console.error("[EnJive] Lifecycle hook:", info);

  // Show a user-facing toast via the same event bus used by the API interceptor
  const message =
    err instanceof Error
      ? err.message
      : "An unexpected error occurred. Please refresh the page.";

  window.dispatchEvent(
    new CustomEvent("enjive:toast", {
      detail: { message, type: "error" },
    }),
  );
};

// ── Global warning filter (dev only) ─────────────────────────
// Suppress noisy Vue warnings that are cosmetic in this build
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, _instance, trace) => {
    // Suppress "missing prop" warnings for optional props
    if (
      msg.includes("Extraneous non-props attributes") ||
      msg.includes("Non-function value encountered for default slot")
    )
      return;
    console.warn("[Vue]", msg, trace);
  };
}

// ── Uncaught promise rejections ───────────────────────────────
// Vue's errorHandler doesn't catch rejected promises outside components.
// This catches cases like a composable await that throws after unmount.
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  // Don't surface network errors caused by the user going offline or
  // cancelled requests (axios CancelError) — those are expected.
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (
    msg.includes("Network Error") ||
    msg.includes("Request aborted") ||
    msg.includes("canceled")
  )
    return;

  console.error("[EnJive] Unhandled rejection:", reason);
  window.dispatchEvent(
    new CustomEvent("enjive:toast", {
      detail: {
        message: msg || "An unexpected error occurred.",
        type: "error",
      },
    }),
  );
});

app.mount("#app");
