import { prisma } from "@/lib/prisma";
import {
  enrichBookMetadata,
  enrichOpenLibraryResult,
  getOpenLibraryWork,
  type OpenLibrarySearchResult
} from "@/lib/books/open-library";

type CreateBookInput = OpenLibrarySearchResult & {
  description?: string | null;
};

export async function upsertBookFromSearchResult(input: CreateBookInput) {
  const normalized = await enrichOpenLibraryResult(input);
  const workId = normalized.workId ?? input.workId;
  const authors = normalized.authors.length ? normalized.authors : ["Unknown author"];

  return prisma.book.upsert({
    where: {
      openLibraryId: workId
    },
    update: {
      title: normalized.title,
      coverUrl: normalized.coverUrl,
      publishedYear: normalized.publishedYear ?? undefined,
      isbn10: normalized.isbn10 ?? undefined,
      isbn13: normalized.isbn13 ?? undefined,
      description: input.description ?? undefined,
      authors: {
        deleteMany: {},
        create: authors.map((name) => ({
          author: {
            connectOrCreate: {
              where: { name },
              create: { name }
            }
          }
        }))
      }
    },
    create: {
      openLibraryId: workId,
      title: normalized.title,
      coverUrl: normalized.coverUrl,
      publishedYear: normalized.publishedYear ?? undefined,
      isbn10: normalized.isbn10 ?? undefined,
      isbn13: normalized.isbn13 ?? undefined,
      description: input.description ?? undefined,
      authors: {
        create: authors.map((name) => ({
          author: {
            connectOrCreate: {
              where: { name },
              create: { name }
            }
          }
        }))
      }
    },
    include: {
      authors: { include: { author: true } }
    }
  });
}

export async function ensureBookByOpenLibraryId(workId: string) {
  const existing = await prisma.book.findUnique({
    where: { openLibraryId: workId },
    include: {
      authors: { include: { author: true } }
    }
  });

  if (existing) {
    return existing;
  }

  const work = await getOpenLibraryWork(workId);

  return prisma.book.create({
    data: {
      openLibraryId: workId,
      title: work.title,
      description: work.description,
      coverUrl: work.coverUrl,
      isbn10: work.isbn10 ?? undefined,
      isbn13: work.isbn13 ?? undefined,
      publishedYear: work.publishedYear ?? undefined,
      authors: {
        create: work.authors.map((name) => ({
          author: {
            connectOrCreate: {
              where: { name },
              create: { name }
            }
          }
        }))
      }
    },
    include: {
      authors: { include: { author: true } }
    }
  });
}

export async function getOrCreateBookFromSearchResult(input: CreateBookInput) {
  const existing =
    (input.isbn13
      ? await prisma.book.findUnique({
          where: { isbn13: input.isbn13 },
          include: { authors: { include: { author: true } } }
        })
      : null) ||
    (input.isbn10
      ? await prisma.book.findUnique({
          where: { isbn10: input.isbn10 },
          include: { authors: { include: { author: true } } }
        })
      : null) ||
    (await prisma.book.findUnique({
      where: { openLibraryId: input.workId },
      include: { authors: { include: { author: true } } }
    }));

  if (existing) {
    return upsertBookFromSearchResult(input);
  }

  return upsertBookFromSearchResult(input);
}

export async function backfillStoredBooksMetadata(limit = 100) {
  const books = await prisma.book.findMany({
    where: {
      OR: [
        { coverUrl: null },
        { openLibraryId: { not: null } }
      ]
    },
    include: {
      authors: {
        include: {
          author: true
        }
      }
    },
    take: limit,
    orderBy: {
      createdAt: "asc"
    }
  });

  let updated = 0;

  for (const book of books) {
    const enriched = await enrichBookMetadata({
      workId: book.openLibraryId,
      title: book.title,
      authors: book.authors.map((entry) => entry.author.name),
      coverUrl: book.coverUrl,
      publishedYear: book.publishedYear ?? null,
      isbn10: book.isbn10 ?? null,
      isbn13: book.isbn13 ?? null,
      description: book.description ?? null
    });

    const nextAuthors = enriched.authors.length ? enriched.authors : book.authors.map((entry) => entry.author.name);
    const currentAuthors = book.authors.map((entry) => entry.author.name);
    const hasAuthorChanges =
      nextAuthors.length !== currentAuthors.length ||
      nextAuthors.some((author, index) => author !== currentAuthors[index]);
    const hasMetadataChanges =
      enriched.title !== book.title ||
      enriched.coverUrl !== book.coverUrl ||
      enriched.publishedYear !== (book.publishedYear ?? null) ||
      enriched.description !== (book.description ?? null) ||
      enriched.isbn10 !== (book.isbn10 ?? null) ||
      enriched.isbn13 !== (book.isbn13 ?? null);

    if (!hasAuthorChanges && !hasMetadataChanges) {
      continue;
    }

    await prisma.book.update({
      where: { id: book.id },
      data: {
        title: enriched.title,
        coverUrl: enriched.coverUrl,
        publishedYear: enriched.publishedYear ?? undefined,
        description: enriched.description ?? undefined,
        isbn10: enriched.isbn10 ?? undefined,
        isbn13: enriched.isbn13 ?? undefined,
        authors: {
          deleteMany: {},
          create: nextAuthors.map((name) => ({
            author: {
              connectOrCreate: {
                where: { name },
                create: { name }
              }
            }
          }))
        }
      }
    });
    updated += 1;
  }

  return { scanned: books.length, updated };
}
