<template>
  <div class="min-h-screen flex bg-surface-950">
    <!-- Left decorative panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-denim-500 flex-col justify-between p-12 relative overflow-hidden">
      <!-- Circuit board decorative lines -->
      <svg class="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 600 800" fill="none">
        <rect x="100" y="100" width="120" height="220" rx="12" stroke="#FFC677" stroke-width="2"/>
        <rect x="115" y="115" width="90" height="180" rx="8" stroke="#FFC677" stroke-width="1.5"/>
        <rect x="130" y="130" width="60" height="140" rx="6" stroke="#FFC677" stroke-width="1"/>
        <rect x="270" y="80" width="120" height="220" rx="12" stroke="#FFC677" stroke-width="2"/>
        <path d="M270 200 L220 200" stroke="#FFC677" stroke-width="1.5"/>
        <circle cx="210" cy="200" r="5" fill="#FFC677"/>
        <circle cx="210" cy="240" r="5" fill="#FFC677"/>
        <line x1="210" y1="205" x2="210" y2="235" stroke="#FFC677" stroke-width="1.5"/>
        <line x1="100" y1="340" x2="500" y2="340" stroke="#FFC677" stroke-width="1" opacity="0.5"/>
        <line x1="200" y1="420" x2="200" y2="700" stroke="#FFC677" stroke-width="1" opacity="0.5"/>
        <circle cx="200" cy="420" r="4" fill="#FFC677" opacity="0.6"/>
        <circle cx="350" cy="420" r="4" fill="#FFC677" opacity="0.6"/>
        <circle cx="500" cy="340" r="4" fill="#FFC677" opacity="0.6"/>
      </svg>

      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-2">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="3" width="9" height="18" rx="1.5" fill="none" stroke="#FFC677" stroke-width="1.5"/>
            <rect x="16" y="3" width="9" height="18" rx="1.5" fill="none" stroke="#FFC677" stroke-width="1.5"/>
            <path d="M12 3 L16 21" stroke="#FFC677" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="7" cy="25" r="1.2" fill="#FFC677"/>
            <circle cx="21" cy="25" r="1.2" fill="#FFC677"/>
            <line x1="7" y1="23" x2="7" y2="21" stroke="#FFC677" stroke-width="1"/>
            <line x1="21" y1="23" x2="21" y2="21" stroke="#FFC677" stroke-width="1"/>
          </svg>
          <div>
            <p class="text-white font-bold text-xl leading-tight">EnJive</p>
            <p class="text-caramel/70 text-[10px] uppercase tracking-widest font-medium">by TripleS</p>
          </div>
        </div>
      </div>

      <div class="relative z-10">
        <h2 class="text-4xl font-bold text-white leading-tight mb-4">
          Maintenance<br />
          <span class="text-caramel">Simplified.</span>
        </h2>
        <p class="text-denim-100/60 text-sm leading-relaxed max-w-xs">
          Enterprise-grade CMMS built for reliability, innovation, and technical excellence.
        </p>
      </div>

      <div class="relative z-10 flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-caramel" />
        <div class="w-2 h-2 rounded-full bg-denim-300/30" />
        <div class="w-2 h-2 rounded-full bg-denim-300/30" />
      </div>
    </div>

    <!-- Right login panel -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-sm">
        <!-- Mobile logo -->
        <div class="flex items-center gap-3 mb-10 lg:hidden">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="3" width="9" height="18" rx="1.5" fill="none" stroke="#FFC677" stroke-width="1.5"/>
            <rect x="16" y="3" width="9" height="18" rx="1.5" fill="none" stroke="#FFC677" stroke-width="1.5"/>
            <path d="M12 3 L16 21" stroke="#FFC677" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div>
            <p class="text-white font-bold text-lg leading-tight">EnJive</p>
            <p class="text-caramel/70 text-[10px] uppercase tracking-widest">by TripleS</p>
          </div>
        </div>

        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p class="text-denim-200/60 text-sm">Sign in to your CMMS account</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="label">Email address</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              placeholder="admin@enjive.com"
              @keyup.enter="submit"
            />
          </div>

          <div>
            <label class="label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              placeholder="••••••••"
              @keyup.enter="submit"
            />
          </div>

          <div
            v-if="error"
            class="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5"
          >
            {{ error }}
          </div>

          <button
            class="btn-primary w-full justify-center mt-2"
            :disabled="loading"
            @click="submit"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-denim-900/30 border-t-denim-900 rounded-full animate-spin" />
            {{ loading ? "Signing in…" : "Sign in" }}
          </button>
        </div>

        <p class="mt-8 text-center text-xs text-denim-200/30">
          EnJive CMMS &copy; {{ new Date().getFullYear() }} TripleS
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { extractError } from "@/utils/api";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = ref({ email: "", password: "" });
const loading = ref(false);
const error = ref("");

async function submit() {
  if (!form.value.email || !form.value.password) return;
  error.value = "";
  loading.value = true;
  try {
    await auth.login(form.value.email, form.value.password);
    const redirect = (route.query.redirect as string) ?? "/dashboard";
    router.push(redirect);
  } catch (e) {
    error.value = extractError(e);
  } finally {
    loading.value = false;
  }
}
</script>
