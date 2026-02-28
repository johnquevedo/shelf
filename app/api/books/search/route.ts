import { NextResponse } from "next/server";
import { searchOpenLibrary } from "@/lib/books/open-library";
import { prisma } from "@/lib/prisma";
import { searchBooksSchema } from "@/lib/validators/books";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchBooksSchema.safeParse({ q: searchParams.get("q") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Query must be at least 2 characters." }, { status: 400 });
  }

  const localBooks = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: parsed.data.q, mode: "insensitive" } },
        {
          authors: {
            some: {
              author: {
                name: { contains: parsed.data.q, mode: "insensitive" }
              }
            }
          }
        }
      ]
    },
    include: {
      authors: { include: { author: true } }
    },
    take: 6
  });

  try {
    const remoteResults = await searchOpenLibrary(parsed.data.q);
    const localAsResults = localBooks.map((book) => ({
      workId: book.openLibraryId ?? `local-${book.id}`,
      title: book.title,
      authors: book.authors.map((entry) => entry.author.name),
      coverUrl: book.coverUrl,
      publishedYear: book.publishedYear ?? null,
      isbn10: book.isbn10 ?? null,
      isbn13: book.isbn13 ?? null,
      localBookId: book.id
    }));

    const seen = new Set<string>();
    const results = [...localAsResults, ...remoteResults].filter((result) => {
      const key = `${result.title.toLowerCase()}::${result.authors.join("|").toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    return NextResponse.json({ results: results.slice(0, 12) });
  } catch {
    const results = localBooks.map((book) => ({
      workId: book.openLibraryId ?? `local-${book.id}`,
      title: book.title,
      authors: book.authors.map((entry) => entry.author.name),
      coverUrl: book.coverUrl,
      publishedYear: book.publishedYear ?? null,
      isbn10: book.isbn10 ?? null,
      isbn13: book.isbn13 ?? null,
      localBookId: book.id
    }));
    return NextResponse.json({ results });
  }
}
