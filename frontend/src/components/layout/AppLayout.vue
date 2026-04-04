<template>
  <div class="flex h-screen overflow-hidden bg-surface-950 relative">
    <!-- ── Grain overlay (full app) ──────────────────────── -->
    <div class="grain-overlay pointer-events-none" />

    <!-- ── Sidebar ───────────────────────────────────────── -->
    <!-- Mobile overlay when sidebar open -->
    <div
      v-if="!collapsed && isMobile"
      class="fixed inset-0 bg-black/50 z-20 md:hidden"
      @click="collapsed = true"
    />

    <aside
      class="sidebar relative flex flex-col shrink-0 bg-denim-500 z-30 transition-all duration-300 ease-in-out"
      :class="[
        collapsed ? 'w-[60px]' : 'w-[220px]',
        isMobile
          ? collapsed
            ? '-translate-x-full absolute h-full'
            : 'absolute h-full translate-x-0 shadow-2xl'
          : '',
      ]"
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
            class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden p-0.5"
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
      <div class="border-t border-white/5 p-2 space-y-0.5">
        <!-- Profile link -->
        <RouterLink
          to="/profile"
          class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group overflow-hidden"
        >
          <div
            class="w-7 h-7 rounded-full bg-caramel flex items-center justify-center text-[11px] font-bold text-denim-950 shrink-0 overflow-hidden"
          >
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ initials }}</span>
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
        </RouterLink>
        <!-- Logout -->
        <button
          class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors group overflow-hidden w-full"
          @click="auth.logout()"
        >
          <div class="w-7 h-7 flex items-center justify-center shrink-0">
            <IconLogOut
              :size="13"
              class="text-denim-200/25 group-hover:text-red-400 transition-colors"
            />
          </div>
          <Transition name="label-fade">
            <span
              v-if="!collapsed"
              class="text-[11px] text-denim-200/25 group-hover:text-red-400 transition-colors font-medium"
              >Sign Out</span
            >
          </Transition>
        </button>
      </div>

      <!-- Theme toggle — animated pill switch -->
      <div class="px-2 pb-1">
        <button
          class="theme-toggle-btn flex items-center gap-2.5 px-2 py-1.5 rounded-lg w-full group overflow-hidden relative"
          :class="theme.isDark ? 'hover:bg-white/8' : 'hover:bg-white/10'"
          @click="theme.toggle()"
          :title="
            theme.isDark
              ? 'Currently: Dark — click for Light'
              : 'Currently: Light — click for Dark'
          "
        >
          <!-- Animated pill track -->
          <div
            class="theme-track w-9 h-5 rounded-full shrink-0 relative transition-all duration-300 border"
            :class="
              theme.isDark
                ? 'bg-denim-700/60 border-denim-500/40'
                : 'bg-caramel/30 border-caramel/50'
            "
          >
            <!-- Glowing dot -->
            <div
              class="theme-dot absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 flex items-center justify-center"
              :class="
                theme.isDark
                  ? 'left-0.5 bg-denim-400'
                  : 'left-[18px] bg-caramel'
              "
            >
              <!-- Moon (dark mode) -->
              <svg
                v-if="theme.isDark"
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="text-denim-900/70"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <!-- Sun (light mode) -->
              <svg
                v-else
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                class="text-denim-900"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  fill="currentColor"
                  stroke="none"
                />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
              </svg>
            </div>
          </div>
          <Transition name="label-fade">
            <span
              v-if="!collapsed"
              class="text-[11px] font-semibold transition-colors duration-200"
              :class="
                theme.isDark
                  ? 'text-denim-200/45 group-hover:text-denim-200/70'
                  : 'text-caramel/80 group-hover:text-caramel'
              "
            >
              {{ theme.isDark ? "Dark" : "Light" }}
            </span>
          </Transition>
        </button>
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
    <div
      class="flex flex-col flex-1 min-w-0 overflow-hidden"
      :class="isMobile ? 'w-full' : ''"
    >
      <!-- Mobile top bar (hamburger + page title) -->
      <div
        v-if="isMobile"
        class="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-denim-900/60 backdrop-blur-md shrink-0"
      >
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          @click="collapsed = !collapsed"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="text-denim-200/70"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div class="flex items-center gap-2">
          <div
            class="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center overflow-hidden p-0.5"
          >
            <img
              src="@/assets/enjive-mark.png"
              alt="E"
              class="w-full h-full object-contain"
            />
          </div>
          <span class="text-sm font-bold text-white tracking-tight"
            >EnJive</span
          >
        </div>
      </div>

      <!-- Page content with route transition -->
      <main class="flex-1 overflow-y-auto p-5 relative pb-20 md:pb-5">
        <!-- Subtle mesh gradient bg -->
        <div class="main-bg-mesh pointer-events-none" />
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </Transition>
        </RouterView>
      </main>

      <!-- ── Mobile bottom navigation ────────────────────── -->
      <nav
        v-if="isMobile"
        class="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/8 bg-denim-900/95 backdrop-blur-xl px-2 py-1.5 safe-area-bottom"
      >
        <RouterLink
          v-for="item in MOBILE_NAV"
          :key="item.to"
          :to="item.to"
          class="mobile-nav-item flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[52px]"
          :class="
            $route.path.startsWith(item.to)
              ? 'text-caramel'
              : 'text-denim-200/40'
          "
        >
          <div class="relative">
            <component :is="item.icon" :size="20" stroke-width="1.8" />
            <span
              v-if="item.badge"
              class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center"
              >{{ item.badge }}</span
            >
          </div>
          <span class="text-[9px] font-medium leading-none">{{
            item.label
          }}</span>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
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
} from "@/components/icons";
import { useThemeStore } from "@/stores/theme.store";

