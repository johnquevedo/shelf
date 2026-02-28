import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

type StorageConfig = {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
};

function getStorageConfig(): StorageConfig | null {
  const bucket = process.env.STORAGE_BUCKET?.trim();
  const region = process.env.STORAGE_REGION?.trim();
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY?.trim();
  const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL?.trim();
  const endpoint = process.env.STORAGE_ENDPOINT?.trim();

  if (!bucket || !region || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    return null;
  }

  return {
    bucket,
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true"
  };
}

function getClient(config: StorageConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
}

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "");
}

function getExtension(file: File) {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

export function isObjectStorageConfigured() {
  return Boolean(getStorageConfig());
}

export async function uploadProfileImageToObjectStorage(userId: string, file: File) {
  const config = getStorageConfig();
  if (!config) {
    throw new Error("Object storage is not configured.");
  }

  const client = getClient(config);
  const extension = getExtension(file);
  const key = `profiles/${userId}/${randomUUID()}-${sanitizeFileName(file.name || "profile")}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return {
    key,
    url: `${config.publicBaseUrl}/${key}`
  };
}

export async function deleteObjectByUrl(url: string | null | undefined) {
  if (!url) return;

  const config = getStorageConfig();
  if (!config) return;
  if (!url.startsWith(`${config.publicBaseUrl}/`)) return;

  const key = url.slice(config.publicBaseUrl.length + 1);
  if (!key) return;

  const client = getClient(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key
    })
  );
}
