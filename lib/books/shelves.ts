import { prisma } from "@/lib/prisma";
import { slugifyShelfName } from "@/lib/utils";

export async function createDefaultShelvesForUser(userId: string) {
  for (const name of ["Want to Read", "Reading", "Read"]) {
    await prisma.shelf.upsert({
      where: {
        userId_slug: {
          userId,
          slug: slugifyShelfName(name)
        }
      },
      update: {},
      create: {
        userId,
        name,
        slug: slugifyShelfName(name),
        isDefault: true
      }
    });
  }
}

export async function getUserShelves(userId: string) {
  return prisma.shelf.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          book: {
            include: {
              authors: { include: { author: true } }
            }
          }
        },
        orderBy: { addedAt: "desc" }
      }
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
  });
}

export async function getBookShelfState(userId: string, bookId: string) {
  const items = await prisma.shelfItem.findMany({
    where: {
      bookId,
      shelf: {
        userId
      }
    },
    include: {
      shelf: true
    }
  });

  return {
    shelfSlugs: items.map((item) => item.shelf.slug),
    defaultShelfSlug: items.find((item) => item.shelf.isDefault)?.shelf.slug ?? null
  };
}

export async function setBookShelfMembership({
  userId,
  bookId,
  targetSlug
}: {
  userId: string;
  bookId: string;
  targetSlug: string;
}) {
  const shelf = await prisma.shelf.findUniqueOrThrow({
    where: {
      userId_slug: {
        userId,
        slug: targetSlug
      }
    }
  });

  await prisma.$transaction(async (tx) => {
    if (shelf.isDefault) {
      const defaultShelves = await tx.shelf.findMany({
        where: {
          userId,
          isDefault: true
        },
        select: { id: true }
      });

      await tx.shelfItem.deleteMany({
        where: {
          bookId,
          shelfId: {
            in: defaultShelves.map((entry) => entry.id)
          }
        }
      });
    }

    await tx.shelfItem.upsert({
      where: {
        shelfId_bookId: {
          shelfId: shelf.id,
          bookId
        }
      },
      update: {},
      create: {
        shelfId: shelf.id,
        bookId
      }
    });
  });

  return shelf;
}

export async function removeBookShelfMembership({
  userId,
  bookId,
  targetSlug
}: {
  userId: string;
  bookId: string;
  targetSlug: string;
}) {
  const shelf = await prisma.shelf.findUniqueOrThrow({
    where: {
      userId_slug: {
        userId,
        slug: targetSlug
      }
    }
  });

  await prisma.shelfItem.deleteMany({
    where: {
      shelfId: shelf.id,
      bookId
    }
  });

  return shelf;
}
