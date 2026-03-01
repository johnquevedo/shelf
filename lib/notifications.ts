import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string) {
  const [likes, comments, follows] = await Promise.all([
    prisma.like.findMany({
      where: {
        userId: {
          not: userId
        },
        review: {
          userId
        }
      },
      include: {
        user: true,
        review: {
          include: {
            book: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.comment.findMany({
      where: {
        userId: {
          not: userId
        },
        review: {
          userId
        }
      },
      include: {
        user: true,
        review: {
          include: {
            book: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.follow.findMany({
      where: {
        followingId: userId
      },
      include: {
        follower: true
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  const items = [
    ...likes.map((like) => ({
      id: like.id,
      type: "like" as const,
      createdAt: like.createdAt,
      actorName: like.user.name,
      actorUsername: like.user.username,
      text: `liked your review of ${like.review.book.title}`
    })),
    ...comments.map((comment) => ({
      id: comment.id,
      type: "comment" as const,
      createdAt: comment.createdAt,
      actorName: comment.user.name,
      actorUsername: comment.user.username,
      text: `commented on your review of ${comment.review.book.title}`,
      body: comment.body
    })),
    ...follows.map((follow) => ({
      id: follow.id,
      type: "follow" as const,
      createdAt: follow.createdAt,
      actorName: follow.follower.name,
      actorUsername: follow.follower.username,
      text: "started following you"
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return items;
}

export async function getNotificationCount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsSeenAt: true }
  });
  const seenAt = user?.notificationsSeenAt ?? null;
  const unseenFilter = seenAt ? { gt: seenAt } : undefined;

  const [likesCount, commentsCount, followsCount] = await Promise.all([
    prisma.like.count({
      where: {
        ...(unseenFilter ? { createdAt: unseenFilter } : {}),
        userId: {
          not: userId
        },
        review: {
          userId
        }
      }
    }),
    prisma.comment.count({
      where: {
        ...(unseenFilter ? { createdAt: unseenFilter } : {}),
        userId: {
          not: userId
        },
        review: {
          userId
        }
      }
    }),
    prisma.follow.count({
      where: {
        ...(unseenFilter ? { createdAt: unseenFilter } : {}),
        followingId: userId
      }
    })
  ]);

  return likesCount + commentsCount + followsCount;
}

export async function markNotificationsSeen(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      notificationsSeenAt: new Date()
    }
  });
}
