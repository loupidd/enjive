<template>
  <div class="print-doc">
    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="print-header">
      <div class="print-header-left">
        <!-- SSS company logo — place PNG at: frontend/public/sss-logo.png -->
        <div class="print-logo-box">
          <img
            v-if="logoLoaded !== false"
            src="/sss-logo.png"
            class="print-logo-img"
            alt="PT SSS"
            @load="logoLoaded = true"
            @error="logoLoaded = false"
          />
          <svg
            v-if="logoLoaded === false"
            width="44"
            height="44"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect width="32" height="32" rx="6" fill="#02314E" />
            <rect x="7" y="8" width="4" height="16" rx="1" fill="#FFC677" />
            <rect x="21" y="8" width="4" height="16" rx="1" fill="#FFC677" />
            <path
              d="M11 8 L21 24"
              stroke="#FFC677"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div>
          <div class="print-org-name">PT SUMBER SARANA SOLUSINDO</div>
          <div class="print-org-sub">
            {{ wo.site || "ESSENCE DARMAWANGSA APARTMENT" }}
          </div>
          <div
            class="print-org-sub"
            style="font-size: 7pt; margin-top: 1px; color: #888"
          >
            Managed by EnJive CMMS
          </div>
        </div>
      </div>
      <div class="print-doc-block">
        <div class="print-title-box">
          <div class="print-title-text">MAINTENANCE REPORT</div>
          <div class="print-wo-id">{{ woId }}</div>
        </div>
        <div class="print-meta-pills">
          <span class="print-pill print-pill-blue">{{ wo.type }}</span>
          <span class="print-pill print-pill-gray">{{ wo.interval }}</span>
          <span
            class="print-pill"
            :class="
              wo.status === 'Finish' ? 'print-pill-green' : 'print-pill-gray'
            "
            >{{ wo.status }}</span
          >
        </div>
      </div>
    </div>

    <div class="print-divider-thick" />

    <!-- ── A. Description ──────────────────────────────────── -->
    <div class="print-section-title">A. Description</div>
    <div class="print-info-grid">
      <div class="print-info-col">
        <div class="print-info-row">
          <span class="print-info-key">ID Maintenance</span
          ><span class="print-info-val mono">{{ woId }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">ID Trouble</span
          ><span class="print-info-val">{{ wo.troubleId || "—" }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Tag Number</span
          ><span class="print-info-val mono">{{ woCode }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Equipment</span
          ><span class="print-info-val">{{ equipmentName }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Type</span
          ><span class="print-info-val">{{ equipmentType }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Section</span
          ><span class="print-info-val">{{ section }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Location</span
          ><span class="print-info-val">{{ location }}</span>
        </div>
      </div>
      <div class="print-info-col">
        <div class="print-info-row">
          <span class="print-info-key">Maintenance Type</span
          ><span class="print-info-val">{{ wo.type }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Interval</span
          ><span class="print-info-val">{{ wo.interval }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Date Start</span
          ><span class="print-info-val">{{ startDate }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Work Duration</span
          ><span class="print-info-val"
            >{{ workReportForm.duration || "—" }} Hours</span
          >
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Coordinator</span
          ><span class="print-info-val">{{ technician }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">Equipment Status</span
          ><span class="print-info-val">{{
            workReportForm.healthy || "—"
          }}</span>
        </div>
        <div class="print-info-row">
          <span class="print-info-key">WO Status</span
          ><span class="print-info-val bold">{{ wo.status }}</span>
        </div>
      </div>
    </div>

    <div v-if="workReportForm.summary" class="print-note-box">
      <span class="print-info-key">Maintenance Report Note: </span
      >{{ workReportForm.summary }}
    </div>
    <div
      v-if="workReportForm.condition"
      class="print-note-box"
      style="margin-top: 4px"
    >
      <span class="print-info-key">Equipment Condition: </span
      >{{ workReportForm.condition }}
    </div>

    <!-- ── B. Workers ──────────────────────────────────────── -->
    <div class="print-section-title">B. Workers</div>
    <table class="print-table">
      <thead>
        <tr>
          <th class="print-th" style="width: 2rem">No</th>
          <th class="print-th">Name</th>
          <th class="print-th">Position</th>
          <th class="print-th">Company</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(w, i) in wo.workers" :key="w.name">
          <td class="print-td center">{{ Number(i) + 1 }}</td>
          <td class="print-td bold">{{ w.name }}</td>
          <td class="print-td">{{ w.position }}</td>
          <td class="print-td">PT Sumber Sarana Solusindo</td>
        </tr>
        <tr v-if="!wo.workers.length">
          <td colspan="4" class="print-td center muted">—</td>
        </tr>
      </tbody>
    </table>

    <!-- ── C. Activity Detail ──────────────────────────────── -->
    <div class="print-section-title">C. Activity Detail</div>
    <div class="print-eq-tag">
      Equipment: {{ woCode }} — {{ equipmentName }}
    </div>

    <!-- Thermography -->
    <div v-if="wo.type === 'Thermography Investigation'">
      <table class="print-table">
        <thead>
          <tr>
            <th class="print-th" style="width: 2rem">No</th>
            <th class="print-th">Activity</th>
            <th class="print-th" style="width: 60px">Max Temp</th>
            <th class="print-th" style="width: 60px">Delta T</th>
            <th class="print-th" style="width: 70px">Result</th>
            <th class="print-th">Finding / Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(act, i) in wo.activities" :key="act.id">
            <td class="print-td center">{{ Number(i) + 1 }}</td>
            <td class="print-td bold">{{ act.name }}</td>
            <td class="print-td center">
              {{ act.tempMax || "—" }}{{ act.tempMax ? "°C" : "" }}
            </td>
            <td class="print-td center">
              {{ act.deltaT || "—" }}{{ act.deltaT ? "°C" : "" }}
            </td>
            <td
              class="print-td center bold"
              :class="
                act.finalResult === 'Normal'
                  ? 'green'
                  : act.finalResult === 'Critical'
                    ? 'red'
                    : ''
              "
            >
              {{ act.finalResult || "—" }}
            </td>
            <td class="print-td">{{ act.note || "—" }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Thermal images — 2 per row, no cut -->
      <div v-if="thermalImages.length" class="print-thermal-grid">
        <div
          v-for="img in thermalImages"
          :key="img.label"
          class="print-thermal-item"
        >
          <img :src="img.src" class="print-thermal-img" />
          <p class="print-thermal-label">{{ img.label }}</p>
        </div>
      </div>
    </div>

    <!-- Standard activities -->
    <div v-else>
      <table class="print-table">
        <thead>
          <tr>
            <th class="print-th" style="width: 2rem">No</th>
            <th class="print-th">Activity</th>
            <th class="print-th" style="width: 80px">Type</th>
            <th class="print-th" style="width: 80px">Before</th>
            <th class="print-th" style="width: 80px">After</th>
            <th class="print-th" style="width: 50px">Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(act, i) in wo.activities" :key="act.id">
            <td class="print-td center">{{ Number(i) + 1 }}</td>
            <td class="print-td bold">{{ act.name }}</td>
            <td class="print-td">{{ act.type }}</td>
            <td class="print-td center">{{ act.preInspection || "—" }}</td>
            <td
              class="print-td center bold"
              :class="
                act.finalResult === 'OK'
                  ? 'green'
                  : act.finalResult === 'Not OK'
                    ? 'red'
                    : ''
              "
            >
              {{ act.finalResult || "—" }}
            </td>
            <td class="print-td center muted">{{ act.unit || "—" }}</td>
          </tr>
          <tr v-if="!wo.activities.length">
            <td colspan="6" class="print-td center muted">
              No activities recorded
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── D. Documentation ────────────────────────────────── -->
    <div v-if="wo.photos && wo.photos.length">
      <div class="print-section-title">D. Documentation</div>
      <div class="print-photo-grid">
        <div v-for="(photo, i) in wo.photos" :key="i" class="print-photo-item">
          <img :src="photo.url" class="print-photo-img" />
          <p class="print-photo-note">
            {{ photo.note || "Photo " + (Number(i) + 1) }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── E. Approval & Signatures — page-break-inside:avoid keeps full block together ── -->
    <div class="print-sig-wrapper">
      <div class="print-section-title" style="margin-top: 0">
        {{ wo.photos && wo.photos.length ? "E" : "D" }}. Approval &amp;
        Signatures
      </div>
      <div class="print-sig-section">
        <div v-for="(sig, i) in signatureSlots" :key="i" class="print-sig-card">
          <div class="print-sig-top-label">{{ sig.action }},</div>
          <div class="print-qr-outer">
            <img
              v-if="sig.qrData"
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(sig.qrData)}&bgcolor=ffffff&color=02314E&margin=3`"
              class="print-qr-img"
              :alt="`QR ${sig.accountId}`"
            />
            <div v-else class="print-qr-placeholder">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                stroke-width="1.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div class="print-corner tl" />
            <div class="print-corner tr" />
            <div class="print-corner bl" />
            <div class="print-corner br" />
          </div>
          <!-- Name + Role displayed clearly -->
          <div class="print-sig-name">
            {{ sig.name || "________________________" }}
          </div>
          <div class="print-sig-account" v-if="sig.accountId">
            @{{ sig.accountId }}
          </div>
          <div class="print-sig-date">{{ sig.date || "\u00a0" }}</div>
          <div class="print-sig-role">{{ sig.title }}</div>
          <div class="print-sig-level" v-if="sig.level">{{ sig.level }}</div>
        </div>
      </div>
    </div>

    <!-- ── Footer ──────────────────────────────────────────── -->
    <div class="print-footer">
      <span
        >Document ID: {{ woId }} · Generated by EnJive CMMS ·
        {{ printDate }}</span
      >
      <span>PT Sumber Sarana Solusindo</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{ wo: any; workReportForm: any }>();

// Safe field accessors — guard empty strings so print never shows blank fields
const equipmentName = computed(
  () => props.wo.equipmentName || props.wo.equipmentId || "—",
);
const equipmentType = computed(() => props.wo.equipmentType || "—");
const section = computed(() => props.wo.section || "—");
const location = computed(() => props.wo.location || "—");
const technician = computed(() => props.wo.technician || "—");
const startDate = computed(
  () => props.wo.startDate || props.wo.createdAt?.slice(0, 10) || "—",
);
const woId = computed(() => props.wo.id || "—");
const woCode = computed(() => props.wo.code || props.wo.id || "—");

const logoLoaded = ref<boolean | null>(null); // null=pending, true=ok, false=error

const printDate = computed(() =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
);

// Signature slots — now shows name, accountId/role, and level
const SIGNATURE_DEFS = [
  {
    action: "Reported by",
    title: "Engineer / Technician",
    roleKey: "Process",
    level: "Technician",
  },
  {
    action: "Reviewed by",
    title: "Admin / Lead Tech",
    roleKey: "Reporting",
    level: "Engineer",
  },
  {
    action: "Approved by",
    title: "Client Supervisor",
    roleKey: "Client Spv Review",
    level: "Supervisor",
  },
  {
    action: "Approved by",
    title: "Chief Engineer",
    roleKey: "Chief Eng Review",
    level: "Chief Eng",
  },
  {
    action: "Acknowledged by",
    title: "Viewer / Management",
    roleKey: "Finish",
    level: "Viewer",
  },
];

const signatureSlots = computed(() =>
  SIGNATURE_DEFS.map((def) => {
    const found = props.wo.signatures?.find((s: any) => s.role === def.roleKey);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    return {
      action: def.action,
      title: def.title,
      level: def.level,
      name: found?.name ?? "",
      accountId: found?.accountId ?? "",
      date: found?.date ?? "",
      qrData: found
        ? `${pageUrl}?verify=${def.roleKey}&by=${encodeURIComponent(found.name)}&acc=${found.accountId}&ts=${found.date}`
        : `${pageUrl}?slot=${def.roleKey}&pending=1`,
    };
  }),
);

// Thermal images
const thermalImages = computed(() => {
  const imgs: { src: string; label: string }[] = [];
  props.wo.activities?.forEach((act: any) => {
    if (act.imgBefore)
      imgs.push({ src: act.imgBefore, label: `${act.name} — Before` });
    if (act.imgAfter)
      imgs.push({ src: act.imgAfter, label: `${act.name} — After` });
  });
  return imgs.slice(0, 6);
});

// QR codes rendered as <img> tags directly — no canvas/CORS issues
</script>

<style>
.print-doc {
  font-family: "Work Sans", Arial, Helvetica, sans-serif;
  font-size: 9pt;
  color: #111;
  background: #ffffff;
  line-height: 1.6;
  max-width: 100%;
}

/* ── Header ─────────────────────────────────────────── */
.print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  gap: 16px;
}
.print-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Logo box */
.print-logo-box {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.print-logo-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  display: block;
}

.print-org-name {
  font-size: 10.5pt;
  font-weight: 800;
  color: #02314e;
  line-height: 1.2;
}
.print-org-sub {
  font-size: 8pt;
  font-weight: 600;
  color: #02314e;
  margin-top: 1px;
}
.print-doc-block {
  text-align: right;
}
.print-title-box {
  margin-bottom: 6px;
}
.print-title-text {
  font-size: 13pt;
  font-weight: 900;
  color: #02314e;
  letter-spacing: 0.04em;
}
.print-wo-id {
  font-family: monospace;
  font-size: 8.5pt;
  color: #7a4a00;
  margin-top: 2px;
}
.print-meta-pills {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.print-pill {
  display: inline-block;
  font-size: 7.5pt;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}
.print-pill-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.print-pill-green {
  background: #dcfce7;
  color: #15803d;
}
.print-pill-gray {
  background: #f1f5f9;
  color: #475569;
}
.print-divider-thick {
  border: none;
  border-top: 2.5px solid #02314e;
  margin: 10px 0 18px;
}

/* ── Section titles ──────────────────────────────────── */
.print-section-title {
  font-size: 9.5pt;
  font-weight: 700;
  color: #02314e;
  margin: 20px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1.5px solid #cbd5e1;
}
.print-eq-tag {
  font-size: 8pt;
  color: #555;
  margin-bottom: 4px;
  font-style: italic;
}

/* ── Info grid ───────────────────────────────────────── */
.print-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  margin-bottom: 10px;
}
.print-info-row {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  padding: 5px 0;
}
.print-info-key {
  width: 44%;
  flex-shrink: 0;
  font-weight: 600;
  color: #555;
  font-size: 8.5pt;
}
.print-info-val {
  flex: 1;
  color: #111;
  font-size: 8.5pt;
}
.print-info-val.mono {
  font-family: monospace;
  color: #7a4a00;
}
.print-info-val.bold {
  font-weight: 700;
}
.print-note-box {
  background: #f8fafc;
  border-left: 3px solid #02314e;
  padding: 8px 12px;
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 4px;
}

/* ── Tables ──────────────────────────────────────────── */
.print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.5pt;
  margin-bottom: 6px;
}
.print-th {
  background: #02314e;
  color: #fff;
  font-weight: 700;
  padding: 7px 10px;
  text-align: left;
  border: 1px solid #02314e;
  font-size: 8pt;
}
.print-td {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  color: #111;
  vertical-align: top;
  font-size: 8.5pt;
}
.print-table tbody tr:nth-child(even) .print-td {
  background: #f8fafc;
}
.print-td.center {
  text-align: center;
}
.print-td.bold {
  font-weight: 700;
}
.print-td.muted {
  color: #94a3b8;
}
.print-td.green {
  color: #15803d;
}
.print-td.red {
  color: #dc2626;
}

/* ── Photos ──────────────────────────────────────────── */
.print-photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}
.print-photo-item {
  width: 175px;
  page-break-inside: avoid;
  break-inside: avoid;
}
.print-photo-img {
  width: 175px;
  height: 130px;
  object-fit: cover;
  border: 1px solid #cbd5e1;
  display: block;
  border-radius: 2px;
}
.print-photo-note {
  font-size: 7.5pt;
  color: #64748b;
  margin-top: 3px;
  text-align: center;
  font-style: italic;
}
.print-thermal-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.print-thermal-item {
  width: 130px;
  page-break-inside: avoid;
}
.print-thermal-img {
  width: 130px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #cbd5e1;
  display: block;
  border-radius: 2px;
}
.print-thermal-label {
  font-size: 7pt;
  color: #64748b;
  margin-top: 2px;
  text-align: center;
  font-style: italic;
}

/* ── Signatures — never cut across pages ─────────────── */
.print-sig-wrapper {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
  page-break-before: auto;
  margin-top: 32px;
  padding-top: 12px;
  border-top: 1.5px solid #e2e8f0;
}
.print-sig-section {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
.print-sig-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fafafa;
  page-break-inside: avoid;
  break-inside: avoid;
}
.print-sig-top-label {
  font-size: 7.5pt;
  color: #475569;
  margin-bottom: 4px;
  font-style: italic;
}
.print-qr-outer {
  position: relative;
  width: 72px;
  height: 72px;
  border: 1.5px solid #02314e;
  border-radius: 4px;
  background: #fff;
  padding: 2px;
  margin-bottom: 6px;
}
.print-qr-img {
  display: block;
  width: 72px;
  height: 72px;
  object-fit: contain;
}
.print-qr-placeholder {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 4px;
}
.print-corner {
  position: absolute;
  width: 9px;
  height: 9px;
  border-color: #ffc677;
  border-style: solid;
}
.print-corner.tl {
  top: -2px;
  left: -2px;
  border-width: 2px 0 0 2px;
  border-radius: 3px 0 0 0;
}
.print-corner.tr {
  top: -2px;
  right: -2px;
  border-width: 2px 2px 0 0;
  border-radius: 0 3px 0 0;
}
.print-corner.bl {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 2px 2px;
  border-radius: 0 0 0 3px;
}
.print-corner.br {
  bottom: -2px;
  right: -2px;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 3px 0;
}
.print-sig-name {
  font-size: 8.5pt;
  font-weight: 700;
  color: #02314e;
  margin-bottom: 1px;
}
.print-sig-account {
  font-size: 7pt;
  color: #7a4a00;
  font-family: monospace;
  margin-bottom: 1px;
}
.print-sig-date {
  font-size: 7.5pt;
  color: #94a3b8;
  min-height: 12px;
}
.print-sig-role {
  font-size: 7.5pt;
  font-weight: 600;
  color: #475569;
  margin-top: 1px;
}
.print-sig-level {
  font-size: 7pt;
  color: #94a3b8;
  font-style: italic;
}

/* ── Footer ──────────────────────────────────────────── */
.print-footer {
  margin-top: 14px;
  font-size: 7pt;
  color: #94a3b8;
  font-style: italic;
  border-top: 1px solid #e2e8f0;
  padding-top: 6px;
  display: flex;
  justify-content: space-between;
}
</style>
