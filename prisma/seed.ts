import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

type SeedBook = {
  title: string;
  authors: string[];
  openLibraryId?: string;
  coverUrl?: string;
  description?: string;
  publishedYear?: number;
};

const books: SeedBook[] = [
  {
    title: "Pride and Prejudice",
    authors: ["Jane Austen"],
    description: "Elizabeth Bennet navigates family pressure, first impressions, and a sharply observed courtship.",
    publishedYear: 1813
  },
  {
    title: "Beloved",
    authors: ["Toni Morrison"],
    description: "A haunted household forces memory, grief, and survival into the open.",
    publishedYear: 1987
  },
  {
    title: "The Left Hand of Darkness",
    authors: ["Ursula K. Le Guin"],
    description: "An envoy on a distant world confronts politics, exile, and a radically different social order.",
    publishedYear: 1969
  },
  {
    title: "Kindred",
    authors: ["Octavia E. Butler"],
    description: "Dana is pulled across time into a violent history that becomes inseparable from her own life.",
    publishedYear: 1979
  },
  {
    title: "The Great Gatsby",
    authors: ["F. Scott Fitzgerald"],
    description: "Nick Carraway watches wealth, longing, and self-invention burn through one Long Island summer.",
    publishedYear: 1925
  },
  {
    title: "A Wizard of Earthsea",
    authors: ["Ursula K. Le Guin"],
    description: "A gifted young mage learns that power without self-knowledge carries a cost.",
    publishedYear: 1968
  },
  {
    title: "The Fifth Season",
    authors: ["N. K. Jemisin"],
    description: "A broken world and a fractured family collide as catastrophe reshapes an empire.",
    publishedYear: 2015
  },
  {
    title: "Station Eleven",
    authors: ["Emily St. John Mandel"],
    description: "A traveling troupe preserves art and memory after a flu pandemic remakes the world.",
    publishedYear: 2014
  },
  {
    title: "Giovanni's Room",
    authors: ["James Baldwin"],
    description: "David’s attempt to outrun intimacy only sharpens the tragedy at the center of his life in Paris.",
    publishedYear: 1956
  },
  {
    title: "Circe",
    authors: ["Madeline Miller"],
    description: "A mythic exile becomes a study in power, solitude, and self-making.",
    publishedYear: 2018
  },
  {
    title: "Never Let Me Go",
    authors: ["Kazuo Ishiguro"],
    description: "A seemingly quiet school story slowly reveals a devastating system beneath it.",
    publishedYear: 2005
  },
  {
    title: "Parable of the Sower",
    authors: ["Octavia E. Butler"],
    description: "Lauren Olamina builds a philosophy of survival while the world around her breaks apart.",
    publishedYear: 1993
  }
];

async function createBook(seed: SeedBook) {
  if (!seed.openLibraryId) {
    const existing = await prisma.book.findFirst({
      where: {
        title: seed.title
      },
      include: {
        authors: { include: { author: true } }
      }
    });

    if (existing) {
      return prisma.book.update({
        where: { id: existing.id },
        data: {
          description: seed.description,
          coverUrl: seed.coverUrl,
          publishedYear: seed.publishedYear
        },
        include: {
          authors: { include: { author: true } }
        }
      });
    }

    return prisma.book.create({
      data: {
        title: seed.title,
        coverUrl: seed.coverUrl,
        description: seed.description,
        publishedYear: seed.publishedYear,
        authors: {
          create: seed.authors.map((name) => ({
            author: {
              connectOrCreate: {
                where: { name },
                create: { name }
              }
            }
          }))
        }
      },
      include: {
        authors: { include: { author: true } }
      }
    });
  }

  return prisma.book.upsert({
    where: { openLibraryId: seed.openLibraryId ?? undefined },
    update: {},
    create: {
      title: seed.title,
      openLibraryId: seed.openLibraryId,
      coverUrl: seed.coverUrl,
      description: seed.description,
      publishedYear: seed.publishedYear,
      authors: {
        create: await Promise.all(
          seed.authors.map(async (name) => ({
            author: {
              connectOrCreate: {
                where: { name },
                create: { name }
              }
            }
          }))
        )
      }
    },
    include: {
      authors: { include: { author: true } }
    }
  });
}

async function createDefaultShelves(userId: string) {
  const defaults = ["Want to Read", "Reading", "Read"];
  for (const name of defaults) {
    await prisma.shelf.upsert({
      where: {
        userId_slug: {
          userId,
          slug: slugify(name, { lower: true, strict: true })
        }
      },
      update: {},
      create: {
        userId,
        name,
        slug: slugify(name, { lower: true, strict: true }),
        isDefault: true
      }
    });
  }
}

