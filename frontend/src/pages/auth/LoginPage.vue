<template>
  <div class="min-h-screen flex bg-surface-950 overflow-hidden relative">

    <!-- ── Full-screen animated background ──────────────────── -->
    <div class="login-bg absolute inset-0"/>
    <div class="grain-overlay absolute inset-0 pointer-events-none"/>

    <!-- Floating circuit nodes (interactive on hover) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" :viewBox="`0 0 ${vw} ${vh}`" preserveAspectRatio="none">
      <!-- Animated circuit lines -->
      <g opacity="0.12">
        <line x1="0" :y1="vh*0.3"  :x2="vw*0.4" :y2="vh*0.3"  stroke="#FFC677" stroke-width="1" class="circuit-line"/>
        <line :x1="vw*0.4" :y1="vh*0.3" :x2="vw*0.4" :y2="vh*0.6" stroke="#FFC677" stroke-width="1" class="circuit-line" style="animation-delay:0.3s"/>
        <line :x1="vw*0.4" :y1="vh*0.6" :x2="vw*0.7" :y2="vh*0.6" stroke="#FFC677" stroke-width="1" class="circuit-line" style="animation-delay:0.6s"/>
        <line :x1="vw*0.7" :y1="vh*0.6" :x2="vw*0.7" :y2="vh*0.15" stroke="#FFC677" stroke-width="1" class="circuit-line" style="animation-delay:0.9s"/>
        <line :x1="vw*0.7" :y1="vh*0.15" :x2="vw" :y2="vh*0.15" stroke="#FFC677" stroke-width="1" class="circuit-line" style="animation-delay:1.2s"/>
        <line :x1="vw*0.15" :y1="0" :x2="vw*0.15" :y2="vh*0.3" stroke="#FFC677" stroke-width="1" class="circuit-line" style="animation-delay:0.2s"/>
        <line :x1="vw*0.85" :y1="vh" :x2="vw*0.85" :y2="vh*0.6" stroke="#FFC677" stroke-width="1" class="circuit-line" style="animation-delay:0.8s"/>
      </g>
      <!-- Circuit node dots -->
      <g>
        <circle :cx="vw*0.4"  :cy="vh*0.3"  r="3.5" fill="#FFC677" opacity="0.3" class="node-dot"/>
        <circle :cx="vw*0.4"  :cy="vh*0.6"  r="3.5" fill="#FFC677" opacity="0.3" class="node-dot" style="animation-delay:0.5s"/>
        <circle :cx="vw*0.7"  :cy="vh*0.6"  r="3.5" fill="#FFC677" opacity="0.3" class="node-dot" style="animation-delay:1s"/>
        <circle :cx="vw*0.7"  :cy="vh*0.15" r="3.5" fill="#FFC677" opacity="0.3" class="node-dot" style="animation-delay:1.5s"/>
        <circle :cx="vw*0.15" :cy="vh*0.3"  r="3.5" fill="#FFC677" opacity="0.3" class="node-dot" style="animation-delay:0.3s"/>
      </g>
      <!-- Mouse follower dot -->
      <circle
        :cx="mouseX" :cy="mouseY" r="120"
        fill="url(#mouse-glow)"
        opacity="0.06"
        style="transition: cx 0.8s ease, cy 0.8s ease; pointer-events:none"
      />
      <defs>
        <radialGradient id="mouse-glow">
          <stop offset="0%"   stop-color="#FFC677" stop-opacity="1"/>
          <stop offset="100%" stop-color="#FFC677" stop-opacity="0"/>
        </radialGradient>
      </defs>
    </svg>

    <!-- ── Left branding panel ───────────────────────────────── -->
    <div class="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative z-10">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 p-1">
          <img src="@/assets/enjive-mark.png" alt="EnJive" width="32" height="32" class="rounded-lg object-contain w-full h-full"/>
        </div>
        <div>
          <p class="text-white font-bold text-xl leading-tight tracking-tight">EnJive</p>
          <p class="text-caramel/50 text-[10px] uppercase tracking-[0.2em] font-semibold">by TripleS</p>
        </div>
      </div>

      <!-- Hero text -->
      <div class="space-y-6">
        <div>
          <h1 class="text-5xl font-bold text-white leading-[1.1] tracking-tight hero-text">
            Maintenance<br/>
            <span class="text-caramel hero-highlight">Simplified.</span>
          </h1>
          <p class="text-denim-100/50 text-sm leading-relaxed mt-5 max-w-xs">
            Enterprise-grade facility management built for precision, reliability, and scale.
          </p>
        </div>

        <!-- Animated stat pills -->
        <div class="flex flex-wrap gap-2.5">
          <div v-for="(stat, i) in stats" :key="stat.label"
            class="stat-pill flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            :style="{ animationDelay: i * 0.15 + 0.5 + 's' }"
          >
            <span class="text-sm font-bold text-caramel">{{ stat.value }}</span>
            <span class="text-[11px] text-denim-100/50">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom tagline -->
      <p class="text-[11px] text-denim-200/25 tracking-wide">EnJive CMMS · Powered by TripleS</p>
    </div>

    <!-- ── Right login form ──────────────────────────────────── -->
    <div class="flex-1 flex items-center justify-center p-8 relative z-10">
      <div class="w-full max-w-[360px] login-card-enter">

        <!-- Mobile logo -->
        <div class="flex items-center gap-3 mb-10 lg:hidden">
          <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 p-0.5">
            <img src="@/assets/enjive-mark.png" alt="EnJive" width="28" height="28" class="rounded-md object-contain w-full h-full"/>
          </div>
          <div>
            <p class="text-white font-bold text-lg">EnJive</p>
            <p class="text-caramel/60 text-[10px] uppercase tracking-widest">by TripleS</p>
          </div>
        </div>

        <!-- Form card -->
        <div class="bg-denim-800/70 border border-white/8 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div class="mb-7">
            <h2 class="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p class="text-denim-200/50 text-sm mt-1">Sign in to your CMMS workspace</p>
          </div>

          <div class="space-y-4">
            <!-- Email -->
            <div class="form-field" :class="focused==='email' ? 'focused' : ''">
              <label class="label">Email address</label>
              <div class="relative">
                <input
                  v-model="form.email"
                  type="email"
                  class="input pr-10"
                  placeholder="admin@enjive.com"
                  @focus="focused='email'"
                  @blur="focused=''"
                  @keyup.enter="submit"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity" :class="form.email ? 'opacity-100' : 'opacity-0'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC677" stroke-width="2" opacity="0.5"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="form-field" :class="focused==='password' ? 'focused' : ''">
              <label class="label">Password</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input pr-10"
                  placeholder="••••••••"
                  @focus="focused='password'"
                  @blur="focused=''"
                  @keyup.enter="submit"
                />
                <button
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-denim-200/30 hover:text-denim-200/60 transition-colors"
                  @click="showPassword=!showPassword"
                  tabindex="-1"
                >
                  <svg v-if="!showPassword" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <!-- Error -->
            <Transition name="error-fade">
              <div v-if="error" class="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ error }}
              </div>
            </Transition>

            <!-- Submit button -->
            <button
              class="btn-primary w-full justify-center mt-1 py-2.5 relative overflow-hidden"
              :class="loading ? 'pointer-events-none' : ''"
              :disabled="loading"
              @click="submit"
            >
              <span v-if="loading" class="w-4 h-4 border-2 border-denim-900/30 border-t-denim-900 rounded-full animate-spin"/>
              <span v-else>Sign in</span>
              <!-- Button shimmer sweep -->
              <span v-if="!loading" class="btn-shimmer absolute inset-0 pointer-events-none"/>
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-[11px] text-denim-200/20">
          EnJive CMMS &copy; {{ new Date().getFullYear() }} TripleS
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth.store"
import { extractError } from "@/utils/api"

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const form         = ref({ email:"", password:"" })
const loading      = ref(false)
const error        = ref("")
const focused      = ref("")
const showPassword = ref(false)

