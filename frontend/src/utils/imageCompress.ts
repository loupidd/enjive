/**
 * Compress an image File to a base64 JPEG string.
 * @param file       - the File object from an <input type="file">
 * @param maxPx      - longest edge in pixels (default 1200)
 * @param quality    - JPEG quality 0–1 (default 0.82)
 */
export function compressImage(
  file: File,
  maxPx = 1200,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple files concurrently, returns array of base64 strings.
 */
export async function compressImages(
  files: File[],
  maxPx = 1200,
  quality = 0.82,
): Promise<string[]> {
  return Promise.all(files.map((f) => compressImage(f, maxPx, quality)));
}
