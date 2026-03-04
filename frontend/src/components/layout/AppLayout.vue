<template>
  <div class="flex h-screen overflow-hidden bg-surface-950 relative">
    <!-- ── Grain overlay (full app) ──────────────────────── -->
    <div class="grain-overlay pointer-events-none" />

    <!-- ── Sidebar ───────────────────────────────────────── -->
    <aside
      class="sidebar relative flex flex-col shrink-0 bg-denim-500 z-30 transition-all duration-300 ease-in-out"
      :class="collapsed ? 'w-[60px]' : 'w-[220px]'"
    >
      <!-- Diagonal texture pattern -->
      <div class="sidebar-texture pointer-events-none" />

      <!-- Logo -->
      <div
        class="flex items-center h-16 border-b border-white/5 px-3 overflow-hidden"
      >
        <div class="flex items-center gap-3 min-w-0">
          <!-- Logo — file at src/assets/enjive-mark.png -->
          <div
            class="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-0.5"
          >
            <img
              src="@/assets/enjive-mark.png"
              alt="EnJive"
              width="28"
              height="28"
              class="rounded-md object-contain w-full h-full"
            />
          </div>
          <Transition name="label-fade">
            <div v-if="!collapsed" class="min-w-0 overflow-hidden">
              <span
                class="text-white font-bold tracking-tight text-[15px] leading-tight block whitespace-nowrap"
                >EnJive</span
              >
              <span
                class="text-caramel/60 text-[9px] font-semibold leading-tight tracking-[0.2em] uppercase block whitespace-nowrap"
                >by TripleS</span
              >
            </div>
          </Transition>
        </div>
      </div>

      <!-- Nav items -->
      <nav
        class="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2"
      >
        <NavItem
          v-for="item in NAV_MAIN"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          :label="item.label"
          :collapsed="collapsed"
          :badge="item.badge"
        />

        <!-- Divider -->
        <div class="py-3 px-1">
          <div class="h-px bg-white/5" />
        </div>

        <NavItem
          v-for="item in NAV_ADMIN"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          :label="item.label"
          :collapsed="collapsed"
        />
      </nav>

      <!-- User footer -->
      <div class="border-t border-white/5 p-2">
        <div
          class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group overflow-hidden"
          @click="auth.logout()"
        >
          <div
            class="w-7 h-7 rounded-full bg-caramel flex items-center justify-center text-[11px] font-bold text-denim-950 shrink-0"
          >
            {{ initials }}
          </div>
          <Transition name="label-fade">
            <div v-if="!collapsed" class="flex-1 min-w-0 overflow-hidden">
              <p
                class="text-xs font-semibold text-white truncate leading-tight"
              >
                {{ auth.fullName || "User" }}
              </p>
              <p class="text-[10px] text-denim-200/40 truncate leading-tight">
                {{ auth.user?.role ?? "TECHNICIAN" }}
              </p>
            </div>
          </Transition>
          <Transition name="label-fade">
            <IconLogOut
              v-if="!collapsed"
              :size="13"
              class="text-denim-200/30 group-hover:text-denim-200/60 shrink-0 transition-colors"
            />
          </Transition>
        </div>
      </div>

      <!-- Collapse toggle -->
      <button
        class="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-denim-600 border border-denim-500/60 flex items-center justify-center shadow-lg hover:bg-denim-500 transition-colors z-10"
        @click="collapsed = !collapsed"
      >
        <IconChevronLeft
          :size="12"
          class="text-denim-200/70 transition-transform duration-300"
          :class="collapsed ? 'rotate-180' : ''"
        />
      </button>
    </aside>

    <!-- ── Main area ─────────────────────────────────────── -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header
        class="h-16 shrink-0 flex items-center px-5 border-b border-white/5 bg-denim-900/60 backdrop-blur-md relative z-10"
      >
        <div class="flex items-center gap-3">
          <div class="h-4 w-px bg-caramel/40 rounded-full" />
          <h1 class="text-sm font-semibold text-white/80 tracking-wide">
            {{ routeLabel }}
          </h1>
        </div>
        <div class="ml-auto flex items-center gap-4">
          <span class="text-[11px] text-denim-200/35 font-medium">{{
            today
          }}</span>
          <!-- Notification dot placeholder -->
          <div
            class="w-7 h-7 rounded-lg bg-denim-700/50 flex items-center justify-center relative cursor-pointer hover:bg-denim-700 transition-colors"
          >
            <IconBell :size="13" class="text-denim-200/50" />
            <span
              class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-caramel"
            />
          </div>
        </div>
      </header>

      <!-- Page content with route transition -->
      <main class="flex-1 overflow-y-auto p-5 relative">
        <!-- Subtle mesh gradient bg -->
        <div class="main-bg-mesh pointer-events-none" />
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterView, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import NavItem from "@/components/layout/NavItem.vue";
import {
  IconChevronLeft,
  IconLogOut,
  IconDashboard,
  IconCalendar,
  IconClipboard,
  IconAlertTriangle,
  IconBarChart,
  IconCpu,
  IconActivity,
  IconUsers,
  IconBuilding,
  IconBell,
} from "@/components/icons";

