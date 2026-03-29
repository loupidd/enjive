<template>
  <div class="min-h-screen bg-denim-950 flex items-center justify-center p-6">
    <div class="w-full max-w-md text-center space-y-6">

      <!-- Icon -->
      <div class="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl"
        :class="config.iconBg">
        <component :is="config.icon" :size="36" :class="config.iconColor"/>
      </div>

      <!-- Code -->
      <div>
        <p class="text-6xl font-black text-white/10 leading-none select-none">{{ config.code }}</p>
        <h1 class="text-xl font-bold text-white -mt-4">{{ config.title }}</h1>
        <p class="text-sm text-denim-200/50 mt-2 leading-relaxed">{{ config.message }}</p>
      </div>

      <!-- Countdown for auto-redirect -->
      <div v-if="countdown > 0" class="text-xs text-denim-200/30">
        Redirecting in <span class="text-caramel font-bold">{{ countdown }}s</span>…
        <div class="w-full h-0.5 bg-denim-700/40 rounded-full mt-2 overflow-hidden">
          <div class="h-full bg-caramel/60 rounded-full transition-all duration-1000"
            :style="{ width: (countdown / REDIRECT_SECS * 100) + '%' }"/>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-2">
        <button class="btn-primary w-full justify-center gap-2" @click="primaryAction">
          <component :is="config.primaryIcon" :size="14"/>
          {{ config.primaryLabel }}
        </button>
        <button v-if="config.secondaryLabel" class="btn-secondary w-full justify-center gap-2" @click="secondaryAction">
          {{ config.secondaryLabel }}
        </button>
      </div>

      <!-- EnJive brand -->
      <div class="flex items-center justify-center gap-2 opacity-30">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#02314E"/>
          <rect x="7" y="8" width="4" height="16" rx="1" fill="#FFC677"/>
          <rect x="21" y="8" width="4" height="16" rx="1" fill="#FFC677"/>
          <path d="M11 8 L21 24" stroke="#FFC677" stroke-width="3.5" stroke-linecap="round"/>
        </svg>
        <span class="text-xs text-denim-200/60 font-semibold">EnJive CMMS</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LogIn, WifiOff, ShieldOff, Clock, AlertTriangle, Home } from 'lucide-vue-next'

const route  = useRoute()
const router = useRouter()
const reason = computed(() => (route.query.reason as string) || 'unknown')

const REDIRECT_SECS = 5
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

interface ErrorConfig {
  code: string; title: string; message: string; icon: any; iconBg: string; iconColor: string
  primaryLabel: string; primaryIcon: any; secondaryLabel?: string; autoRedirect?: string
}

const CONFIGS: Record<string, ErrorConfig> = {
  'session-expired': {
    code:'401', title:'Session Expired',
    message:'Your session has timed out due to inactivity. Please log in again to continue.',
    icon: Clock, iconBg:'bg-yellow-500/15', iconColor:'text-yellow-400',
    primaryLabel:'Back to Login', primaryIcon: LogIn, autoRedirect:'/login',
  },
  'unauthorized': {
    code:'401', title:'Not Logged In',
    message:'You need to be logged in to access this page.',
    icon: ShieldOff, iconBg:'bg-orange-500/15', iconColor:'text-orange-400',
    primaryLabel:'Go to Login', primaryIcon: LogIn, autoRedirect:'/login',
  },
  'forbidden': {
    code:'403', title:'Access Denied',
    message:"You don't have permission to access this page. Contact your administrator if you think this is a mistake.",
    icon: ShieldOff, iconBg:'bg-red-500/15', iconColor:'text-red-400',
    primaryLabel:'Go Home', primaryIcon: Home, secondaryLabel:'Back',
  },
  'not-found': {
    code:'404', title:'Page Not Found',
    message:"The page you're looking for doesn't exist or has been moved.",
    icon: AlertTriangle, iconBg:'bg-denim-700/60', iconColor:'text-denim-200/60',
    primaryLabel:'Go Home', primaryIcon: Home, secondaryLabel:'Go Back',
  },
  'network': {
    code:'503', title:'Connection Problem',
    message:"Can't reach the server. Check your internet connection and try again.",
    icon: WifiOff, iconBg:'bg-blue-500/15', iconColor:'text-blue-400',
    primaryLabel:'Retry', primaryIcon: WifiOff, secondaryLabel:'Go Home',
  },
  'unknown': {
    code:'500', title:'Something Went Wrong',
    message:'An unexpected error occurred. Try refreshing the page or contact support.',
    icon: AlertTriangle, iconBg:'bg-red-500/15', iconColor:'text-red-400',
    primaryLabel:'Go Home', primaryIcon: Home, secondaryLabel:'Reload Page',
  },
}

const config = computed<ErrorConfig>(() => CONFIGS[reason.value] ?? CONFIGS['unknown'])

function primaryAction() {
  if (reason.value === 'session-expired' || reason.value === 'unauthorized') router.push('/login')
  else if (reason.value === 'network') window.location.reload()
  else router.push('/dashboard')
}
function secondaryAction() {
  if (reason.value === 'unknown') window.location.reload()
  else router.back()
}

onMounted(() => {
  if (config.value.autoRedirect) {
    countdown.value = REDIRECT_SECS
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
        router.push(config.value.autoRedirect!)
      }
    }, 1000)
  }
})
onUnmounted(() => { if(timer) clearInterval(timer) })
</script>
