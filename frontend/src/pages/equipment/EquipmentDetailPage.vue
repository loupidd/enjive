<template>
  <div class="space-y-4">
    <!-- Back + Actions bar -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-1.5 text-sm text-caramel hover:text-caramel/80"
          @click="router.back()"
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
          <h2 class="text-lg font-bold text-white">Data Equipment</h2>
          <p class="text-xs text-denim-200/50 font-mono mt-0.5">{{ eq.id }}</p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="activeTab = 'maintenance'"
          class="btn-secondary text-xs px-3 py-1.5"
          :class="activeTab === 'maintenance' ? 'ring-1 ring-caramel/40' : ''"
        >
          Maintenance Record
        </button>
        <button
          @click="activeTab = 'trouble'"
          class="btn-secondary text-xs px-3 py-1.5"
          :class="activeTab === 'trouble' ? 'ring-1 ring-caramel/40' : ''"
        >
          Trouble Record
        </button>
        <button
          @click="activeTab = 'activities'"
          class="btn-secondary text-xs px-3 py-1.5"
          :class="activeTab === 'activities' ? 'ring-1 ring-caramel/40' : ''"
        >
          Activities
        </button>
        <button
          @click="activeTab = 'active-wo'"
          class="relative btn-secondary text-xs px-3 py-1.5 border-red-500/40 text-red-400"
          :class="activeTab === 'active-wo' ? 'ring-1 ring-red-400/40' : ''"
        >
          <span
            class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"
          />
          Active WO
        </button>
        <button
          class="btn-secondary p-1.5"
          title="QR Code"
          @click="showQR = true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="3" height="3" />
          </svg>
        </button>
        <button
          class="btn-secondary p-1.5"
          title="Statistics"
          @click="activeTab = 'stats'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <line x1="2" y1="20" x2="22" y2="20" />
          </svg>
        </button>
        <button class="btn-secondary p-1.5" title="Export PDF">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </button>
        <button
          class="btn-secondary p-1.5"
          title="Edit"
          @click="showEdit = true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button class="btn-danger p-1.5" title="Delete">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <!-- Left: Photo + Map -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Photo -->
        <div class="card p-0 overflow-hidden">
          <div
            class="aspect-video bg-denim-900/60 flex flex-col items-center justify-center text-denim-200/30"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p class="text-xs mt-2">No picture available</p>
          </div>
        </div>

        <!-- Map placeholder -->
        <div class="card p-0 overflow-hidden">
          <div
            class="aspect-video bg-denim-900/60 relative flex items-center justify-center"
          >
            <!-- Fake map grid -->
            <div class="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="#FFC677"
                      stroke-width="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div class="text-center z-10">
              <div
                class="w-6 h-6 rounded-full bg-red-500 shadow-lg shadow-red-500/50 mx-auto mb-2 flex items-center justify-center text-white text-xs"
              >
                📍
              </div>
              <p class="text-xs text-denim-200/60">
                {{ eq.lat }}, {{ eq.lng }}
              </p>
              <p class="text-xs text-caramel/60 mt-1">{{ eq.location }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Details + Tabs -->
      <div class="lg:col-span-3 space-y-4">
        <!-- Identity card -->
        <div class="card p-0 overflow-hidden">
          <table class="w-full text-sm">
            <tbody>
              <tr
                v-for="row in identityRows"
                :key="row.label"
                class="border-b border-denim-700/20 last:border-0"
              >
                <td
                  class="px-4 py-2.5 text-denim-200/50 font-medium text-xs w-40 shrink-0"
                >
                  {{ row.label }}
                </td>
                <td class="px-4 py-2.5 text-white font-medium">
                  {{ row.value || "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab content -->
        <div class="card p-0 overflow-hidden">
          <!-- Tab header strip -->
          <div class="flex border-b border-denim-700/40 overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px"
              :class="
                activeTab === tab.key
                  ? 'border-caramel text-caramel'
                  : 'border-transparent text-denim-200/50 hover:text-white'
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Maintenance Record -->
          <div v-if="activeTab === 'maintenance'" class="overflow-x-auto">
            <table class="w-full text-xs min-w-[600px]">
              <thead>
                <tr class="border-b border-denim-700/30">
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    No
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    ID Maintenance
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Date
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Classification
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Interval
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    WO Status
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Operation
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Healthy
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(r, i) in maintenanceRecords"
                  :key="r.id"
                  class="border-b border-denim-700/10 hover:bg-denim-700/10"
                >
                  <td class="px-3 py-2 text-denim-200/40">{{ i + 1 }}</td>
                  <td class="px-3 py-2 font-mono text-caramel">{{ r.id }}</td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.date }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      :class="classColor(r.classification)"
                      >{{ r.classification }}</span
                    >
                  </td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.interval }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px]"
                      :class="woColor(r.woStatus)"
                      >{{ r.woStatus }}</span
                    >
                  </td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.operation }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px]"
                      :class="
                        r.healthy === 'Good'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      "
                      >{{ r.healthy }}</span
                    >
                  </td>
                </tr>
                <tr v-if="!maintenanceRecords.length">
                  <td
                    colspan="8"
                    class="px-3 py-6 text-center text-denim-200/30"
                  >
                    No maintenance records
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Trouble Record -->
          <div v-else-if="activeTab === 'trouble'" class="overflow-x-auto">
            <table class="w-full text-xs min-w-[700px]">
              <thead>
                <tr class="border-b border-denim-700/30">
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    No
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    ID Kerusakan
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Nama Kerusakan
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Tanggal
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Operasi
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Kondisi
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Dampak
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Reporter
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(r, i) in troubleRecords"
                  :key="r.id"
                  class="border-b border-denim-700/10 hover:bg-denim-700/10"
                >
                  <td class="px-3 py-2 text-denim-200/40">{{ i + 1 }}</td>
                  <td class="px-3 py-2 font-mono text-caramel">{{ r.id }}</td>
                  <td class="px-3 py-2 text-white font-medium">{{ r.name }}</td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.date }}</td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.operation }}</td>
                  <td
                    class="px-3 py-2 text-denim-100/70 max-w-[120px] truncate"
                    :title="r.condition"
                  >
                    {{ r.condition }}
                  </td>
                  <td
                    class="px-3 py-2 text-denim-100/70 max-w-[120px] truncate"
                    :title="r.impact"
                  >
                    {{ r.impact }}
                  </td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.reporter }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      :class="tStatus(r.status)"
                      >{{ r.status }}</span
                    >
                  </td>
                </tr>
                <tr v-if="!troubleRecords.length">
                  <td
                    colspan="9"
                    class="px-3 py-6 text-center text-denim-200/30"
                  >
                    No matching records found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Activities tab -->
          <div v-else-if="activeTab === 'activities'" class="p-4 space-y-2">
            <div
              v-for="(a, i) in eqActivities"
              :key="a.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-denim-900/40 border border-denim-700/20"
            >
              <span class="text-xs text-denim-200/30 w-4 text-right shrink-0">{{
                i + 1
              }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white">{{ a.name }}</p>
                <p class="text-xs text-denim-200/50">
                  {{ a.type }} · {{ a.answerType }}
                  <span v-if="a.unit">· {{ a.unit }}</span>
                </p>
              </div>
              <span
                class="text-[10px] px-2 py-0.5 rounded font-medium"
                :class="
                  a.status === 'Enable'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-denim-600/50 text-denim-200/40'
                "
                >{{ a.status }}</span
              >
            </div>
            <p
              v-if="!eqActivities.length"
              class="text-xs text-denim-200/30 text-center py-6"
            >
              No activities
            </p>
          </div>

          <!-- Active WO -->
          <div v-else-if="activeTab === 'active-wo'" class="overflow-x-auto">
            <table class="w-full text-xs min-w-[600px]">
              <thead>
                <tr class="border-b border-denim-700/30">
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    No
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    ID Maintenance
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Date
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Classification
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Interval
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    WO Status
                  </th>
                  <th
                    class="px-3 py-2 text-left text-denim-200/50 uppercase tracking-wide"
                  >
                    Technician
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(r, i) in activeWOs"
                  :key="r.id"
                  class="border-b border-denim-700/10 hover:bg-denim-700/10"
                >
                  <td class="px-3 py-2 text-denim-200/40">{{ i + 1 }}</td>
                  <td class="px-3 py-2 font-mono text-caramel">{{ r.id }}</td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.date }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px]"
                      :class="classColor(r.classification)"
                      >{{ r.classification }}</span
                    >
                  </td>
                  <td class="px-3 py-2 text-denim-100/70">{{ r.interval }}</td>
                  <td class="px-3 py-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] animate-pulse"
                      :class="woColor(r.woStatus)"
                      >{{ r.woStatus }}</span
                    >
                  </td>
                  <td class="px-3 py-2 text-denim-100/70">
                    {{ r.technician }}
                  </td>
                </tr>
                <tr v-if="!activeWOs.length">
                  <td
                    colspan="7"
                    class="px-3 py-6 text-center text-denim-200/30"
                  >
                    No active work orders
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Statistics -->
          <div v-else-if="activeTab === 'stats'" class="p-4 space-y-4">
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="row in statsRows"
                  :key="row.label"
                  class="border-b border-denim-700/20 last:border-0"
                >
                  <td class="py-2 text-denim-200/50 text-xs">
                    {{ row.label }}
                  </td>
                  <td class="py-2 text-denim-200/50 text-center px-2">:</td>
                  <td class="py-2 text-white font-medium text-xs">
                    {{ row.value }}
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Failure History -->
            <div>
              <p
                class="text-xs font-semibold text-denim-200/60 uppercase tracking-wide mb-2"
              >
                Failure History
              </p>
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-denim-700/30">
                    <th class="py-1.5 text-left text-denim-200/40">No</th>
                    <th class="py-1.5 text-left text-denim-200/40">
                      Tanggal Down
                    </th>
                    <th class="py-1.5 text-left text-denim-200/40">
                      Tanggal Up
                    </th>
                    <th class="py-1.5 text-left text-denim-200/40">
                      Total Downtime
                    </th>
                    <th class="py-1.5 text-left text-denim-200/40">
                      Kerusakan
                    </th>
                    <th class="py-1.5 text-left text-denim-200/40">Reporter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!failureHistory.length">
                    <td colspan="6" class="py-4 text-center text-denim-200/30">
                      No failure history
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                class="mt-3 text-[10px] text-denim-200/30 space-y-0.5 border-t border-denim-700/20 pt-3"
              >
                <p>• MTBF = Mean Time Before Failure</p>
                <p>• MTTR = Mean Time to Repair</p>
                <p>• Availability berdasarkan faktor MTBF dan MTTR</p>
                <p>• PM rutin diabaikan dalam perhitungan availability</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showQR"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showQR = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-xs text-center"
          >
            <div
              class="px-5 py-4 border-b border-denim-700/40 flex items-center justify-between"
            >
              <h3 class="font-bold text-white">QR Code</h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showQR = false"
              >
                ✕
              </button>
            </div>
            <div class="p-6">
              <!-- SVG QR placeholder -->
              <div class="w-40 h-40 mx-auto bg-white rounded-lg p-2 mb-4">
                <svg viewBox="0 0 21 21" class="w-full h-full">
                  <rect
                    x="0"
                    y="0"
                    width="7"
                    height="7"
                    fill="none"
                    stroke="black"
                    stroke-width="1"
                  />
                  <rect x="1" y="1" width="5" height="5" fill="black" />
                  <rect
                    x="14"
                    y="0"
                    width="7"
                    height="7"
                    fill="none"
                    stroke="black"
                    stroke-width="1"
                  />
                  <rect x="15" y="1" width="5" height="5" fill="black" />
                  <rect
                    x="0"
                    y="14"
                    width="7"
                    height="7"
                    fill="none"
                    stroke="black"
                    stroke-width="1"
                  />
                  <rect x="1" y="15" width="5" height="5" fill="black" />
                  <rect x="9" y="2" width="1" height="1" fill="black" />
                  <rect x="11" y="2" width="1" height="1" fill="black" />
                  <rect x="9" y="4" width="3" height="1" fill="black" />
                  <rect x="9" y="9" width="5" height="1" fill="black" />
                  <rect x="14" y="9" width="1" height="5" fill="black" />
                  <rect x="16" y="10" width="3" height="1" fill="black" />
                  <rect x="9" y="14" width="3" height="3" fill="black" />
                  <rect x="13" y="15" width="2" height="2" fill="black" />
                  <rect x="16" y="14" width="2" height="4" fill="black" />
                  <rect x="19" y="16" width="2" height="2" fill="black" />
                </svg>
              </div>
              <p class="text-xs font-mono text-caramel font-bold">
                {{ eq.id }}
              </p>
              <p class="text-xs text-denim-200/50 mt-1">{{ eq.name }}</p>
              <button class="btn-secondary w-full justify-center mt-4 text-xs">
                Download QR
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
const eqId = route.params.eqId as string;

