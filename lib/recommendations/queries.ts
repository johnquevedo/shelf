import { prisma } from "@/lib/prisma";
import { recommendBooksForUser } from "@/lib/recommendations/books";

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export async function getBookRecommendations(userId: string) {
  const [reviews, books] = await Promise.all([
    prisma.review.findMany({
      select: {
        userId: true,
        bookId: true,
        rating: true,
        createdAt: true
      }
    }),
    prisma.book.findMany({
      select: {
        id: true,
        title: true
      }
    })
  ]);

  const ranked = recommendBooksForUser({
    targetUserId: userId,
    reviews,
    books
  });

  const ids = ranked.slice(0, 8).map((book) => book.id);
  if (!ids.length) {
    return [];
  }

  const results = await prisma.book.findMany({
    where: { id: { in: ids } },
    include: {
      authors: { include: { author: true } },
      reviews: true
    }
  });

  return ids.map((id) => results.find((result) => result.id === id)).filter(isDefined);
}

export async function getExploreSections(userId: string) {
  const now = new Date();
  const recentWindow = new Date(now);
  recentWindow.setDate(recentWindow.getDate() - 14);
  const trendingWindow = new Date(now);
  trendingWindow.setDate(trendingWindow.getDate() - 30);

  const [recommended, trendingReviews, recentBooks, topRatedGroups, topReviewers] = await Promise.all([
    getBookRecommendations(userId),
    prisma.review.groupBy({
      by: ["bookId"],
      where: {
        createdAt: { gte: trendingWindow }
      },
      _count: { bookId: true },
      _avg: { rating: true },
      orderBy: [{ _count: { bookId: "desc" } }, { _avg: { rating: "desc" } }],
      take: 6
    }),
    prisma.book.findMany({
      where: { publishedYear: { gte: now.getFullYear() - 2 } },
      include: { authors: { include: { author: true } }, reviews: true },
      orderBy: [{ publishedYear: "desc" }, { createdAt: "desc" }],
      take: 6
    }),
    prisma.review.groupBy({
      by: ["bookId"],
      where: {
        rating: { not: null }
      },
      _avg: { rating: true },
      _count: { bookId: true },
      orderBy: [{ _avg: { rating: "desc" } }, { _count: { bookId: "desc" } }],
      take: 20
    }),
    prisma.user.findMany({
      take: 5,
      include: {
        _count: { select: { reviews: true, followers: true } }
      },
      orderBy: [{ reviews: { _count: "desc" } }, { followers: { _count: "desc" } }],
      where: {
        reviews: {
          some: {
            createdAt: {
              gte: recentWindow
            }
          }
        }
      }
    })
  ]);

  const trendingBookIds = trendingReviews.map((entry) => entry.bookId);
  const topRatedBookIds = topRatedGroups
    .filter((entry) => (entry._avg.rating ?? 0) >= 4 && entry._count.bookId >= 1)
    .slice(0, 6)
    .map((entry) => entry.bookId);

  const [trendingBooks, highestRatedBooks] = await Promise.all([
    prisma.book.findMany({
      where: { id: { in: trendingBookIds } },
      include: { authors: { include: { author: true } }, reviews: true }
    }),
    prisma.book.findMany({
      where: { id: { in: topRatedBookIds } },
      include: { authors: { include: { author: true } }, reviews: true }
    })
  ]);

  return {
    trending: trendingBookIds.map((id) => trendingBooks.find((book) => book.id === id)).filter(isDefined),
    recent: recentBooks,
    recommended,
    topReviewers,
    topRated: topRatedBookIds
      .map((id) => highestRatedBooks.find((book) => book.id === id))
      .filter(isDefined)
  };
}
