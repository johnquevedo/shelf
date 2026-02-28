import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { followSchema } from "@/lib/validators/reviews";

export async function POST(request: Request) {
  const user = await requireUser();
  const payload = followSchema.parse(await request.json());
  if (payload.userId === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: payload.userId
      }
    },
    update: {},
    create: {
      followerId: user.id,
      followingId: payload.userId
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const payload = followSchema.parse(await request.json());
  await prisma.follow.deleteMany({
    where: {
      followerId: user.id,
      followingId: payload.userId
    }
  });

  return NextResponse.json({ ok: true });
}
