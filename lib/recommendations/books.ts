import type { Book, Review } from "@prisma/client";

export type RecommendationInput = {
  targetUserId: string;
  reviews: Array<Pick<Review, "userId" | "bookId" | "rating" | "createdAt">>;
  books: Array<Pick<Book, "id" | "title">>;
};

export function recommendBooksForUser({ targetUserId, reviews, books }: RecommendationInput) {
  const seenByTarget = new Set(
    reviews.filter((review) => review.userId === targetUserId).map((review) => review.bookId)
  );
  const likedByTarget = new Set(
    reviews
      .filter((review) => review.userId === targetUserId && (review.rating ?? 0) >= 4)
      .map((review) => review.bookId)
  );

  const candidateUsers = new Set(
    reviews
      .filter((review) => likedByTarget.has(review.bookId) && review.userId !== targetUserId && (review.rating ?? 0) >= 4)
      .map((review) => review.userId)
  );

  const candidates = new Map<string, { score: number; recentBoost: number }>();
  const overlapCounts = new Map<string, number>();

  for (const candidateUser of candidateUsers) {
    const overlap = reviews.filter(
      (review) =>
        review.userId === candidateUser && likedByTarget.has(review.bookId) && (review.rating ?? 0) >= 4
    ).length;
    overlapCounts.set(candidateUser, overlap);
  }

  for (const review of reviews) {
    if (
      !candidateUsers.has(review.userId) ||
      !review.rating ||
      review.rating < 4 ||
      seenByTarget.has(review.bookId)
    ) {
      continue;
    }
    const current = candidates.get(review.bookId) ?? { score: 0, recentBoost: 0 };
    current.score += review.rating + (overlapCounts.get(review.userId) ?? 0);
    const ageDays = Math.max(
      1,
      Math.floor((Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );
    current.recentBoost += 1 / ageDays;
    candidates.set(review.bookId, current);
  }

  const ranked = [...candidates.entries()]
    .sort((a, b) => {
      const scoreA = a[1].score + a[1].recentBoost;
      const scoreB = b[1].score + b[1].recentBoost;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return a[0].localeCompare(b[0]);
    })
    .map(([bookId]) => books.find((book) => book.id === bookId))
    .filter(Boolean) as Array<Pick<Book, "id" | "title">>;

  if (ranked.length > 0) {
    return ranked;
  }

  const fallback = new Map<string, { total: number; count: number; recent: number }>();
  for (const review of reviews) {
    if (seenByTarget.has(review.bookId) || !review.rating) {
      continue;
    }
    const existing = fallback.get(review.bookId) ?? { total: 0, count: 0, recent: 0 };
    existing.total += review.rating;
    existing.count += 1;
    existing.recent += new Date(review.createdAt).getTime();
    fallback.set(review.bookId, existing);
  }

  return [...fallback.entries()]
    .sort((a, b) => {
      const avgA = a[1].total / a[1].count;
      const avgB = b[1].total / b[1].count;
      if (avgB !== avgA) {
        return avgB - avgA;
      }
      return b[1].recent - a[1].recent;
    })
    .map(([bookId]) => books.find((book) => book.id === bookId))
    .filter(Boolean) as Array<Pick<Book, "id" | "title">>;
}
