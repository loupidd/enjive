/**
 * Server-Sent Events bus.
 *
 * Keeps a Set of active SSE reply streams and broadcasts
 * typed events to all connected clients (or optionally to a
 * single site — "EDA" | "NFP" | "BOTH").
 *
 * Events emitted:
 *   wo:status   { id, code, status, changedBy }
 *   trouble:status { id, code, status, changedBy }
 *   wo:created  { id, code, equipmentId }
 *   trouble:created { id, code, equipmentId }
 *   upload:done { entityType, entityId, url }
 */

export type SSEEvent =
  | {
      type: "wo:status";
      payload: { id: string; code: string; status: string; changedBy: string };
    }
  | {
      type: "wo:created";
      payload: { id: string; code: string; equipmentId: string };
    }
  | {
      type: "trouble:status";
      payload: { id: string; code: string; status: string; changedBy: string };
    }
  | {
      type: "trouble:created";
      payload: { id: string; code: string; equipmentId: string };
    }
  | {
      type: "upload:done";
      payload: { entityType: string; entityId: string; url: string };
    }
  | { type: "ping"; payload: { ts: number } };

interface Subscriber {
  reply: any; // FastifyReply with raw stream access
  userId: string;
  userSite: string;
}

class EventsBus {
  private subs = new Set<Subscriber>();

  add(sub: Subscriber) {
    this.subs.add(sub);
  }

  remove(sub: Subscriber) {
    this.subs.delete(sub);
  }

  get size() {
    return this.subs.size;
  }

  broadcast(event: SSEEvent, site?: string) {
    const msg = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
    for (const sub of this.subs) {
      // site filter: BOTH users always receive; otherwise match site
      if (site && sub.userSite !== "BOTH" && sub.userSite !== site) continue;
      try {
        sub.reply.raw.write(msg);
      } catch {
        this.subs.delete(sub);
      }
    }
  }
}

export const eventsBus = new EventsBus();

// Ping all clients every 25s to keep connections alive through nginx/proxies
setInterval(() => {
  eventsBus.broadcast({ type: "ping", payload: { ts: Date.now() } });
}, 25_000);
