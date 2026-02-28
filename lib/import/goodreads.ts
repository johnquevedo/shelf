import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { slugifyShelfName } from "@/lib/utils";

type GoodreadsRow = {
  Title?: string;
  Author?: string;
  ISBN?: string;
  ISBN13?: string;
  "My Rating"?: string;
  "My Review"?: string;
  ExclusiveShelf?: string;
  Bookshelves?: string;
  "Date Read"?: string;
};

export async function importGoodreadsCsv(userId: string, csvText: string) {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  }) as GoodreadsRow[];

  let importedBooks = 0;
  let importedRatings = 0;
  let importedReviews = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = row.Title?.trim();
    const authorName = row.Author?.trim();
    if (!title || !authorName) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.book.findFirst({
      where: {
        OR: [
          row.ISBN ? { isbn10: row.ISBN } : undefined,
          row.ISBN13 ? { isbn13: row.ISBN13 } : undefined,
          {
            title: { equals: title, mode: "insensitive" },
            authors: {
              some: {
                author: { name: { equals: authorName, mode: "insensitive" } }
              }
            }
          }
        ].filter(Boolean) as object[]
      },
      include: { authors: { include: { author: true } } }
    });

    const book =
      existing ||
      (await prisma.book.create({
        data: {
          title,
          isbn10: row.ISBN || undefined,
          isbn13: row.ISBN13 || undefined,
          authors: {
            create: {
              author: {
                connectOrCreate: {
                  where: { name: authorName },
                  create: { name: authorName }
                }
              }
            }
          }
        }
      }));

    if (!existing) {
      importedBooks += 1;
    }

    const shelfNames = new Set<string>();
    if (row.ExclusiveShelf) shelfNames.add(row.ExclusiveShelf);
    if (row.Bookshelves) {
      row.Bookshelves.split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => shelfNames.add(item));
    }

    for (const shelfName of shelfNames) {
      const slug = slugifyShelfName(shelfName);
      const shelf = await prisma.shelf.upsert({
        where: {
          userId_slug: { userId, slug }
        },
        update: {
          emoji: undefined
        },
        create: {
          userId,
          name: shelfName,
          slug,
          isDefault: ["want-to-read", "reading", "read"].includes(slug)
        }
      });

      await prisma.shelfItem.upsert({
        where: {
          shelfId_bookId: {
            shelfId: shelf.id,
            bookId: book.id
          }
        },
        update: {},
        create: {
          shelfId: shelf.id,
          bookId: book.id
        }
      });
    }

    const rating = Number(row["My Rating"] || 0) || null;
    const body = row["My Review"]?.trim() || null;

    if (rating || body) {
      const result = await prisma.review.upsert({
        where: {
          userId_bookId: {
            userId,
            bookId: book.id
          }
        },
        update: { rating, body },
        create: { userId, bookId: book.id, rating, body }
      });

      if (result.rating) {
        importedRatings += 1;
      }
      if (result.body) {
        importedReviews += 1;
      }
    }

    if (row["Date Read"]) {
      const date = new Date(row["Date Read"]);
      if (!Number.isNaN(date.getTime())) {
        await prisma.readingLog.upsert({
          where: {
            userId_bookId_date: {
              userId,
              bookId: book.id,
              date
            }
          },
          update: {
            pagesReadInt: 1
          },
          create: {
            userId,
            bookId: book.id,
            date,
            pagesReadInt: 1
          }
        });
      }
    }
  }

  return {
    importedBooks,
    importedRatings,
    importedReviews,
    skipped
  };
}
