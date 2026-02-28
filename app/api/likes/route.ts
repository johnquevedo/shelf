import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { likeSchema } from "@/lib/validators/reviews";

export async function POST(request: Request) {
  const user = await requireUser();
  const payload = likeSchema.parse(await request.json());
  await prisma.like.upsert({
    where: {
      userId_reviewId: {
        userId: user.id,
        reviewId: payload.reviewId
      }
    },
    update: {},
    create: {
      userId: user.id,
      reviewId: payload.reviewId
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const payload = likeSchema.parse(await request.json());
  await prisma.like.deleteMany({
    where: {
      userId: user.id,
      reviewId: payload.reviewId
    }
  });

  return NextResponse.json({ ok: true });
}
