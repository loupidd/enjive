<template>
  <RouterLink
    :to="to"
    class="nav-item group relative flex items-center rounded-lg transition-all duration-150 overflow-hidden"
    :class="[
      collapsed ? 'justify-center px-0 py-2.5 mx-0' : 'gap-3 px-3 py-2 mx-0',
      isActive
        ? 'bg-caramel/12 text-caramel'
        : 'text-denim-100/50 hover:text-white hover:bg-white/5'
    ]"
    :title="collapsed ? label : undefined"
  >
    <!-- Active shimmer bar -->
    <span
      v-if="isActive"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-caramel"
    />

    <!-- Icon -->
    <component
      :is="icon"
      :size="16"
      stroke-width="1.8"
      class="shrink-0 transition-colors"
      :class="isActive ? 'text-caramel' : 'text-denim-200/40 group-hover:text-white'"
    />

    <!-- Label (hidden when collapsed) -->
    <span
      v-if="!collapsed"
      class="text-[13px] font-medium leading-none truncate flex-1"
    >{{ label }}</span>

    <!-- Badge -->
    <span
      v-if="!collapsed && badge"
      class="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 leading-none"
    >{{ badge }}</span>

    <!-- Tooltip when collapsed -->
    <div
      v-if="collapsed"
      class="nav-tooltip absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-denim-700 border border-denim-600/50 text-xs font-medium text-white whitespace-nowrap shadow-xl pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
    >
      {{ label }}
      <span v-if="badge" class="ml-1.5 text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">{{ badge }}</span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { RouterLink, useRoute } from "vue-router"
import type { Component } from "vue"

const props = defineProps<{
  to:        string
  icon:      Component
  label:     string
  collapsed?: boolean
  badge?:    number
}>()

const route    = useRoute()
const isActive = computed(() =>
  route.path === props.to || (props.to !== "/" && route.path.startsWith(props.to))
)
</script>

<style scoped>
.nav-item { min-height: 36px; }
.nav-tooltip { top: 50%; transform: translateY(-50%); }
</style>