const auth = useAuthStore();
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

const theme = useThemeStore();

// Mobile detection
const isMobile = ref(window.innerWidth < 768);
function onResize() {
  isMobile.value = window.innerWidth < 768;
}

// Auto-collapse sidebar on mobile
if (isMobile.value) collapsed.value = true;

const MOBILE_NAV = [
  { to: "/dashboard", icon: IconDashboard, label: "Home" },
  { to: "/work-orders", icon: IconClipboard, label: "Tasks" },
  { to: "/trouble", icon: IconAlertTriangle, label: "Trouble", badge: 3 },
  { to: "/equipment", icon: IconCpu, label: "Equipment" },
  { to: "/schedule", icon: IconCalendar, label: "Schedule" },
];

// Avatar: prefer server-persisted URL from user object, fallback to localStorage cache
const avatarUrl = computed(
  () => auth.user?.avatarUrl || localStorage.getItem("enjive:avatar") || "",
);

const initials = computed(() => {
  const u = auth.user;
  if (!u) return "U";
  return (
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "U"
  );
});

// Logo: place your PNG at /public/assets/logo/enjive-mark.png

onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));
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

.theme-toggle-btn:hover .theme-track {
  border-color: rgba(255, 198, 119, 0.4);
}
.theme-dot {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
html:not(.light) .theme-toggle-btn:hover .theme-dot {
  box-shadow: 0 0 6px rgba(186, 219, 255, 0.4);
}
html.light .theme-toggle-btn:hover .theme-dot {
  box-shadow: 0 0 8px rgba(255, 198, 119, 0.6);
}

/* ── Mobile bottom nav ─────────────────────────────────────── */
.mobile-bottom-nav {
  padding-bottom: max(6px, env(safe-area-inset-bottom));
}
.mobile-nav-item {
  position: relative;
}
.mobile-nav-item.router-link-active {
  color: #ffc677;
}
.mobile-nav-item.router-link-active::after {
  content: none; /* disable shimmer on mobile nav */
}

/* ── Sidebar drawer on mobile ──────────────────────────────── */
@media (max-width: 767px) {
  .sidebar {
    position: fixed !important;
    height: 100% !important;
    top: 0;
    left: 0;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  /* pb-20 on main to clear bottom nav */
  main {
    padding-bottom: 5rem;
  }
}
</style>