async function main() {
  const hashed = await bcrypt.hash("password123", 10);
  const seededBooks = [];
  for (const book of books) {
    seededBooks.push(await createBook(book));
  }

  const demoUsers = [
    {
      email: "ava@example.com",
      name: "Ava Monroe",
      username: "avamonroe",
      bio: "Literary fiction, notebooks, and rainy-day rereads."
    },
    {
      email: "noah@example.com",
      name: "Noah Price",
      username: "noahprice",
      bio: "Sci-fi marathons and review threads."
    },
    {
      email: "lina@example.com",
      name: "Lina Cross",
      username: "linacross",
      bio: "Poetry, essays, and ambitious TBRs."
    },
    {
      email: "demo@shelf.app",
      name: "Demo Reader",
      username: "demoreader",
      bio: "Testing the waters one page at a time."
    }
  ];

  const users = [];
  for (const user of demoUsers) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        passwordHash: hashed,
        emailVerifiedAt: new Date()
      },
      create: {
        ...user,
        passwordHash: hashed,
        emailVerifiedAt: new Date()
      }
    });
    users.push(created);
    await createDefaultShelves(created.id);
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: users[3].id,
        followingId: users[0].id
      }
    },
    update: {},
    create: {
      followerId: users[3].id,
      followingId: users[0].id
    }
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: users[3].id,
        followingId: users[1].id
      }
    },
    update: {},
    create: {
      followerId: users[3].id,
      followingId: users[1].id
    }
  });

  const reviewSeeds = [
    {
      userId: users[0].id,
      bookId: seededBooks[0].id,
      rating: 5,
      body: "Still one of the sharpest social comedies in print. The dialogue never loses its edge."
    },
    {
      userId: users[1].id,
      bookId: seededBooks[1].id,
      rating: 5,
      body: "Dense, devastating, and completely controlled. It earns every ounce of its weight."
    },
    {
      userId: users[2].id,
      bookId: seededBooks[2].id,
      rating: 5,
      body: "Le Guin can make politics, weather, and loneliness feel equally alive."
    },
    {
      userId: users[3].id,
      bookId: seededBooks[3].id,
      rating: 4,
      body: "Brutal premise, precise execution. Butler does not waste a page."
    },
    {
      userId: users[0].id,
      bookId: seededBooks[6].id,
      rating: 5,
      body: "The scale is enormous and the voice stays intimate the whole time."
    },
    {
      userId: users[1].id,
      bookId: seededBooks[7].id,
      rating: 4,
      body: "Quietly haunting. Every timeline makes the others richer."
    },
    {
      userId: users[2].id,
      bookId: seededBooks[8].id,
      rating: 5,
      body: "Bracing and elegant. Baldwin leaves nowhere to hide."
    },
    {
      userId: users[3].id,
      bookId: seededBooks[9].id,
      rating: 4,
      body: "A myth retelling with actual interiority instead of spectacle."
    },
    {
      userId: users[0].id,
      bookId: seededBooks[10].id,
      rating: 4,
      body: "Quiet on the surface, devastating underneath."
    },
    {
      userId: users[1].id,
      bookId: seededBooks[11].id,
      rating: 5,
      body: "One of the clearest visions of social collapse and adaptation I’ve read."
    }
  ];

  for (const review of reviewSeeds) {
    await prisma.review.upsert({
      where: {
        userId_bookId: {
          userId: review.userId,
          bookId: review.bookId
        }
      },
      update: review,
      create: review
    });
  }

  const readingShelf = await prisma.shelf.findFirstOrThrow({
    where: {
      userId: users[3].id,
      slug: "reading"
    }
  });

  await prisma.shelfItem.upsert({
    where: {
      shelfId_bookId: {
        shelfId: readingShelf.id,
        bookId: seededBooks[7].id
      }
    },
    update: {},
    create: {
      shelfId: readingShelf.id,
      bookId: seededBooks[7].id
    }
  });

  await prisma.readingLog.upsert({
    where: {
      userId_bookId_date: {
        userId: users[3].id,
        bookId: seededBooks[7].id,
        date: new Date("2026-02-25")
      }
    },
    update: { pagesReadInt: 24 },
    create: {
      userId: users[3].id,
      bookId: seededBooks[7].id,
      date: new Date("2026-02-25"),
      pagesReadInt: 24
    }
  });

  await prisma.readingLog.upsert({
    where: {
      userId_bookId_date: {
        userId: users[3].id,
        bookId: seededBooks[7].id,
        date: new Date("2026-02-26")
      }
    },
    update: { pagesReadInt: 35 },
    create: {
      userId: users[3].id,
      bookId: seededBooks[7].id,
      date: new Date("2026-02-26"),
      pagesReadInt: 35
    }
  });

  const likes = [
    { userId: users[3].id, reviewUserId: users[0].id, bookId: seededBooks[0].id },
    { userId: users[3].id, reviewUserId: users[1].id, bookId: seededBooks[1].id },
    { userId: users[0].id, reviewUserId: users[1].id, bookId: seededBooks[1].id },
    { userId: users[1].id, reviewUserId: users[2].id, bookId: seededBooks[2].id },
    { userId: users[2].id, reviewUserId: users[0].id, bookId: seededBooks[6].id }
  ];

  for (const like of likes) {
    const review = await prisma.review.findUniqueOrThrow({
      where: {
        userId_bookId: {
          userId: like.reviewUserId,
          bookId: like.bookId
        }
      }
    });

    await prisma.like.upsert({
      where: {
        userId_reviewId: {
          userId: like.userId,
          reviewId: review.id
        }
      },
      update: {},
      create: {
        userId: like.userId,
        reviewId: review.id
      }
    });
  }

  const comments = [
    {
      userId: users[3].id,
      reviewUserId: users[0].id,
      bookId: seededBooks[0].id,
      body: "This pushed Pride and Prejudice back up my list immediately."
    },
    {
      userId: users[0].id,
      reviewUserId: users[1].id,
      bookId: seededBooks[1].id,
      body: "Agreed. Morrison makes every sentence do real work."
    },
    {
      userId: users[1].id,
      reviewUserId: users[3].id,
      bookId: seededBooks[9].id,
      body: "You sold me on this one."
    }
  ];

  for (const commentSeed of comments) {
    const review = await prisma.review.findUniqueOrThrow({
      where: {
        userId_bookId: {
          userId: commentSeed.reviewUserId,
          bookId: commentSeed.bookId
        }
      }
    });

    const existing = await prisma.comment.findFirst({
      where: {
        userId: commentSeed.userId,
        reviewId: review.id,
        body: commentSeed.body
      }
    });

    if (!existing) {
      await prisma.comment.create({
        data: {
          userId: commentSeed.userId,
          reviewId: review.id,
          body: commentSeed.body
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
