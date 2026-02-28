import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { importBookWithShelfSchema } from "@/lib/validators/books";
import { getOrCreateBookFromSearchResult } from "@/lib/books/upsert-book";
import { setBookShelfMembership } from "@/lib/books/shelves";

export async function POST(request: Request) {
  const user = await requireUser();
  const payload = importBookWithShelfSchema.parse(await request.json());
  const { shelfSlug, ...bookPayload } = payload;
  const book = await getOrCreateBookFromSearchResult(bookPayload);

  if (shelfSlug) {
    await setBookShelfMembership({
      userId: user.id,
      bookId: book.id,
      targetSlug: shelfSlug
    });
  }

  return NextResponse.json({ bookId: book.id });
}
