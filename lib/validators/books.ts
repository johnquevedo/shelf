import { z } from "zod";

export const searchBooksSchema = z.object({
  q: z.string().trim().min(2)
});

export const addShelfItemSchema = z.object({
  bookId: z.string().cuid()
});

export const importBookSchema = z.object({
  workId: z.string().min(3),
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  coverUrl: z.string().url().nullable(),
  publishedYear: z.number().nullable(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable()
});

export const importBookWithShelfSchema = importBookSchema.extend({
  shelfSlug: z.string().min(1).optional()
});
