import { prisma } from "@/lib/prisma";

export async function searchUsers(query: string, currentUserId: string) {
  if (query.trim().length < 2) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
      ]
    },
    include: {
      _count: {
        select: {
          followers: true,
          reviews: true
        }
      }
    },
    orderBy: [{ followers: { _count: "desc" } }, { reviews: { _count: "desc" } }],
    take: 8
  });
}