const stats = [
  { value:"62+",  label:"Assets tracked" },
  { value:"100%", label:"Availability" },
  { value:"1,556",label:"WOs this year" },
]

// Mouse-tracking glow effect
const vw     = ref(1440)
const vh     = ref(900)
const mouseX = ref(720)
const mouseY = ref(450)

function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}
function onResize() {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}

onMounted(() => {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("resize", onResize)
})
onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove)
  window.removeEventListener("resize", onResize)
})

async function submit() {
  if (!form.value.email || !form.value.password) return
  error.value = ""
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    const redirect = (route.query.redirect as string) ?? "/dashboard"
    router.push(redirect)
  } catch (e) {
    error.value = extractError(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Background gradient ────────────────────────── */
.login-bg {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(2,49,78,0.9) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(255,198,119,0.06) 0%, transparent 50%),
    #0a1520;
}

/* ── Grain ──────────────────────────────────────── */
.grain-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.5;
  mix-blend-mode: overlay;
  z-index: 1;
}

/* ── Circuit lines draw-in animation ─────────────── */
.circuit-line {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: draw-line 2.5s ease forwards;
}
@keyframes draw-line {
  to { stroke-dashoffset: 0; }
}

/* ── Node dot pulse ──────────────────────────────── */
.node-dot {
  animation: node-pulse 3s ease-in-out infinite;
}
@keyframes node-pulse {
  0%, 100% { opacity: 0.2; r: 3.5; }
  50%       { opacity: 0.7; r: 5; }
}

/* ── Hero text entrance ──────────────────────────── */
.hero-text {
  animation: hero-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both 0.2s;
}
.hero-highlight {
  animation: hero-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both 0.4s;
}
@keyframes hero-in {
  from { opacity:0; transform: translateY(20px); }
  to   { opacity:1; transform: translateY(0); }
}

/* ── Stat pills ──────────────────────────────────── */
.stat-pill {
  animation: pill-in 0.4s ease both;
}
@keyframes pill-in {
  from { opacity:0; transform: scale(0.9) translateY(6px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}

/* ── Form card entrance ──────────────────────────── */
.login-card-enter {
  animation: card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both 0.15s;
}
@keyframes card-in {
  from { opacity:0; transform: translateY(24px) scale(0.97); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}

/* ── Button shimmer ──────────────────────────────── */
.btn-shimmer {
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: btn-shimmer 2.5s ease infinite;
}
@keyframes btn-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

/* ── Error transition ────────────────────────────── */
.error-fade-enter-active, .error-fade-leave-active { transition: all 0.2s ease; }
.error-fade-enter-from, .error-fade-leave-to { opacity:0; transform: translateY(-4px); }
</style>
