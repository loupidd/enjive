<template>
  <div class="min-h-screen bg-denim-950 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background grain -->
    <div class="grain-overlay pointer-events-none"/>

    <!-- Ambient glow -->
    <div class="absolute w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
      :style="{ background: isLoggedIn ? '#ef4444' : '#FFC677', top:'20%', left:'50%', transform:'translateX(-50%)' }"/>

    <div class="relative z-10 text-center max-w-md w-full">

      <!-- Icon -->
      <div class="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
        :class="isLoggedIn ? 'bg-red-500/15 border border-red-500/30' : 'bg-caramel/10 border border-caramel/30'">
        <svg v-if="isLoggedIn" width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-red-400">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-caramel">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <!-- Code -->
      <p class="text-7xl font-black text-white/5 leading-none select-none mb-2">
        {{ isLoggedIn ? '403' : '401' }}
      </p>

      <!-- Title -->
      <h1 class="text-2xl font-bold text-white mt-[-1rem] mb-2">
        {{ isLoggedIn ? 'Akses Ditolak' : 'Belum Login' }}
      </h1>

      <!-- Description -->
      <p class="text-sm text-denim-200/50 mb-8 leading-relaxed">
        <template v-if="isLoggedIn">
          Anda tidak memiliki izin untuk mengakses halaman ini.<br/>
          Hubungi administrator jika ini adalah kesalahan.
        </template>
        <template v-else>
          Sesi Anda telah berakhir atau Anda belum masuk.<br/>
          Silakan login untuk melanjutkan.
        </template>
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          v-if="isLoggedIn"
          class="btn-secondary px-6 py-2.5 text-sm"
          @click="$router.back()"
        >
          ← Kembali
        </button>
        <RouterLink
          v-if="isLoggedIn"
          to="/dashboard"
          class="btn-primary px-6 py-2.5 text-sm"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="btn-primary px-8 py-3 text-sm w-full sm:w-auto"
        >
          Masuk ke EnJive
        </RouterLink>
      </div>

      <!-- Branding -->
      <div class="mt-10 flex items-center justify-center gap-2 opacity-30">
        <div class="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center overflow-hidden p-0.5">
          <img src="@/assets/enjive-mark.png" alt="" class="w-full h-full object-contain" onerror="this.style.display='none'"/>
        </div>
        <span class="text-xs text-denim-200/50 font-semibold tracking-wide">EnJive CMMS</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const isLoggedIn = computed(() => auth.isAuthenticated)
</script>
