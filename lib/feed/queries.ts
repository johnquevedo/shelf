import { prisma } from "@/lib/prisma";

export async function getHomeFeed(userId: string) {
  const recentWindow = new Date();
  recentWindow.setDate(recentWindow.getDate() - 30);

  const [featuredReview, trendingReviews, followingFeed, suggestedReaders] = await Promise.all([
    prisma.review.findFirst({
      where: {
        createdAt: {
          gte: recentWindow
        }
      },
      include: {
        user: true,
        book: { include: { authors: { include: { author: true } } } },
        _count: { select: { likes: true } }
      },
      orderBy: [{ likes: { _count: "desc" } }, { rating: "desc" }, { createdAt: "desc" }]
    }),
    prisma.review.findMany({
      take: 5,
      where: {
        createdAt: {
          gte: recentWindow
        }
      },
      include: {
        user: true,
        book: { include: { authors: { include: { author: true } } } },
        likes: { where: { userId }, select: { id: true } },
        comments: {
          include: {
            user: true
          },
          orderBy: { createdAt: "asc" },
          take: 3
        },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
    }),
    prisma.review.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: userId
            }
          }
        }
      },
      take: 10,
      include: {
        user: true,
        book: { include: { authors: { include: { author: true } } } },
        likes: { where: { userId }, select: { id: true } },
        comments: {
          include: {
            user: true
          },
          orderBy: { createdAt: "asc" },
          take: 3
        },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      where: {
        id: { not: userId },
        followers: { none: { followerId: userId } }
      },
      take: 3,
      include: {
        _count: {
          select: { followers: true, reviews: true }
        }
      },
      orderBy: [{ reviews: { _count: "desc" } }, { followers: { _count: "desc" } }]
    })
  ]);

  return {
    featuredReview,
    trendingReviews,
    followingFeed,
    suggestedReaders
  };
}
