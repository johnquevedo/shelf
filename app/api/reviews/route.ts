import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { reviewSchema } from "@/lib/validators/reviews";

async function upsertReview(request: Request) {
  const user = await requireUser();
  const payload = reviewSchema.parse(await request.json());

  const review = await prisma.review.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: payload.bookId
      }
    },
    update: {
      rating: payload.rating,
      body: payload.body
    },
    create: {
      userId: user.id,
      bookId: payload.bookId,
      rating: payload.rating,
      body: payload.body
    }
  });

  return NextResponse.json(review);
}

export async function POST(request: Request) {
  return upsertReview(request);
}

export async function PUT(request: Request) {
  return upsertReview(request);
}
