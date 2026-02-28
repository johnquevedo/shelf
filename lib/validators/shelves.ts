import { z } from "zod";

export const createShelfSchema = z.object({
  name: z.string().trim().min(2).max(40)
});

export const deleteShelfSchema = z.object({
  slug: z.string().trim().min(1)
});
