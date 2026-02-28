import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { logReadingSchema } from "@/lib/validators/journal";

export async function POST(request: Request) {
  const user = await requireUser();
  const payload = logReadingSchema.parse(await request.json());
  const date = new Date(payload.date);

  const log = await prisma.readingLog.upsert({
    where: {
      userId_bookId_date: {
        userId: user.id,
        bookId: payload.bookId,
        date
      }
    },
    update: {
      pagesReadInt: payload.pagesReadInt
    },
    create: {
      userId: user.id,
      bookId: payload.bookId,
      date,
      pagesReadInt: payload.pagesReadInt
    }
  });

  return NextResponse.json(log);
}
