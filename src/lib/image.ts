/**
 * Client-side image downscaling for admin uploads.
 *
 * Phone photos arrive at 2–5 MB and several thousand pixels wide, which is far
 * more than a 900px product tile needs. Compressing in the browser means the
 * large original is never sent over the network at all — the saving is on the
 * admin's upload as well as every shopper's download.
 */

/** Longest edge of the stored image. Product tiles render at ~900px CSS. */
const MAX_EDGE = 1800;
const QUALITY = 0.82;

/** Below this, re-encoding tends to cost more than it saves. */
const SKIP_UNDER_BYTES = 250_000;

/** Formats where re-encoding would destroy something: animation or vector. */
const SKIP_TYPES = new Set(["image/gif", "image/svg+xml", "image/avif"]);

export type CompressResult = {
  blob: Blob;
  /** File extension matching the encoded type, e.g. "webp". */
  ext: string;
  contentType: string;
  originalBytes: number;
  bytes: number;
};

const extFor = (type: string): string =>
  type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";

const encode = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Returns a downscaled copy, or the original untouched when compression is
 * inapplicable or fails. Never throws — a failed optimisation must not block
 * the upload it was meant to improve.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  const passthrough: CompressResult = {
    blob: file,
    ext: file.name.split(".").pop()?.toLowerCase() || "jpg",
    contentType: file.type || "application/octet-stream",
    originalBytes: file.size,
    bytes: file.size,
  };

  if (SKIP_TYPES.has(file.type) || !file.type.startsWith("image/")) return passthrough;
  if (file.size < SKIP_UNDER_BYTES) return passthrough;
  if (typeof createImageBitmap !== "function") return passthrough;

  try {
    // from-image applies EXIF orientation, so portrait phone photos are not
    // stored sideways — canvas drawing otherwise ignores the orientation tag.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return passthrough;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    // WebP where the browser can encode it, JPEG otherwise. A canvas asked for
    // an unsupported type silently returns PNG, so the result is checked.
    let type = "image/webp";
    let blob = await encode(canvas, type, QUALITY);
    if (!blob || blob.type !== type) {
      type = "image/jpeg";
      blob = await encode(canvas, type, QUALITY);
    }
    if (!blob) return passthrough;

    // Keep the original if re-encoding did not actually help.
    if (blob.size >= file.size) return passthrough;

    return {
      blob,
      ext: extFor(blob.type),
      contentType: blob.type,
      originalBytes: file.size,
      bytes: blob.size,
    };
  } catch {
    return passthrough;
  }
}

export const formatBytes = (n: number): string =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.round(n / 1000)} KB`;
