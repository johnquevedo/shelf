import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const payload = resetPasswordSchema.parse(await request.json());
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: payload.token }
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId }
    })
  ]);

  return NextResponse.json({ ok: true });
}
