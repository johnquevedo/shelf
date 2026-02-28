import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_]+$/),
  bio: z.string().max(160).nullable()
});

export const profileImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const maxProfileImageBytes = 5 * 1024 * 1024;

function isJpeg(bytes: Uint8Array) {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array) {
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isWebp(bytes: Uint8Array) {
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function isAvif(bytes: Uint8Array) {
  return (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x61 &&
    bytes[9] === 0x76 &&
    bytes[10] === 0x69 &&
    (bytes[11] === 0x66 || bytes[11] === 0x73)
  );
}

export function validateProfileImageFile(file: File) {
  if (!profileImageMimeTypes.includes(file.type as (typeof profileImageMimeTypes)[number])) {
    return "Profile photos must be JPG, PNG, WebP, or AVIF.";
  }

  if (file.size > maxProfileImageBytes) {
    return "Profile photos must be 5 MB or smaller.";
  }

  return null;
}

export async function validateProfileImageContents(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const valid = isJpeg(bytes) || isPng(bytes) || isWebp(bytes) || isAvif(bytes);

  if (!valid) {
    return "The uploaded file does not appear to be a valid image.";
  }

  return null;
}
