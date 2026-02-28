import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { addShelfItemSchema } from "@/lib/validators/books";
import { removeBookShelfMembership, setBookShelfMembership } from "@/lib/books/shelves";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const payload = addShelfItemSchema.parse(await request.json());
  const { slug } = await params;
  const shelf = await setBookShelfMembership({
    userId: user.id,
    bookId: payload.bookId,
    targetSlug: slug
  });
  return NextResponse.json({ ok: true, shelf });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const payload = addShelfItemSchema.parse(await request.json());
  const { slug } = await params;
  const shelf = await removeBookShelfMembership({
    userId: user.id,
    bookId: payload.bookId,
    targetSlug: slug
  });

  return NextResponse.json({ ok: true, shelf });
}
