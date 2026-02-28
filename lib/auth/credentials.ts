import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export type CredentialCheckResult =
  | { ok: true; user: { id: string; email: string; name: string; imageUrl: string | null; username: string } }
  | { ok: false; reason: "INVALID_CREDENTIALS" | "EMAIL_NOT_VERIFIED" };

export async function validateCredentials(email: string, password: string): Promise<CredentialCheckResult> {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  if (!user.emailVerifiedAt) {
    return { ok: false, reason: "EMAIL_NOT_VERIFIED" };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl ?? null,
      username: user.username
    }
  };
}
