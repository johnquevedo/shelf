import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      authors: { include: { author: true } },
      reviews: {
        include: {
          user: true,
          _count: { select: { likes: true } }
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(book);
}
