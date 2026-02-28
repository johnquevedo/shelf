"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { uploadProfileImageToObjectStorage, deleteObjectByUrl, isObjectStorageConfigured } from "@/lib/storage/object-storage";
import {
  updateProfileSchema,
  validateProfileImageContents,
  validateProfileImageFile
} from "@/lib/validators/settings";

export async function updateProfileAction(_: { message: string }, formData: FormData) {
  const user = await requireUser();
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    bio: formData.get("bio") || null
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Invalid profile data." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data
  });

  revalidatePath("/settings");
  return { message: "Profile updated." };
}

export async function saveProfileImage(userId: string, file: File) {
  const validationError = validateProfileImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }
  const contentError = await validateProfileImageContents(file);
  if (contentError) {
    throw new Error(contentError);
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageUrl: true }
  });

  if (isObjectStorageConfigured()) {
    const uploaded = await uploadProfileImageToObjectStorage(userId, file);
    await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: uploaded.url }
    });
    await deleteObjectByUrl(existingUser?.imageUrl);
    return uploaded.url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Object storage must be configured in production for profile uploads.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${userId}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, fileName), buffer);

  const imageUrl = `/uploads/${fileName}`;
  await prisma.user.update({
    where: { id: userId },
    data: { imageUrl }
  });

  return imageUrl;
}