const activeTab = ref("maintenance");
const showQR = ref(false);
const showEdit = ref(false);

const tabs = [
  { key: "maintenance", label: "Maintenance Record" },
  { key: "trouble", label: "Trouble Record" },
  { key: "activities", label: "Activities" },
  { key: "active-wo", label: "Active WO" },
  { key: "stats", label: "Statistics" },
];

// ── Equipment data (would come from API) ──────────────────
const eq = ref({
  id: eqId || "EDA_EM1_2_AC_FUNC_ROOM_1",
  name: "AC FUNCTION ROOM",
  classification: "Others",
  type: "AC Fasilitas",
  plant: "Essence Darmawangsa Apartment",
  section: "Air Conditioner",
  location: "LANTAI 2",
  lat: "-6.2685346",
  lng: "106.8074791",
  criticalLevel: 2,
  serial: "",
  model: "",
  capacity: "",
  brand: "",
  vendor: "",
  maintainer: "PT Sumber Sarana Solusindo",
  installDate: "2 Dec 2002",
  other: "",
  status: "Active",
});

const identityRows = computed(() => [
  { label: "ID / Tag Number", value: eq.value.id },
  { label: "Equipment Name", value: eq.value.name },
  { label: "Equipment Classification", value: eq.value.classification },
  { label: "Equipment Type", value: eq.value.type },
  { label: "Plant", value: eq.value.plant },
  { label: "Section / System", value: eq.value.section },
  { label: "Location Floor/Level", value: eq.value.location },
  {
    label: "Coordinate (Lat, Long)",
    value: `${eq.value.lat}, ${eq.value.lng}`,
  },
  { label: "Critical Level (5 highest)", value: eq.value.criticalLevel },
  { label: "Serial Number", value: eq.value.serial },
  { label: "Model Number", value: eq.value.model },
  { label: "Size / Capacity", value: eq.value.capacity },
  { label: "Maker", value: eq.value.brand },
  { label: "Vendor", value: eq.value.vendor },
  { label: "Maintainer", value: eq.value.maintainer },
  { label: "Date of Installation", value: eq.value.installDate },
]);

