<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-3 flex-wrap">
      <button
        class="flex items-center gap-1.5 text-sm text-caramel hover:text-caramel/80 transition-colors"
        @click="router.push('/equipment')"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      <div class="h-4 w-px bg-denim-600/50" />
      <div>
        <h2 class="text-xl font-bold text-white">{{ typeName }}</h2>
        <div class="accent-bar mt-1" />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <p class="text-sm text-denim-200/50">
        {{ equipments.length }} equipment(s) registered
      </p>
      <div class="flex gap-2">
        <button
          class="btn-secondary text-xs px-3 py-1.5"
          @click="showActivityList = true"
        >
          Activity
        </button>
        <button class="btn-primary text-xs px-3 py-1.5" @click="openAdd">
          + Equipment
        </button>
      </div>
    </div>

    <!-- Equipment Table -->
    <div class="card p-0 overflow-hidden overflow-x-auto">
      <table class="w-full text-sm min-w-[640px]">
        <thead>
          <tr class="border-b border-denim-700/40">
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              ID / Tag Number
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Equipment Name
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Section / System
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Location
            </th>
            <th
              class="text-center px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Critical
            </th>
            <th
              class="text-center px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="eq in equipments"
            :key="eq.id"
            class="border-b border-denim-700/20 hover:bg-denim-700/20 transition-colors cursor-pointer"
            @click="goToDetail(eq)"
          >
            <td class="px-4 py-3">
              <span
                class="font-mono text-xs text-caramel font-semibold hover:underline"
                >{{ eq.id }}</span
              >
            </td>
            <td class="px-4 py-3 font-medium text-white">{{ eq.name }}</td>
            <td class="px-4 py-3 text-denim-100/70">{{ eq.section }}</td>
            <td class="px-4 py-3 text-denim-100/70 text-xs">
              {{ eq.location }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                :class="criticalColor(eq.criticalLevel)"
              >
                {{ eq.criticalLevel }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="
                  eq.status === 'Active'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-red-500/15 text-red-400'
                "
              >
                {{ eq.status }}
              </span>
            </td>
          </tr>
          <tr v-if="!equipments.length">
            <td colspan="6" class="px-4 py-10 text-center text-denim-200/40">
              No equipment in this group
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Activity List Drawer -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showActivityList"
          class="fixed inset-0 z-50 flex items-center justify-end"
          @click.self="showActivityList = false"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border-l border-denim-600/40 w-full max-w-md h-full overflow-y-auto"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-denim-700/40 sticky top-0 bg-denim-800 z-10"
            >
              <h3 class="font-bold text-white">Activities — {{ typeName }}</h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showActivityList = false"
              >
                ✕
              </button>
            </div>
            <div class="p-4">
              <p class="text-xs text-denim-200/50 mb-3">
                Defined activities for this equipment type
              </p>
              <div class="space-y-2 mb-4">
                <div
                  v-for="a in activities"
                  :key="a.id"
                  class="card p-3 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-medium text-white">{{ a.name }}</p>
                    <p class="text-xs text-denim-200/50 mt-0.5">
                      {{ a.classification }} · {{ a.interval }} · {{ a.type }}
                    </p>
                  </div>
                  <span
                    class="text-xs px-2 py-0.5 rounded font-medium"
                    :class="
                      a.status === 'Enable'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-denim-600/50 text-denim-200/50'
                    "
                    >{{ a.status }}</span
                  >
                </div>
                <p
                  v-if="!activities.length"
                  class="text-xs text-denim-200/40 text-center py-6"
                >
                  No activities defined yet
                </p>
              </div>
              <button
                class="btn-primary w-full justify-center text-sm"
                @click="router.push('/activities')"
              >
                + Manage Activities
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
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const typeId = Number(route.params.typeId);

const typeName = computed(() => {
  const names: Record<number, string> = {
    1: "AC Fasilitas",
    2: "Genset",
    3: "Panel Listrik",
    4: "CCTV",
    5: "Fire Alarm",
    6: "Pompa Air",
    7: "Lift / Elevator",
  };
  return names[typeId] ?? "Equipment";
});

const showActivityList = ref(false);

const equipments = ref([
  {
    id: "EDA_EM1_1_AC_LOBBY",
    name: "AC LOBBY",
    section: "Air Conditioner",
    location: "Lantai 1",
    criticalLevel: 3,
    status: "Active",
  },
  {
    id: "EDA_EM1_2_AC_FUNC_ROOM_1",
    name: "AC FUNCTION ROOM",
    section: "Air Conditioner",
    location: "Lantai 2",
    criticalLevel: 2,
    status: "Active",
  },
  {
    id: "EDA_EM1_3_AC_LOBBY_B1",
    name: "AC LOBBY B1",
    section: "Air Conditioner",
    location: "Basement 1",
    criticalLevel: 2,
    status: "Active",
  },
  {
    id: "EDA_EM1_4_AC_OFFICE",
    name: "AC OFFICE",
    section: "Air Conditioner",
    location: "Lantai 3",
    criticalLevel: 1,
    status: "Active",
  },
  {
    id: "EDA_EM1_5_AC_MEETING_R1",
    name: "AC MEETING ROOM 1",
    section: "Air Conditioner",
    location: "Lantai 4",
    criticalLevel: 2,
    status: "Active",
  },
]);

const activities = ref([
  {
    id: 1,
    name: "Cleaning Filter",
    classification: "Preventive",
    interval: "Monthly",
    type: "Cleaning",
    status: "Enable",
  },
  {
    id: 2,
    name: "Cek Freon",
    classification: "Preventive",
    interval: "3 Monthly",
    type: "Measurement",
    status: "Enable",
  },
  {
    id: 3,
    name: "Thermography Check",
    classification: "Thermography Investigation",
    interval: "6 Monthly",
    type: "Thermographic Investigation",
    status: "Enable",
  },
]);

function goToDetail(eq: any) {
  router.push({ name: "EquipmentDetail", params: { eqId: eq.id } });
}
function openAdd() {
  router.push("/equipment");
}

function criticalColor(level: number) {
  if (level >= 4) return "bg-red-500/20 text-red-400";
  if (level === 3) return "bg-orange-500/20 text-orange-300";
  if (level === 2) return "bg-yellow-500/20 text-yellow-300";
  return "bg-denim-600/40 text-denim-200/60";
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
