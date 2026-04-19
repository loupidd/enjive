<template>
  <div class="space-y-3">
    <!-- Upload area -->
    <div
      v-if="editable"
      class="border-2 border-dashed border-denim-600/40 rounded-xl p-5 text-center cursor-pointer hover:border-caramel/40 hover:bg-caramel/3 transition-colors"
      @click="inputRef?.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="onFilePick"
      />
      <svg
        class="w-6 h-6 mx-auto mb-2 text-denim-200/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p class="text-xs text-denim-200/40">
        {{ t("workOrder.addPhotos") }} · JPEG/PNG · max 5MB
      </p>
    </div>

    <!-- Photo grid -->
    <div v-if="photos.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="(photo, i) in photos"
        :key="i"
        class="relative group rounded-xl overflow-hidden bg-denim-800"
      >
        <!-- Upload spinner overlay -->
        <div
          v-if="photo.uploading"
          class="absolute inset-0 bg-denim-900/70 flex items-center justify-center z-10"
        >
          <svg
            class="animate-spin w-5 h-5 text-caramel"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        <img
          :src="photo.url"
          class="w-full aspect-square object-cover"
          :alt="photo.note || 'Photo ' + (i + 1)"
        />
        <div
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2"
        >
          <input
            v-if="editable"
            :value="photo.note"
            @input="
              $emit('updateNote', i, ($event.target as HTMLInputElement).value)
            "
            class="w-full bg-transparent text-[10px] text-white/80 placeholder-white/30 outline-none"
            :placeholder="'Caption ' + (i + 1)"
          />
          <p v-else class="text-[10px] text-white/60 truncate">
            {{ photo.note }}
          </p>
        </div>
        <button
          v-if="editable"
          class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]"
          @click="$emit('remove', i)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!editable"
      class="py-8 text-center text-xs text-denim-200/25"
    >
      {{ t("common.noData") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "@/i18n";
import { compressImages } from "@/utils/imageCompress";
import { uploadImages } from "@/utils/upload";

const { t } = useI18n();

const props = defineProps<{
  photos: { url: string; note: string; uploading?: boolean }[];
  editable: boolean;
  entityId?: string;
  entityType?: string;
}>();

const emit = defineEmits<{
  add: [photos: { url: string; note: string; uploading: boolean }[]];
  remove: [index: number];
  updateNote: [index: number, note: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

async function processFiles(files: File[]) {
  if (!files.length) return;
  const base64s = await compressImages(files);
  const previews = base64s.map((url) => ({ url, note: "", uploading: true }));
  emit("add", previews);

  if (props.entityId && props.entityType) {
    try {
      const serverUrls = await uploadImages(
        base64s,
        props.entityType,
        props.entityId,
      );
      // Parent handles swapping preview → server URL via index
      serverUrls.forEach((url, i) => {
        const idx = props.photos.findIndex((p) => p.uploading);
        if (idx >= 0) emit("updateNote", idx, props.photos[idx].note);
        // We emit updated url via a custom event the parent wires
      });
    } catch {
      /* keep base64 on error */
    }
  }
}

function onFilePick(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  processFiles(files);
  (e.target as HTMLInputElement).value = "";
}

function onDrop(e: DragEvent) {
  const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
    f.type.startsWith("image/"),
  );
  processFiles(files);
}
</script>
