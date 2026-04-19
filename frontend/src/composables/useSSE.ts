/**
 * useSSE — real-time event subscription via Server-Sent Events.
 *
 * Usage:
 *   const { on, off, connected } = useSSE()
 *   on('wo:status', (payload) => { ... refetch or update local state })
 *   onUnmounted(() => off('wo:status', handler))
 *
 * The SSE connection is a singleton — one EventSource shared across
 * the whole app, opened lazily on first call, kept alive with
 * auto-reconnect (browser does this natively for EventSource).
 */

import { ref, onUnmounted } from "vue";

type Handler = (payload: any) => void;

// ── Singleton connection ───────────────────────────────────────
let es: EventSource | null = null;
const handlers = new Map<string, Set<Handler>>();
const _connected = ref(false);
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getToken(): string | null {
  return localStorage.getItem("enjive:token");
}

function connect() {
  if (es && es.readyState !== EventSource.CLOSED) return;
  const token = getToken();
  if (!token) return;

  // Pass token as query param — EventSource doesn't support headers
  const url = `/api/v1/events?token=${encodeURIComponent(token)}`;
  es = new EventSource(url);

  es.addEventListener("connected", () => {
    _connected.value = true;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  });

  es.addEventListener("ping", () => {
    // keepalive — no action needed
  });

  // Forward all named events to registered handlers
  const eventTypes = ["wo:status","wo:created","trouble:status","trouble:created","upload:done"];
  for (const type of eventTypes) {
    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        handlers.get(type)?.forEach(h => h(payload));
      } catch { /* malformed */ }
    });
  }

  es.onerror = () => {
    _connected.value = false;
    es?.close();
    es = null;
    // Browser EventSource auto-reconnects, but we also schedule a manual one
    reconnectTimer = setTimeout(connect, 5000);
  };
}

function disconnect() {
  es?.close();
  es = null;
  _connected.value = false;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

// ── Public composable ─────────────────────────────────────────
export function useSSE() {
  // Lazy connect on first use
  connect();

  function on(event: string, handler: Handler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
  }

  function off(event: string, handler: Handler) {
    handlers.get(event)?.delete(handler);
  }

  // Convenience: register handler and auto-remove on component unmount
  function subscribe(event: string, handler: Handler) {
    on(event, handler);
    onUnmounted(() => off(event, handler));
  }

  return { on, off, subscribe, disconnect, connected: _connected };
}