const statsRows = computed(() => [
  { label: "Nama Equipment", value: `${eq.value.id} (${eq.value.name})` },
  { label: "Beroperasi Sejak", value: eq.value.installDate },
  { label: "Total Calendar Time", value: "740,075 hari (17,761,807.00 jam)" },
  { label: "Total Downtime", value: "0.00 jam" },
  { label: "Jumlah Down", value: "0 kali" },
  { label: "Reliability (MTBF)", value: "17,761,807.00 jam" },
  { label: "MTTR", value: "0.00 jam" },
  { label: "Availability", value: "100.00 %" },
]);

// ── Placeholder records ──────────────────────────────────
const maintenanceRecords = ref([
  {
    id: "MNT-2026-0012",
    date: "2026-01-15",
    classification: "Preventive",
    interval: "Monthly",
    woStatus: "Finish",
    operation: "Operasi",
    healthy: "Good",
  },
  {
    id: "MNT-2025-0089",
    date: "2025-12-15",
    classification: "Preventive",
    interval: "Monthly",
    woStatus: "Finish",
    operation: "Operasi",
    healthy: "Good",
  },
  {
    id: "MNT-2025-0055",
    date: "2025-09-10",
    classification: "Preventive",
    interval: "3 Monthly",
    woStatus: "Finish",
    operation: "Operasi",
    healthy: "Good",
  },
]);

