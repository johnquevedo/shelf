import { z } from "zod";

export const reviewSchema = z.object({
  bookId: z.string().cuid(),
  rating: z.number().int().min(1).max(5).nullable(),
  body: z.string().max(800).nullable()
});

export const likeSchema = z.object({
  reviewId: z.string().cuid()
});

export const followSchema = z.object({
  userId: z.string().cuid()
});

export const commentSchema = z.object({
  reviewId: z.string().cuid(),
  body: z.string().trim().min(1).max(400)
});

export const deleteCommentSchema = z.object({
  commentId: z.string().cuid()
});
