/**
 * useSSE — singleton EventSource with session-expiry awareness.
 *
 * When the JWT expires the SSE endpoint returns 401. EventSource
 * doesn't expose HTTP status codes on error, but we detect expiry
 * via the enjive:session-expired custom event fired by the axios
 * interceptor — at that point we permanently stop reconnecting
 * and show "Offline" until the user logs back in.
 */
import { ref, onUnmounted } from "vue";

type Handler = (payload: any) => void;

// ── Singleton state ────────────────────────────────────────────
let es: EventSource | null = null;
const handlers = new Map<string, Set<Handler>>();
const _connected = ref(false);
const _expired = ref(false); // true once session-expired event fires
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getToken(): string | null {
  return localStorage.getItem("enjive:token");
}

function isExpired(): boolean {
  const expiry = Number(localStorage.getItem("enjive:expiry") ?? 0);
  return expiry > 0 && Date.now() > expiry;
}

function connect() {
  if (_expired.value) return; // don't reconnect after expiry
  if (es && es.readyState !== EventSource.CLOSED) return;

  const token = getToken();
  if (!token) return;
  if (isExpired()) {
    _expired.value = true;
    return;
  }

  const url = `/api/v1/events?token=${encodeURIComponent(token)}`;
  es = new EventSource(url);

  es.addEventListener("connected", () => {
    _connected.value = true;
    _expired.value = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  es.addEventListener("ping", () => {
    /* keepalive */
  });

  const EVENT_TYPES = [
    "wo:status",
    "wo:created",
    "trouble:status",
    "trouble:created",
    "upload:done",
  ];
  for (const type of EVENT_TYPES) {
    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        handlers.get(type)?.forEach((h) => h(payload));
      } catch {
        /* malformed event */
      }
    });
  }

  es.onerror = () => {
    _connected.value = false;
    es?.close();
    es = null;
    // Don't reconnect if session has expired
    if (_expired.value) return;
    reconnectTimer = setTimeout(connect, 5000);
  };
}

function disconnect() {
  es?.close();
  es = null;
  _connected.value = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

// Listen for session expiry fired by the axios interceptor
window.addEventListener("enjive:session-expired", () => {
  _expired.value = true;
  _connected.value = false;
  disconnect();
});

// ── Public composable ──────────────────────────────────────────
export function useSSE() {
  connect();

  function on(event: string, handler: Handler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
  }

  function off(event: string, handler: Handler) {
    handlers.get(event)?.delete(handler);
  }

  function subscribe(event: string, handler: Handler) {
    on(event, handler);
    onUnmounted(() => off(event, handler));
  }

  return {
    on,
    off,
    subscribe,
    disconnect,
    connected: _connected,
    expired: _expired,
  };
}
