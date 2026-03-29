<template>
  <div class="max-w-2xl mx-auto space-y-5">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button class="w-8 h-8 rounded-lg bg-denim-700/40 border border-denim-600/30 flex items-center justify-center hover:bg-denim-700/70 transition-colors shrink-0" @click="router.back()">
        <IconArrowLeft :size="14" class="text-denim-200/60"/>
      </button>
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">My Profile</h2>
        <div class="accent-bar mt-1.5"/>
      </div>
    </div>

    <!-- Avatar + basic info card -->
    <div class="card p-6">
      <div class="flex items-start gap-5 flex-wrap">

        <!-- Avatar upload -->
        <div class="relative shrink-0">
          <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-denim-600/40 bg-denim-700/40 flex items-center justify-center">
            <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover"/>
            <span v-else class="text-3xl font-black text-caramel select-none">{{ initials }}</span>
          </div>
          <!-- Upload overlay -->
          <label class="absolute inset-0 rounded-2xl flex items-end justify-center pb-1.5 cursor-pointer opacity-0 hover:opacity-100 transition-opacity bg-black/50">
            <span class="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">Change</span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload"/>
          </label>
          <!-- Uploading spinner -->
          <div v-if="uploading" class="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
            <div class="w-5 h-5 rounded-full border-2 border-caramel border-t-transparent animate-spin"/>
          </div>
        </div>
        <Transition name="fade">
          <p v-if="avatarSaved" class="text-[10px] text-green-400 mt-1 text-center">Saved ✓</p>
        </Transition>

        <!-- Name / role info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-white leading-tight">{{ form.name || auth.fullName || 'User' }}</h3>
          <p class="text-sm text-denim-200/50 mt-0.5">{{ form.position || '—' }}</p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-caramel/15 text-caramel">{{ auth.user?.role ?? 'TECHNICIAN' }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-denim-700/60 text-denim-200/60">{{ form.company }}</span>
          </div>
          <p class="text-[11px] text-denim-200/30 mt-2 font-mono">{{ auth.user?.email }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-denim-700/30 mt-5 pt-5 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Full Name</label>
            <input v-model="form.name" class="input" :disabled="saving" placeholder="Your full name"/>
          </div>
          <div>
            <label class="label">Position / Job Title</label>
            <input v-model="form.position" class="input" :disabled="saving" placeholder="e.g. Senior Engineer"/>
          </div>
        </div>
        <div>
          <label class="label">Phone Number</label>
          <input v-model="form.phone" class="input" :disabled="saving" placeholder="+62 812-xxxx-xxxx"/>
        </div>
        <div>
          <label class="label">Company</label>
          <input v-model="form.company" class="input" disabled/>
        </div>
      </div>

      <div class="flex justify-end mt-4 gap-2">
        <button class="btn-secondary text-xs px-4" @click="resetForm">Reset</button>
        <button class="btn-primary text-xs px-5 gap-1.5" :disabled="saving" @click="saveProfile">
          <div v-if="saving" class="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin"/>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Save success -->
      <Transition name="fade">
        <div v-if="saved" class="mt-3 text-xs text-green-400 flex items-center gap-1.5">
          <IconCheck :size="12"/> Profile saved successfully
        </div>
      </Transition>
    </div>

    <!-- Change password -->
    <div class="card p-6">
      <h4 class="text-sm font-bold text-white mb-4">Change Password</h4>
      <div class="space-y-3">
        <div>
          <label class="label">Current Password</label>
          <input v-model="pwForm.current" type="password" class="input" placeholder="••••••••"/>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">New Password</label>
            <input v-model="pwForm.next" type="password" class="input" placeholder="Min. 8 characters"/>
          </div>
          <div>
            <label class="label">Confirm New Password</label>
            <input v-model="pwForm.confirm" type="password" class="input" :class="pwMismatch ? 'border-red-500/60' : ''"/>
          </div>
        </div>
        <p v-if="pwMismatch" class="text-[11px] text-red-400">Passwords do not match</p>
      </div>
      <div class="flex justify-end mt-4">
        <button class="btn-primary text-xs px-5" :disabled="!pwValid" @click="changePassword">Update Password</button>
      </div>
    </div>

    <!-- Session info -->
    <div class="card p-5">
      <h4 class="text-sm font-bold text-white mb-3">Session Info</h4>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between py-2 border-b border-denim-700/20">
          <span class="text-denim-200/40">Account ID</span>
          <span class="font-mono text-white">{{ auth.user?.id?.slice(0,8) ?? '—' }}...</span>
        </div>
        <div class="flex justify-between py-2 border-b border-denim-700/20">
          <span class="text-denim-200/40">Role</span>
          <span class="font-semibold text-caramel">{{ auth.user?.role ?? '—' }}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-denim-200/40">Last Login</span>
          <span class="text-white">{{ lastLogin }}</span>
        </div>
      </div>
      <button class="btn-danger w-full mt-4 text-xs justify-center gap-1.5" @click="auth.logout()">
        <IconLogOut :size="13"/> Sign Out
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { IconCheck, IconLogOut, IconArrowLeft } from '@/components/icons'

const router = useRouter()

const auth = useAuthStore()

const initials = computed(() => {
  const n = auth.fullName || auth.user?.email || 'U'
  return n.split(' ').map((w:string) => w[0]).join('').slice(0,2).toUpperCase()
})

// Avatar
const avatarPreview = ref<string>(auth.user?.avatarUrl || localStorage.getItem('enjive:avatar') || '')
const avatarSaved   = ref(false)
const uploading = ref(false)

function handleAvatarUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true

  const reader = new FileReader()
  reader.onload = async (ev) => {
    const img = new Image()
    img.onload = async () => {
      // Compress to max 256×256
      const canvas = document.createElement('canvas')
      const MAX = 256
      const ratio = Math.min(MAX / img.width, MAX / img.height)
      canvas.width  = img.width  * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)

      // Show preview immediately
      avatarPreview.value = dataUrl

      // Persist: cache locally + upload to backend
      localStorage.setItem('enjive:avatar', dataUrl)
      try {
        // TODO: replace with real API endpoint for file upload
        // const form = new FormData(); form.append('avatar', file)
        // await api.post('/users/me/avatar', form)
        // For now: patch user object in auth store with dataUrl
        // so sidebar avatar updates reactively
        if (auth.user) auth.user.avatarUrl = dataUrl
        avatarSaved.value = true
        setTimeout(() => avatarSaved.value = false, 3000)
      } catch {
        // silently fail — local preview still works
      }
      uploading.value = false
    }
    img.src = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Profile form
const form = ref({
  name:     auth.fullName || '',
  position: '',
  phone:    '',
  company:  auth.user?.role === 'ADMIN' ? 'PT Sumber Sarana Solusindo' : 'PT Sumber Sarana Solusindo',
})

const saving = ref(false)
const saved  = ref(false)

function resetForm() {
  form.value.name = auth.fullName || ''
  form.value.position = ''
  form.value.phone = ''
}

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800)) // TODO: real API call
  saving.value = false
  saved.value  = true
  setTimeout(() => saved.value = false, 3000)
}

// Password change
const pwForm = ref({ current:'', next:'', confirm:'' })
const pwMismatch = computed(() => pwForm.value.confirm && pwForm.value.next !== pwForm.value.confirm)
const pwValid    = computed(() => pwForm.value.current && pwForm.value.next.length >= 8 && !pwMismatch.value)

function changePassword() {
  // TODO: real API call
  pwForm.value = { current:'', next:'', confirm:'' }
  alert('Password updated (mock)')
}

const lastLogin = computed(() => {
  const d = auth.user?.lastLoginAt
  if (!d) return 'Unknown'
  return new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
})
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .3s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
