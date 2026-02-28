import { z } from "zod";

export const logReadingSchema = z.object({
  bookId: z.string().cuid(),
  pagesReadInt: z.number().int().min(1).max(5000),
  date: z.string().date()
});