const troubleRecords = ref([
  {
    id: "TBL-2025-0003",
    name: "AC Compressor Failure",
    date: "2025-11-03",
    operation: "Down",
    condition: "Freon habis, kompresor lemah",
    impact: "Ruangan panas, ketidaknyamanan penghuni",
    reporter: "Ahmad Fauzi",
    status: "Finished",
  },
]);

const eqActivities = ref([
  {
    id: 1,
    name: "Cleaning Filter",
    type: "Cleaning",
    answerType: "Qualitative",
    unit: "Bersih",
    status: "Enable",
  },
  {
    id: 2,
    name: "Cek Freon",
    type: "Measurement",
    answerType: "Quantitative",
    unit: "PSI",
    status: "Enable",
  },
  {
    id: 3,
    name: "Thermography",
    type: "Thermographic Investigation",
    answerType: "Qualitative",
    unit: "",
    status: "Enable",
  },
]);

const activeWOs = ref([
  {
    id: "WO-2026-0042",
    date: "2026-03-04",
    classification: "Preventive",
    interval: "Monthly",
    woStatus: "Process",
    technician: "Ahmad Fauzi",
  },
]);

const failureHistory = ref([]);

// ── Helpers ──────────────────────────────────────────────
function classColor(c: string) {
  if (c === "Preventive") return "bg-blue-500/15 text-blue-300";
  if (c === "Corrective") return "bg-green-500/15 text-green-300";
  if (c === "Predictive") return "bg-orange-500/15 text-orange-300";
  return "bg-purple-500/15 text-purple-300";
}
function woColor(s: string) {
  if (s === "Finish") return "bg-green-500/15 text-green-400";
  if (s === "Process") return "bg-caramel/15 text-caramel";
  if (s === "Reporting") return "bg-yellow-500/15 text-yellow-300";
  if (s === "Waiting") return "bg-denim-600/50 text-denim-200";
  return "bg-denim-600/50 text-denim-200";
}
function tStatus(s: string) {
  if (s === "Finished") return "bg-green-500/15 text-green-400";
  if (s === "Open") return "bg-yellow-400/15 text-yellow-300";
  if (s === "Alert") return "bg-red-500/15 text-red-400";
  return "bg-denim-600/50 text-denim-200";
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
</style>
