<template>
  <div class="flex h-screen overflow-hidden bg-surface-950">
    <!-- Sidebar -->
    <aside class="flex flex-col w-60 shrink-0 bg-denim-500 z-20">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-denim-400/30">
        <!-- EnJive circuit "N" mark (SVG approximation) -->
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" class="shrink-0">
          <!-- Circuit board N shape -->
          <rect x="3" y="3" width="9" height="18" rx="1.5" fill="none" stroke="#FFC677" stroke-width="1.5"/>
          <rect x="16" y="3" width="9" height="18" rx="1.5" fill="none" stroke="#FFC677" stroke-width="1.5"/>
          <path d="M12 3 L16 21" stroke="#FFC677" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Circuit dots -->
          <circle cx="7" cy="25" r="1.2" fill="#FFC677"/>
          <circle cx="21" cy="25" r="1.2" fill="#FFC677"/>
          <line x1="7" y1="23" x2="7" y2="21" stroke="#FFC677" stroke-width="1"/>
          <line x1="21" y1="23" x2="21" y2="21" stroke="#FFC677" stroke-width="1"/>
        </svg>
        <div>
          <span class="text-white font-bold tracking-tight text-base leading-tight block">EnJive</span>
          <span class="text-caramel/70 text-[10px] font-medium leading-tight tracking-widest uppercase block">by TripleS</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <NavItem to="/dashboard"   icon="grid"           label="Dashboard" />
        <NavItem to="/schedule"    icon="calendar"       label="Schedule" />
        <NavItem to="/work-orders" icon="tool"           label="Task" />
        <NavItem to="/trouble"     icon="alert-triangle" label="Trouble" />
        <NavItem to="/reports"     icon="bar-chart"      label="Graph" />
        <NavItem to="/equipment"   icon="cpu"            label="Equipment" />
        <NavItem to="/activities"  icon="activity"       label="Activity" />

        <div class="pt-4 pb-1 px-2">
          <div class="flex items-center gap-2">
            <div class="h-px flex-1 bg-denim-400/20" />
            <p class="text-[10px] font-semibold text-denim-200/30 uppercase tracking-widest">Admin</p>
            <div class="h-px flex-1 bg-denim-400/20" />
          </div>
        </div>
        <NavItem to="/users" icon="users" label="Users" />
        <NavItem v-if="auth.hasMinRole('ADMIN')" to="/companies" icon="building" label="Site" />
      </nav>

      <!-- User footer -->
      <div class="p-3 border-t border-denim-400/20">
        <div
          class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-denim-400/20 cursor-pointer transition-colors"
          @click="auth.logout()"
        >
          <div class="w-8 h-8 rounded-full bg-caramel flex items-center justify-center text-xs font-bold text-denim-950">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ auth.fullName }}</p>
            <p class="text-xs text-denim-200/60 truncate">{{ auth.user?.role }}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-denim-200/50 shrink-0">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </div>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="h-16 shrink-0 flex items-center px-6 border-b border-denim-700/40 bg-denim-900/80 backdrop-blur">
        <div class="flex items-center gap-3">
          <div class="accent-bar" />
          <h1 class="text-sm font-semibold text-surface-50 tracking-wide">
            {{ currentRoute?.name as string }}
          </h1>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <span class="text-xs text-denim-200/50 font-medium">{{ today }}</span>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterView, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import NavItem from "@/components/layout/NavItem.vue";

const auth = useAuthStore();
const sidebarOpen = ref(true);
const currentRoute = useRoute();

const initials = computed(() => {
  const u = auth.user;
  if (!u) return "?";
  return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
});

const today = computed(() =>
  new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
);
</script>
