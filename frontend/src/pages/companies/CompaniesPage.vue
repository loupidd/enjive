<template>
  <div class="space-y-5">
    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">
          Sites & Companies
        </h2>
        <div class="accent-bar mt-1.5" />
      </div>
      <button
        class="btn-primary text-xs px-4 py-1.5 gap-1.5"
        @click="showAddSite = true"
      >
        <IconPlus :size="13" /> Add Site
      </button>
    </div>

    <!-- ── Active site hero card ─────────────────────────── -->
    <div
      v-if="activeSite"
      class="relative rounded-2xl overflow-hidden border border-denim-600/30 shadow-xl min-h-[200px]"
    >
      <!-- Background gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-denim-900 via-denim-800 to-denim-950"
      />
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
            radial-gradient(circle at 20% 50%, #ffc677 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #02314e 0%, transparent 60%);
        "
      />
      <!-- Grain overlay -->
      <div class="absolute inset-0 opacity-[0.03] grain-bg" />

      <div
        class="relative z-10 p-6 flex flex-col sm:flex-row items-start gap-5"
      >
        <!-- Logo / Avatar -->
        <div
          class="w-20 h-20 rounded-2xl border-2 border-white/10 bg-denim-700/60 flex items-center justify-center shrink-0 overflow-hidden shadow-lg"
        >
          <div v-if="!activeSite.logo" class="text-4xl select-none">🏢</div>
          <img
            v-else
            :src="activeSite.logo"
            class="w-full h-full object-cover"
          />
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span
              class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-caramel/20 text-caramel"
              >Active Site</span
            >
            <span
              class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold"
              >{{ activeSite.status }}</span
            >
          </div>
          <h3 class="text-2xl font-black text-white leading-tight">
            {{ activeSite.name }}
          </h3>
          <p class="text-sm text-denim-200/60 mt-0.5">
            {{ activeSite.legalName }}
          </p>
          <div class="flex flex-wrap gap-4 mt-3">
            <div class="flex items-center gap-1.5 text-xs text-denim-200/50">
              <IconMapPin :size="12" class="text-caramel/60" />{{
                activeSite.address
              }}
            </div>
            <div class="flex items-center gap-1.5 text-xs text-denim-200/50">
              <IconPhone :size="12" class="text-caramel/60" />{{
                activeSite.phone
              }}
            </div>
            <div class="flex items-center gap-1.5 text-xs text-denim-200/50">
              <IconMail :size="12" class="text-caramel/60" />{{
                activeSite.email
              }}
            </div>
          </div>
        </div>
        <!-- Stats -->
        <div class="flex gap-3 shrink-0">
          <div
            v-for="stat in activeSiteStats"
            :key="stat.label"
            class="bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-center min-w-[70px]"
          >
            <p class="text-xl font-black" :class="stat.color">
              {{ stat.value }}
            </p>
            <p
              class="text-[9px] text-denim-200/40 uppercase tracking-wide mt-0.5"
            >
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom bar: managed by -->
      <div
        class="relative z-10 px-6 py-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-6 h-6 rounded-lg bg-caramel/20 flex items-center justify-center"
          >
            <IconBuilding :size="12" class="text-caramel" />
          </div>
          <span class="text-xs text-denim-200/50"
            >Managed by
            <span class="text-white font-semibold">{{
              activeSite.managedBy
            }}</span></span
          >
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-denim-200/30">Contract until</span>
          <span class="text-xs font-semibold text-caramel">{{
            activeSite.contractEnd
          }}</span>
        </div>
      </div>
    </div>

    <!-- ── Stats overview ─────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="s in overviewStats"
        :key="s.label"
        class="card py-4 px-5 flex items-center gap-3"
      >
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          :class="s.iconBg"
        >
          <component :is="s.icon" :size="15" :class="s.iconColor" />
        </div>
        <div>
          <p class="text-lg font-black text-white leading-none">
            {{ s.value }}
          </p>
          <p class="text-[10px] text-denim-200/40 mt-0.5">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- ── Company / maintainer card ─────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Maintainer profile -->
      <div class="card p-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-denim-700/30">
          <p class="text-sm font-bold text-white">Maintenance Provider</p>
        </div>
        <div class="p-5 flex flex-col items-center text-center gap-3">
          <!-- Logo SVG inline -->
          <div
            class="w-16 h-16 rounded-2xl bg-denim-700/40 border border-denim-600/30 flex items-center justify-center overflow-hidden"
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#02314E" />
              <rect x="6" y="7" width="4" height="18" rx="1" fill="#FFC677" />
              <rect x="22" y="7" width="4" height="18" rx="1" fill="#FFC677" />
              <path
                d="M10 7 L22 25"
                stroke="#FFC677"
                stroke-width="3.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <p class="font-bold text-white text-sm">
              PT Sumber Sarana Solusindo
            </p>
            <p class="text-[11px] text-denim-200/40 mt-0.5">
              Maintenance & Facilities Management
            </p>
          </div>
          <div class="w-full space-y-2 text-left">
            <div
              class="flex justify-between text-xs py-1.5 border-b border-denim-700/20"
            >
              <span class="text-denim-200/40">License</span>
              <span class="text-white font-mono text-[11px]"
                >SSS-FM-2024-001</span
              >
            </div>
            <div
              class="flex justify-between text-xs py-1.5 border-b border-denim-700/20"
            >
              <span class="text-denim-200/40">Technicians</span>
              <span class="text-white font-semibold">12 Active</span>
            </div>
            <div
              class="flex justify-between text-xs py-1.5 border-b border-denim-700/20"
            >
              <span class="text-denim-200/40">Rating</span>
              <span class="text-caramel font-bold">★ 4.8 / 5.0</span>
            </div>
            <div class="flex justify-between text-xs py-1.5">
              <span class="text-denim-200/40">Since</span>
              <span class="text-white font-semibold">Jan 2023</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Site details -->
      <div class="card p-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-denim-700/30">
          <p class="text-sm font-bold text-white">Site Details</p>
        </div>
        <div v-if="activeSite" class="p-5 space-y-2.5">
          <div
            v-for="row in siteDetailRows"
            :key="row.label"
            class="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-denim-700/10 last:border-0"
          >
            <span class="text-denim-200/40 shrink-0">{{ row.label }}</span>
            <span
              class="text-right font-medium"
              :class="row.color ?? 'text-white'"
              >{{ row.value }}</span
            >
          </div>
        </div>
      </div>

      <!-- PIC / Contacts -->
      <div class="card p-0 overflow-hidden">
        <div
          class="px-5 py-4 border-b border-denim-700/30 flex items-center justify-between"
        >
          <p class="text-sm font-bold text-white">PIC & Contacts</p>
          <button
            class="text-[10px] text-caramel hover:text-caramel/70"
            @click="showAddContact = true"
          >
            + Add
          </button>
        </div>
        <div class="divide-y divide-denim-700/10">
          <div
            v-for="c in contacts"
            :key="c.name"
            class="flex items-center gap-3 px-5 py-3"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              :style="{ background: avatarColor(c.name) }"
            >
              {{
                c.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
              }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-white truncate">
                {{ c.name }}
              </p>
              <p class="text-[10px] text-denim-200/35 truncate">{{ c.role }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] text-denim-200/50 font-mono">
                {{ c.phone }}
              </p>
              <span
                class="text-[9px] px-1.5 py-0.5 rounded font-bold"
                :class="
                  c.type === 'Client'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-caramel/15 text-caramel'
                "
                >{{ c.type }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── All Sites list ─────────────────────────────────── -->
    <div class="card p-0 overflow-hidden">
      <div
        class="px-5 py-4 border-b border-denim-700/30 flex items-center justify-between"
      >
        <p class="text-sm font-bold text-white">All Sites</p>
        <span
          class="text-[10px] text-denim-200/30 bg-denim-700/30 px-2 py-0.5 rounded-full"
          >{{ sites.length }} sites</span
        >
      </div>
      <div class="divide-y divide-denim-700/10">
        <div
          v-for="site in sites"
          :key="site.id"
          class="flex items-center gap-4 px-5 py-3.5 hover:bg-denim-700/10 transition-colors cursor-pointer group"
          :class="site.id === activeSite?.id ? 'bg-caramel/5' : ''"
          @click="setActive(site)"
        >
          <div
            class="w-9 h-9 rounded-xl bg-denim-700/40 border border-denim-600/20 flex items-center justify-center text-xl shrink-0"
          >
            {{ site.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-white truncate">
                {{ site.name }}
              </p>
              <span
                v-if="site.id === activeSite?.id"
                class="text-[9px] px-1.5 py-0.5 rounded-full bg-caramel/20 text-caramel font-bold"
                >Active</span
              >
            </div>
            <p class="text-[11px] text-denim-200/40 truncate">
              {{ site.address }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p
              class="text-xs font-bold"
              :class="
                site.status === 'Active'
                  ? 'text-green-400'
                  : 'text-denim-200/30'
              "
            >
              {{ site.status }}
            </p>
            <p class="text-[10px] text-denim-200/30 mt-0.5">
              {{ site.equipmentCount }} equipment
            </p>
          </div>
          <button
            class="opacity-0 group-hover:opacity-100 btn-secondary text-[11px] px-2.5 py-1 transition-opacity"
            @click.stop="editSite(site)"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- ── Add Site Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddSite"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showAddSite = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div
              class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10 rounded-t-2xl"
            >
              <h3 class="font-bold text-white">
                {{ editingSite ? "Edit Site" : "Add New Site" }}
              </h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showAddSite = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label"
                  >Site Name <span class="text-red-400">*</span></label
                >
                <input
                  v-model="siteForm.name"
                  class="input"
                  placeholder="e.g. Essence Darmawangsa Apartment"
                />
              </div>
              <div>
                <label class="label">Legal Entity Name</label>
                <input
                  v-model="siteForm.legalName"
                  class="input"
                  placeholder="PT / CV ..."
                />
              </div>
              <div>
                <label class="label"
                  >Address <span class="text-red-400">*</span></label
                >
                <textarea
                  v-model="siteForm.address"
                  class="input resize-none"
                  rows="2"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Phone</label
                  ><input v-model="siteForm.phone" class="input" />
                </div>
                <div>
                  <label class="label">Email</label
                  ><input v-model="siteForm.email" class="input" type="email" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Contract Start</label
                  ><input
                    v-model="siteForm.contractStart"
                    type="date"
                    class="input"
                  />
                </div>
                <div>
                  <label class="label">Contract End</label
                  ><input
                    v-model="siteForm.contractEnd"
                    type="date"
                    class="input"
                  />
                </div>
              </div>
              <div>
                <label class="label">Status</label>
                <select v-model="siteForm.status" class="input">
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>
            <div
              class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2 rounded-b-2xl"
            >
              <button class="btn-secondary" @click="showAddSite = false">
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="submitSite"
                :disabled="!siteForm.name || !siteForm.address"
              >
                {{ editingSite ? "Save Changes" : "Add Site" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  IconPlus,
  IconMapPin,
  IconPhone,
  IconMail,
  IconBuilding,
  IconCpu,
  IconClipboard,
  IconAlertTriangle,
  IconUsers,
} from "@/components/icons";

// ── Sites data ────────────────────────────────────────────────
const sites = ref([
  {
    id: 1,
    emoji: "🏢",
    name: "Essence Darmawangsa Apartment",
    legalName: "PT Essence Darmawangsa Properti",
    address: "Jl. Darmawangsa VII No.12, Kebayoran Baru, Jakarta Selatan 12160",
    phone: "+62 21 7278-8888",
    email: "bm@essencedarmawangsa.co.id",
    managedBy: "PT Sumber Sarana Solusindo",
    contractStart: "2023-01-01",
    contractEnd: "2027-12-31",
    status: "Active",
    equipmentCount: 62,
    logo: "",
    type: "Residential Apartment",
    floors: 32,
    units: 280,
    yearBuilt: 2018,
  },
  {
    id: 2,
    emoji: "🏙️",
    name: "Nifarro Park Office & Apartments",
    legalName: "PT Nifarro Properti Indonesia",
    address: "Jl. Raya Pasar Minggu No.18, Pancoran, Jakarta Selatan 12780",
    phone: "+62 21 7919-5000",
    email: "bm@nifarropark.co.id",
    managedBy: "PT Sumber Sarana Solusindo",
    contractStart: "2024-03-01",
    contractEnd: "2028-02-28",
    status: "Active",
    equipmentCount: 48,
    logo: "",
    type: "Mixed-Use: Office & Apartment",
    floors: 38,
    units: 320,
    yearBuilt: 2022,
  },
]);

const activeSiteId = ref(1);
const activeSite = computed(
  () => sites.value.find((s) => s.id === activeSiteId.value) ?? null,
);

function setActive(site: any) {
  activeSiteId.value = site.id;
}

// ── Stats ─────────────────────────────────────────────────────
const activeSiteStats = computed(() => [
  {
    label: "Equipment",
    value: activeSite.value?.equipmentCount ?? 0,
    color: "text-caramel",
  },
  { label: "Active WOs", value: 4, color: "text-blue-400" },
  { label: "Open Trouble", value: 2, color: "text-red-400" },
  { label: "Technicians", value: 12, color: "text-green-400" },
]);

const overviewStats = computed(() => [
  {
    label: "Total Sites",
    value: sites.value.length,
    icon: IconBuilding,
    iconBg: "bg-caramel/10",
    iconColor: "text-caramel",
  },
  {
    label: "Active Sites",
    value: sites.value.filter((s) => s.status === "Active").length,
    icon: IconMapPin,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
  },
  {
    label: "Total Equipment",
    value: sites.value.reduce((a, s) => a + s.equipmentCount, 0),
    icon: IconCpu,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    label: "Work Orders",
    value: 24,
    icon: IconClipboard,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
]);

const siteDetailRows = computed(() => {
  if (!activeSite.value) return [];
  const s = activeSite.value;
  return [
    { label: "Type", value: s.type },
    { label: "Floors", value: `${s.floors} floors` },
    { label: "Units", value: s.units > 0 ? `${s.units} units` : "N/A" },
    { label: "Year Built", value: String(s.yearBuilt) },
    { label: "Contract Start", value: s.contractStart },
    { label: "Contract End", value: s.contractEnd, color: "text-caramel" },
    {
      label: "Status",
      value: s.status,
      color: s.status === "Active" ? "text-green-400" : "text-red-400",
    },
  ];
});

// ── Contacts ──────────────────────────────────────────────────
const contacts = ref([
  {
    name: "Budi Hartono",
    role: "Building Manager",
    phone: "+62 812-1111-2222",
    type: "Client",
  },
  {
    name: "Ahmad Fauzi",
    role: "Lead Technician",
    phone: "+62 812-3333-4444",
    type: "Maintainer",
  },
  {
    name: "Sari Dewi",
    role: "Client SPV",
    phone: "+62 812-5555-6666",
    type: "Client",
  },
  {
    name: "Budi Santoso",
    role: "Senior Technician",
    phone: "+62 812-7777-8888",
    type: "Maintainer",
  },
]);

function avatarColor(name: string) {
  const PALETTE = [
    "#7A4A00",
    "#02314E",
    "#1d4ed8",
    "#15803d",
    "#7c3aed",
    "#b45309",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[Math.abs(h)];
}

// ── Add Site Modal ────────────────────────────────────────────
const showAddSite = ref(false);
const showAddContact = ref(false);
const editingSite = ref<any>(null);
const siteForm = ref({
  name: "",
  legalName: "",
  address: "",
  phone: "",
  email: "",
  contractStart: "",
  contractEnd: "",
  status: "Active",
});

function editSite(site: any) {
  editingSite.value = site;
  Object.assign(siteForm.value, {
    name: site.name,
    legalName: site.legalName,
    address: site.address,
    phone: site.phone,
    email: site.email,
    contractStart: site.contractStart,
    contractEnd: site.contractEnd,
    status: site.status,
  });
  showAddSite.value = true;
}
function submitSite() {
  if (editingSite.value) {
    const idx = sites.value.findIndex((s) => s.id === editingSite.value.id);
    if (idx >= 0) Object.assign(sites.value[idx], siteForm.value);
  } else {
    sites.value.push({
      id: Date.now(),
      emoji: "🏢",
      ...(siteForm.value as any),
      managedBy: "PT Sumber Sarana Solusindo",
      equipmentCount: 0,
      logo: "",
      type: "",
      floors: 0,
      units: 0,
      yearBuilt: new Date().getFullYear(),
    });
  }
  showAddSite.value = false;
  editingSite.value = null;
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.grain-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
