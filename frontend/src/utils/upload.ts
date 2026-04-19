/**
 * uploadImages — sends compressed images to the backend /upload/images endpoint.
 *
 * Converts base64 data URLs (from imageCompress) back to Blob,
 * then sends as multipart/form-data.
 *
 * Returns array of server-side /uploads/... URLs.
 */
import api from "@/utils/api";

export interface UploadResult {
  urls: string[];
  count: number;
}

/**
 * Upload one or more base64 data-URL strings as a multipart form.
 * @param base64s     Array of base64 JPEG data URLs (from compressImage)
 * @param entityType  "work-order" | "trouble" | "equipment" | "activity"
 * @param entityId    UUID or code of the parent entity
 */
export async function uploadImages(
  base64s: string[],
  entityType: string,
  entityId: string,
): Promise<string[]> {
  if (!base64s.length) return [];

  const form = new FormData();
  form.append("entityType", entityType);
  form.append("entityId", entityId);

  for (let i = 0; i < base64s.length; i++) {
    const blob = dataUrlToBlob(base64s[i]);
    form.append("files", blob, `photo_${i + 1}.jpg`);
  }

  const res = await api.post<{ data: UploadResult }>("/upload/images", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data?.urls ?? [];
}

/**
 * Upload raw File objects directly (without prior compression).
 * Use when you want the backend to receive the original file.
 */
export async function uploadFiles(
  files: File[],
  entityType: string,
  entityId: string,
): Promise<string[]> {
  if (!files.length) return [];

  const form = new FormData();
  form.append("entityType", entityType);
  form.append("entityId", entityId);
  files.forEach((f) => form.append("files", f, f.name));

  const res = await api.post<{ data: UploadResult }>("/upload/images", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data?.urls ?? [];
}

/**
 * Delete a file by its server URL.
 */
export async function deleteUpload(url: string): Promise<void> {
  await api.delete("/upload/images", { data: { url } });
}

// ── Helpers ────────────────────────────────────────────────────
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