const auth = useAuthStore();
const route = useRoute();
const collapsed = ref(false);

const NAV_MAIN = [
  { to: "/dashboard", icon: IconDashboard, label: "Dashboard" },
  { to: "/schedule", icon: IconCalendar, label: "Schedule" },
  { to: "/work-orders", icon: IconClipboard, label: "Task" },
  { to: "/trouble", icon: IconAlertTriangle, label: "Trouble", badge: 3 },
  { to: "/reports", icon: IconBarChart, label: "Graph" },
  { to: "/equipment", icon: IconCpu, label: "Equipment" },
  { to: "/activities", icon: IconActivity, label: "Activity" },
];

const NAV_ADMIN = [
  { to: "/users", icon: IconUsers, label: "Users" },
  { to: "/companies", icon: IconBuilding, label: "Site" },
];

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/work-orders": "Task",
  "/trouble": "Trouble Reports",
  "/reports": "Graph",
  "/equipment": "Equipment",
  "/activities": "Activity",
  "/users": "Users",
  "/companies": "Site",
};

const routeLabel = computed(() => {
  const p = route.path;
  if (p.startsWith("/equipment/detail")) return "Equipment Detail";
  if (p.startsWith("/equipment/type")) return "Equipment List";
  if (p.startsWith("/work-orders/")) return "Work Order Detail";
  return ROUTE_LABELS[p] ?? "";
});

const initials = computed(() => {
  const u = auth.user;
  if (!u) return "U";
  return (
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "U"
  );
});

const today = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
);

// Logo: place your PNG at /public/assets/logo/enjive-mark.png
</script>

<style scoped>
/* ── Sidebar diagonal texture ─────────────────────── */
.sidebar-texture {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    rgba(255, 255, 255, 0.012) 8px,
    rgba(255, 255, 255, 0.012) 9px
  );
  pointer-events: none;
}

/* ── Full-app grain ───────────────────────────────── */
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.4;
  mix-blend-mode: overlay;
}

/* ── Main bg mesh gradient ────────────────────────── */
.main-bg-mesh {
  position: fixed;
  top: 0;
  right: 0;
  width: 60vw;
  height: 60vh;
  background:
    radial-gradient(
      ellipse at 80% 10%,
      rgba(2, 49, 78, 0.4) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 20% 80%,
      rgba(255, 198, 119, 0.04) 0%,
      transparent 50%
    );
  pointer-events: none;
  z-index: 0;
}

/* ── Page route transition ────────────────────────── */
.page-enter-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.page-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Sidebar label fade ───────────────────────────── */
.label-fade-enter-active {
  transition:
    opacity 0.2s ease 0.1s,
    max-width 0.3s ease;
  max-width: 200px;
}
.label-fade-leave-active {
  transition:
    opacity 0.1s ease,
    max-width 0.2s ease;
}
.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
  max-width: 0;
}
</style>
