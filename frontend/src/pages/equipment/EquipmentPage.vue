<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">Equipment</h2>
        <div class="accent-bar mt-1.5" />
      </div>
      <div class="flex gap-2">
        <!-- Download Template -->
        <button
          class="btn-secondary text-xs px-3 py-1.5 gap-1.5"
          @click="downloadTemplate"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Template
        </button>
        <!-- Import XLS -->
        <button
          class="btn-secondary text-xs px-3 py-1.5 gap-1.5"
          @click="showXlsImport = true"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="12" y2="18" />
            <line x1="15" y1="15" x2="12" y2="18" />
          </svg>
          Import XLS
        </button>
        <button
          class="btn-secondary text-xs px-3 py-1.5"
          @click="showAddType = true"
        >
          + Type
        </button>
        <button
          class="btn-primary text-xs px-3 py-1.5"
          @click="openAddEquipment(null)"
        >
          + Equipment
        </button>
      </div>
    </div>

    <!-- Search bar (GlobalSearch, equipment-only) -->
    <div class="max-w-sm">
      <GlobalSearch
        placeholder="Search equipment ID or name..."
        :sources="['equipment']"
      />
    </div>

    <!-- Equipment Types Table -->
    <div class="card p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-denim-700/40">
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Equipment Type
            </th>
            <th
              class="text-center px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Total Equipment
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide"
            >
              Maintainer
            </th>
            <th
              class="px-4 py-3 text-xs font-semibold text-denim-200/60 uppercase tracking-wide text-right"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="type in equipmentTypes"
            :key="type.id"
            class="border-b border-denim-700/20 hover:bg-denim-700/20 transition-colors cursor-pointer"
            @click="goToType(type)"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="typeIcon(type.classification).bg"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    :stroke="typeIcon(type.classification).stroke"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path :d="typeIcon(type.classification).path" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-white">{{ type.name }}</p>
                  <p class="text-xs text-denim-200/50">
                    {{ type.classification }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-lg font-bold text-caramel">{{
                type.total
              }}</span>
            </td>
            <td class="px-4 py-3 text-denim-100/70 text-sm">
              {{ type.maintainer }}
            </td>
            <td class="px-4 py-3 text-right">
              <button
                class="btn-secondary px-2 py-1 text-xs"
                @click.stop="editType(type)"
              >
                Edit
              </button>
            </td>
          </tr>
          <tr v-if="!equipmentTypes.length">
            <td
              colspan="4"
              class="px-4 py-10 text-center text-denim-200/40 text-sm"
            >
              No equipment types yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Type Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddType"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showAddType = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-sm"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-denim-700/40"
            >
              <h3 class="font-bold text-white">
                {{ editingType ? "Edit Type" : "New Equipment Type" }}
              </h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showAddType = false"
              >
                ✕
              </button>
            </div>
            <div class="px-5 py-4 space-y-3">
              <div>
                <label class="label"
                  >Type Name <span class="text-red-400">*</span></label
                >
                <input
                  v-model="typeForm.name"
                  class="input"
                  placeholder="e.g. AC Fasilitas"
                />
              </div>
              <div>
                <label class="label"
                  >Classification <span class="text-red-400">*</span></label
                >
                <select v-model="typeForm.classification" class="input">
                  <option value="">Select</option>
                  <option>Civil</option>
                  <option>Electrical</option>
                  <option>Electronic</option>
                  <option>Mechanical</option>
                  <option>Others</option>
                </select>
              </div>
            </div>
            <div class="px-5 pb-4 flex justify-end gap-2">
              <button class="btn-secondary" @click="showAddType = false">
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="submitType"
                :disabled="!typeForm.name || !typeForm.classification"
              >
                {{ editingType ? "Save" : "Add Type" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add/Edit Equipment Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddEquipment"
          class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
          @click.self="showAddEquipment = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-2xl"
          >
            <div
              class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10 rounded-t-2xl"
            >
              <h3 class="font-bold text-white">
                {{ editingEquipment ? "Edit Equipment" : "Add New Equipment" }}
              </h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showAddEquipment = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >Equipment ID <span class="text-red-400">*</span></label
                  >
                  <input
                    v-model="eqForm.id"
                    class="input font-mono text-xs"
                    placeholder="EDA_AC_001"
                    :disabled="!!editingEquipment"
                  />
                </div>
                <div>
                  <label class="label"
                    >Device Name <span class="text-red-400">*</span></label
                  >
                  <input
                    v-model="eqForm.name"
                    class="input"
                    placeholder="AC Function Room"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >Classification <span class="text-red-400">*</span></label
                  >
                  <select v-model="eqForm.classification" class="input">
                    <option value="">Select</option>
                    <option>Civil</option>
                    <option>Electrical</option>
                    <option>Electronic</option>
                    <option>Mechanical</option>
                    <option>Others</option>
                  </select>
                </div>
                <div>
                  <label class="label"
                    >Equipment Type <span class="text-red-400">*</span></label
                  >
                  <select v-model="eqForm.type" class="input">
                    <option value="">Select</option>
                    <option
                      v-for="t in equipmentTypes"
                      :key="t.id"
                      :value="t.name"
                    >
                      {{ t.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >Section / System <span class="text-red-400">*</span></label
                  >
                  <select v-model="eqForm.section" class="input">
                    <option value="">Select</option>
                    <option v-for="s in SECTIONS" :key="s" :value="s">
                      {{ s }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="label"
                    >Critical Level (1-5)
                    <span class="text-red-400">*</span></label
                  >
                  <select v-model="eqForm.criticalLevel" class="input">
                    <option value="">Select</option>
                    <option v-for="n in 5" :key="n" :value="n">
                      {{ n
                      }}{{
                        n === 5 ? " (Highest)" : n === 1 ? " (Lowest)" : ""
                      }}
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">Plant / Site</label>
                <input
                  v-model="eqForm.plant"
                  class="input"
                  placeholder="Essence Darmawangsa Apartment"
                />
              </div>
              <div>
                <label class="label">Location Floor / Level</label>
                <input
                  v-model="eqForm.location"
                  class="input"
                  placeholder="Lantai 2 / Basement 1"
                />
              </div>
              <div class="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label class="label">Latitude</label>
                  <input
                    v-model="eqForm.lat"
                    class="input font-mono text-xs"
                    placeholder="-6.2685346"
                  />
                </div>
                <div>
                  <label class="label">Longitude</label>
                  <input
                    v-model="eqForm.lng"
                    class="input font-mono text-xs"
                    placeholder="106.8074791"
                  />
                </div>
                <button class="btn-secondary text-xs h-9" @click="getLocation">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path
                      d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"
                    />
                  </svg>
                  Get Location
                </button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Model Number</label
                  ><input v-model="eqForm.model" class="input" placeholder="" />
                </div>
                <div>
                  <label class="label">Serial Number</label
                  ><input
                    v-model="eqForm.serial"
                    class="input"
                    placeholder=""
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Size / Capacity</label
                  ><input
                    v-model="eqForm.capacity"
                    class="input"
                    placeholder="e.g. 2 PK, 50 kW"
                  />
                </div>
                <div>
                  <label class="label">Brand / Maker</label
                  ><input v-model="eqForm.brand" class="input" placeholder="" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Vendor</label
                  ><input
                    v-model="eqForm.vendor"
                    class="input"
                    placeholder=""
                  />
                </div>
                <div>
                  <label class="label"
                    >Maintainer <span class="text-red-400">*</span></label
                  >
                  <select v-model="eqForm.maintainer" class="input">
                    <option>PT Sumber Sarana Solusindo</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">Date of Installation</label>
                <input v-model="eqForm.installDate" type="date" class="input" />
              </div>
              <div>
                <label class="label">Other Notes</label>
                <textarea
                  v-model="eqForm.other"
                  class="input resize-none"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label class="label">Photo (Thumbnail)</label>
                <div
                  class="border-2 border-dashed border-denim-600/50 rounded-lg p-4 text-center hover:border-caramel/40 transition-colors cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="mx-auto mb-2 text-denim-200/40"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p class="text-xs text-denim-200/40">Click to upload photo</p>
                </div>
              </div>
            </div>
            <div
              class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2 rounded-b-2xl"
            >
              <button class="btn-secondary" @click="showAddEquipment = false">
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="submitEquipment"
                :disabled="!isEqValid"
              >
                {{ editingEquipment ? "Save Changes" : "Add Equipment" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>

  <!-- ── XLS Import Modal ─────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showXlsImport"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeXlsImport"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          class="relative bg-denim-800 border border-denim-600/40 rounded-2xl shadow-2xl w-full max-w-2xl"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-denim-700/40"
          >
            <div>
              <h3 class="font-bold text-white">Import Equipment from XLS</h3>
              <p class="text-xs text-denim-200/40 mt-0.5">
                Upload a spreadsheet to bulk-import equipment records
              </p>
            </div>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
              @click="closeXlsImport"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5">
            <!-- Format info -->
            <div
              class="bg-denim-700/20 rounded-xl p-4 border border-denim-700/30"
            >
              <p class="text-xs font-semibold text-white mb-2">
                Accepted column headers
              </p>
              <div
                class="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] text-denim-200/60"
              >
                <div
                  v-for="col in TEMPLATE_COLS"
                  :key="col.key"
                  class="flex items-center gap-1.5"
                >
                  <span
                    :class="col.required ? 'text-red-400' : 'text-denim-200/30'"
                    >●</span
                  >
                  <span class="font-mono text-caramel/70">{{ col.key }}</span>
                  <span class="text-denim-200/40">{{
                    col.aliases.length ? "/ " + col.aliases.join(" / ") : ""
                  }}</span>
                  <span v-if="col.required" class="text-red-400 ml-auto"
                    >required</span
                  >
                </div>
              </div>
              <p class="text-[10px] text-denim-200/30 mt-3">
                <span class="text-red-400">●</span> Required &nbsp;
                <span class="text-denim-200/30">●</span> Optional &nbsp;·&nbsp;
                Column headers are case-insensitive and flexible (aliases
                accepted).
              </p>
            </div>

            <!-- Drop zone -->
            <div
              class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
              :class="
                xlsDragOver
                  ? 'border-caramel/60 bg-caramel/5'
                  : 'border-denim-600/40 hover:border-denim-500/60'
              "
              @dragover.prevent="xlsDragOver = true"
              @dragleave="xlsDragOver = false"
              @drop.prevent="onXlsDrop"
              @click="($refs.xlsFileInput as HTMLElement)?.click()"
            >
              <input
                ref="xlsFileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                class="hidden"
                @change="onXlsFile"
              />
              <svg
                class="mx-auto mb-3"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                :class="xlsDragOver ? 'text-caramel' : 'text-denim-200/30'"
              >
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
              <p class="text-sm text-denim-200/60">
                Drop your
                <span class="text-caramel">.xlsx / .xls / .csv</span> file here
              </p>
              <p class="text-xs text-denim-200/30 mt-1">or click to browse</p>
            </div>

            <!-- Parse errors -->
            <div
              v-if="xlsErrors.length"
              class="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 space-y-1"
            >
              <p class="text-xs font-semibold text-red-400 mb-1">
                Issues found ({{ xlsErrors.length }})
              </p>
              <p
                v-for="(err, i) in xlsErrors.slice(0, 8)"
                :key="i"
                class="text-[11px] text-red-300/80"
              >
                {{ err }}
              </p>
              <p
                v-if="xlsErrors.length > 8"
                class="text-[11px] text-red-300/50"
              >
                …and {{ xlsErrors.length - 8 }} more
              </p>
            </div>

            <!-- Preview table -->
            <div v-if="xlsPreview.length" class="overflow-x-auto">
              <p class="text-xs text-denim-200/50 mb-2">
                Preview — {{ xlsPreview.length }} row{{
                  xlsPreview.length !== 1 ? "s" : ""
                }}
                detected
                <span class="text-caramel ml-1"
                  >({{ xlsValid.length }} valid,
                  {{ xlsPreview.length - xlsValid.length }} skipped)</span
                >
              </p>
              <table class="w-full text-[11px] border-collapse">
                <thead>
                  <tr
                    class="text-denim-200/50 text-left border-b border-denim-700/30"
                  >
                    <th class="py-1.5 pr-3 font-medium">ID</th>
                    <th class="py-1.5 pr-3 font-medium">Name</th>
                    <th class="py-1.5 pr-3 font-medium">Classification</th>
                    <th class="py-1.5 pr-3 font-medium">Type</th>
                    <th class="py-1.5 pr-3 font-medium">Section</th>
                    <th class="py-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, i) in xlsPreview.slice(0, 10)"
                    :key="i"
                    class="border-b border-denim-700/15"
                    :class="row._valid ? '' : 'opacity-40'"
                  >
                    <td class="py-1.5 pr-3 font-mono text-caramel/80">
                      {{ row.id || "—" }}
                    </td>
                    <td class="py-1.5 pr-3 text-white">
                      {{ row.name || "—" }}
                    </td>
                    <td class="py-1.5 pr-3 text-denim-200/60">
                      {{ row.classification || "—" }}
                    </td>
                    <td class="py-1.5 pr-3 text-denim-200/60">
                      {{ row.type || "—" }}
                    </td>
                    <td class="py-1.5 pr-3 text-denim-200/60">
                      {{ row.section || "—" }}
                    </td>
                    <td class="py-1.5">
                      <span v-if="row._valid" class="text-green-400 text-[10px]"
                        >✓ OK</span
                      >
                      <span
                        v-else
                        class="text-red-400 text-[10px]"
                        :title="row._error"
                        >✗ {{ row._error }}</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
              <p
                v-if="xlsPreview.length > 10"
                class="text-[10px] text-denim-200/30 mt-1"
              >
                Showing first 10 of {{ xlsPreview.length }} rows
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 pb-5 flex items-center justify-between gap-3 border-t border-denim-700/30 pt-4"
          >
            <button class="btn-secondary text-xs" @click="downloadTemplate">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Template
            </button>
            <div class="flex gap-2">
              <button class="btn-secondary" @click="closeXlsImport">
                Cancel
              </button>
              <button
                class="btn-primary"
                :disabled="!xlsValid.length"
                @click="confirmXlsImport"
              >
                Import {{ xlsValid.length || "" }} Equipment
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import GlobalSearch from "@/components/common/GlobalSearch.vue";

const router = useRouter();

const SECTIONS = [
  "Access Control",
  "Air Bersih",
  "Air Conditioner",
  "CCTV",
  "FAF",
  "Fire Alarm",
  "Fire Fighting",
  "Genset",
  "IHB",
  "Lighting",
  "Panel Listrik",
  "Pool / Kolam Renang",
  "Power House",
  "Pump",
  "Tata Suara",
  "VAC",
  "Videophone",
];

const equipmentTypes = ref([
  {
    id: 1,
    name: "AC Fasilitas",
    classification: "Mechanical",
    total: 12,
    maintainer: "PT Sumber Sarana Solusindo",
  },
  {
    id: 2,
    name: "Genset",
    classification: "Electrical",
    total: 3,
    maintainer: "PT Sumber Sarana Solusindo",
  },
  {
    id: 3,
    name: "Panel Listrik",
    classification: "Electrical",
    total: 8,
    maintainer: "PT Sumber Sarana Solusindo",
  },
  {
    id: 4,
    name: "CCTV",
    classification: "Electronic",
    total: 24,
    maintainer: "PT Sumber Sarana Solusindo",
  },
  {
    id: 5,
    name: "Fire Alarm",
    classification: "Electronic",
    total: 6,
    maintainer: "PT Sumber Sarana Solusindo",
  },
  {
    id: 6,
    name: "Pompa Air",
    classification: "Mechanical",
    total: 5,
    maintainer: "PT Sumber Sarana Solusindo",
  },
  {
    id: 7,
    name: "Lift / Elevator",
    classification: "Mechanical",
    total: 4,
    maintainer: "PT Sumber Sarana Solusindo",
  },
]);

function typeIcon(c: string) {
  // Enterprise icon: returns bg class + inline SVG path
  const map: Record<string, { bg: string; stroke: string; path: string }> = {
    Mechanical: {
      bg: "bg-blue-500/15",
      stroke: "#60a5fa",
      path: "M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4",
    },
    Electrical: {
      bg: "bg-yellow-500/15",
      stroke: "#facc15",
      path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    },
    Electronic: {
      bg: "bg-purple-500/15",
      stroke: "#c084fc",
      path: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
    },
    Civil: {
      bg: "bg-green-500/15",
      stroke: "#4ade80",
      path: "M3 21h18M3 18h18M3 9l9-6 9 6M4 18V9m16 9V9M8 18v-4a4 4 0 0 1 8 0v4",
    },
    Others: {
      bg: "bg-denim-600/50",
      stroke: "#94a3b8",
      path: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    },
  };
  return map[c] ?? map.Others;
}
function goToType(type: any) {
  router.push(`/equipment/type/${type.id}`);
}

const showAddType = ref(false);
const editingType = ref<any>(null);
const typeForm = ref({ name: "", classification: "" });
function editType(t: any) {
  editingType.value = t;
  typeForm.value = { name: t.name, classification: t.classification };
  showAddType.value = true;
}
function submitType() {
  if (editingType.value) {
    const idx = equipmentTypes.value.findIndex(
      (t) => t.id === editingType.value.id,
    );
    if (idx >= 0)
      equipmentTypes.value[idx] = {
        ...equipmentTypes.value[idx],
        ...typeForm.value,
      };
  } else {
    equipmentTypes.value.push({
      id: Date.now(),
      name: typeForm.value.name,
      classification: typeForm.value.classification,
      total: 0,
      maintainer: "PT Sumber Sarana Solusindo",
    });
  }
  showAddType.value = false;
  editingType.value = null;
  typeForm.value = { name: "", classification: "" };
}

const showAddEquipment = ref(false);
const editingEquipment = ref<any>(null);
const eqForm = ref({
  id: "",
  name: "",
  classification: "",
  type: "",
  section: "",
  criticalLevel: "",
  plant: "Essence Darmawangsa Apartment",
  location: "",
  lat: "",
  lng: "",
  model: "",
  serial: "",
  capacity: "",
  brand: "",
  vendor: "",
  maintainer: "PT Sumber Sarana Solusindo",
  installDate: "",
  other: "",
});
function openAddEquipment(eq: any) {
  editingEquipment.value = eq;
  if (eq) Object.assign(eqForm.value, eq);
  else
    eqForm.value = {
      id: "",
      name: "",
      classification: "",
      type: "",
      section: "",
      criticalLevel: "",
      plant: "Essence Darmawangsa Apartment",
      location: "",
      lat: "",
      lng: "",
      model: "",
      serial: "",
      capacity: "",
      brand: "",
      vendor: "",
      maintainer: "PT Sumber Sarana Solusindo",
      installDate: "",
      other: "",
    };
  showAddEquipment.value = true;
}
const isEqValid = computed(
  () =>
    eqForm.value.id &&
    eqForm.value.name &&
    eqForm.value.classification &&
    eqForm.value.type &&
    eqForm.value.section &&
    eqForm.value.criticalLevel &&
    eqForm.value.maintainer,
);
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((p) => {
      eqForm.value.lat = String(p.coords.latitude);
      eqForm.value.lng = String(p.coords.longitude);
    });
  }
}
function submitEquipment() {
  showAddEquipment.value = false;
}

// ── XLS Import ──────────────────────────────────────────────────

// Column definitions: key = canonical name, aliases = other accepted names
const TEMPLATE_COLS = [
  {
    key: "id",
    aliases: ["equipment_id", "eq_id", "asset_id", "asset id", "equipment id"],
    required: true,
  },
  {
    key: "name",
    aliases: [
      "device_name",
      "device name",
      "equipment_name",
      "nama",
      "nama alat",
    ],
    required: true,
  },
  {
    key: "classification",
    aliases: ["class", "klasifikasi", "category"],
    required: true,
  },
  {
    key: "type",
    aliases: ["type_name", "equipment_type", "tipe", "jenis"],
    required: true,
  },
  {
    key: "section",
    aliases: ["area", "zone", "lokasi", "sub_area"],
    required: true,
  },
  {
    key: "critical_level",
    aliases: ["critical", "level", "criticality", "critical level"],
    required: false,
  },
  {
    key: "location",
    aliases: ["lokasi_detail", "floor", "lantai"],
    required: false,
  },
  {
    key: "model",
    aliases: ["model_number", "model no", "no model"],
    required: false,
  },
  {
    key: "serial",
    aliases: ["serial_number", "serial no", "no serial", "sn"],
    required: false,
  },
  { key: "brand", aliases: ["merk", "maker", "brand/maker"], required: false },
  { key: "vendor", aliases: ["supplier", "pemasok"], required: false },
  {
    key: "install_date",
    aliases: ["installed", "tanggal_pasang", "install date", "tanggal pasang"],
    required: false,
  },
  {
    key: "capacity",
    aliases: ["size", "ukuran", "kapasitas"],
    required: false,
  },
  {
    key: "maintainer",
    aliases: ["maintenance_by", "maintained by", "perawatan"],
    required: false,
  },
];

const showXlsImport = ref(false);
const xlsDragOver = ref(false);
const xlsPreview = ref<any[]>([]);
const xlsErrors = ref<string[]>([]);
const xlsValid = computed(() => xlsPreview.value.filter((r) => r._valid));

function closeXlsImport() {
  showXlsImport.value = false;
  xlsPreview.value = [];
  xlsErrors.value = [];
}

// Normalise a header string to match our canonical keys
function normaliseHeader(h: string): string {
  const lower = h
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "_");
  for (const col of TEMPLATE_COLS) {
    if (col.key === lower) return col.key;
    if (
      col.aliases
        .map((a) => a.toLowerCase().replace(/[\s_-]+/g, "_"))
        .includes(lower)
    )
      return col.key;
  }
  return lower;
}

function parseRows(rows: string[][]): any[] {
  if (!rows.length) return [];
  const headers = rows[0].map(normaliseHeader);
  const results: any[] = [];
  const errs: string[] = [];

  rows.slice(1).forEach((row, i) => {
    if (row.every((c) => !c?.toString().trim())) return; // skip empty rows
    const obj: any = {};
    headers.forEach((h, j) => {
      obj[h] = row[j]?.toString().trim() ?? "";
    });

    // Validate required fields
    const missing = TEMPLATE_COLS.filter((c) => c.required && !obj[c.key]).map(
      (c) => c.key,
    );

    if (missing.length) {
      obj._valid = false;
      obj._error = `Missing: ${missing.join(", ")}`;
      errs.push(`Row ${i + 2}: missing ${missing.join(", ")}`);
    } else {
      obj._valid = true;
    }
    results.push(obj);
  });
  xlsErrors.value = errs;
  return results;
}

async function processFile(file: File) {
  xlsPreview.value = [];
  xlsErrors.value = [];

  // CSV path
  if (file.name.endsWith(".csv")) {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((l) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
    xlsPreview.value = parseRows(rows);
    return;
  }

  // XLSX/XLS — use SheetJS via dynamic import (available in Vite via CDN type)
  try {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
      header: 1,
      defval: "",
    }) as string[][];
    xlsPreview.value = parseRows(rows);
  } catch {
    xlsErrors.value = [
      "Failed to parse file. Please use .xlsx, .xls or .csv format.",
    ];
  }
}

function onXlsFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) processFile(f);
}
function onXlsDrop(e: DragEvent) {
  xlsDragOver.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) processFile(f);
}

