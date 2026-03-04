<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Code *</label>
        <input v-model="form.code" class="input" placeholder="EQ-001" :disabled="!!initial?.id" />
      </div>
      <div>
        <label class="label">Name *</label>
        <input v-model="form.name" class="input" placeholder="Centrifugal Pump" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Category *</label>
        <input v-model="form.category" class="input" placeholder="Pumps" />
      </div>
      <div>
        <label class="label">Location</label>
        <input v-model="form.location" class="input" placeholder="Building A – Floor 2" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Manufacturer</label>
        <input v-model="form.manufacturer" class="input" placeholder="Grundfos" />
      </div>
      <div>
        <label class="label">Model</label>
        <input v-model="form.model" class="input" placeholder="CM5-6" />
      </div>
    </div>

    <div>
      <label class="label">Serial Number</label>
      <input v-model="form.serialNumber" class="input" placeholder="SN-XXXX-YYYY" />
    </div>

    <div>
      <label class="label">Status</label>
      <select v-model="form.status" class="input">
        <option value="OPERATIONAL">Operational</option>
        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
        <option value="OUT_OF_SERVICE">Out of Service</option>
        <option value="DECOMMISSIONED">Decommissioned</option>
      </select>
    </div>

    <div>
      <label class="label">Description</label>
      <textarea v-model="form.description" class="input resize-none" rows="3" placeholder="Brief description…" />
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary">{{ initial?.id ? "Save Changes" : "Create Equipment" }}</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { Equipment } from "@/types";

const props = defineProps<{ initial?: Partial<Equipment> | null }>();
const emit = defineEmits<{
  submit: [data: Partial<Equipment>];
  cancel: [];
}>();

const form = reactive<Partial<Equipment>>({
  code: "",
  name: "",
  category: "",
  location: "",
  manufacturer: "",
  model: "",
  serialNumber: "",
  status: "OPERATIONAL",
  description: "",
});

watch(
  () => props.initial,
  (val) => {
    if (val) Object.assign(form, val);
  },
  { immediate: true }
);

function submit() {
  emit("submit", { ...form });
}
</script>