function confirmXlsImport() {
  // Merge valid rows into equipment list
  // In production this would POST to the API
  const imported = xlsValid.value.map((row, i) => ({
    id: row.id,
    name: row.name,
    classification: row.classification,
    type: row.type,
    section: row.section,
    criticalLevel: row.critical_level || "L2",
    plant: "Essence Darmawangsa Apartment",
    location: row.location || "",
    model: row.model || "",
    serial: row.serial || "",
    brand: row.brand || "",
    vendor: row.vendor || "",
    maintainer: row.maintainer || "PT Sumber Sarana Solusindo",
    installDate: row.install_date || "",
    capacity: row.capacity || "",
  }));
  // Add to types if new type names found
  imported.forEach((eq) => {
    const exists = equipmentTypes.value.some(
      (t) => t.name.toLowerCase() === eq.type.toLowerCase(),
    );
    if (!exists && eq.type) {
      equipmentTypes.value.push({
        id: Date.now() + Math.random(),
        name: eq.type,
        classification: eq.classification,
        total: 0,
        maintainer: eq.maintainer,
      });
    }
  });
  alert(`✅ ${imported.length} equipment records imported successfully.

Note: Connect to the API to persist this data.`);
  closeXlsImport();
}

// Download the official template
function downloadTemplate() {
  const headers = TEMPLATE_COLS.map((c) => c.key).join(",");
  const example =
    "EDA_AC_001,AC Function Room,Mechanical,AC Fasilitas,Air Conditioner,L2,Lantai 2,Samsung VRF,SN-123,Samsung,PT ABC,2020-01-15,5PK,PT Sumber Sarana Solusindo";
  const csv = `${headers}
${example}
`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "enjive_equipment_template.csv";
  a.click();
  URL.revokeObjectURL(url);
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
