import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { FollowButton } from "@/components/feed/follow-button";
import { ReviewCard } from "@/components/feed/review-card";
import { BookCover } from "@/components/ui/book-cover";

export default async function UserProfilePage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const currentUser = await requireUser();
  const { username } = await params;

  const profile = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          reviews: true
        }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  const [isFollowing, reviews, shelves, likes] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: profile.id
        }
      }
    }),
    prisma.review.findMany({
      where: { userId: profile.id },
      include: {
        user: true,
        book: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
          take: 5
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 10
    }),
    prisma.shelf.findMany({
      where: { userId: profile.id },
      include: {
        items: {
          include: {
            book: {
              include: {
                authors: { include: { author: true } }
              }
            }
          },
          take: 4,
          orderBy: { addedAt: "desc" }
        }
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
    }),
    prisma.like.findMany({
      where: {
        userId: currentUser.id,
        review: {
          userId: profile.id
        }
      },
      select: {
        reviewId: true
      }
    })
  ]);
  const likedIds = new Set(likes.map((like) => like.reviewId));

  return (
    <div className="space-y-6">
      <section className="shell-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Reader profile</p>
            <h1 className="mt-3 font-display text-5xl">{profile.name}</h1>
            <p className="mt-2 text-sm text-white/45">@{profile.username}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">{profile.bio || "No bio yet."}</p>
          </div>
          {profile.id !== currentUser.id ? (
            <FollowButton userId={profile.id} initialFollowing={Boolean(isFollowing)} />
          ) : null}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Followers" value={profile._count.followers} />
          <StatCard label="Following" value={profile._count.following} />
          <StatCard label="Reviews" value={profile._count.reviews} />
        </div>
      </section>

      <section className="shell-card p-6">
        <h2 className="font-display text-3xl">Shelves</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {shelves.map((shelf) => (
            <div key={shelf.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{shelf.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">{shelf.items.length} books</p>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {shelf.items.map((item) => (
                  <div key={item.id} className="h-[120px] w-[84px] shrink-0">
                    <BookCover title={item.book.title} coverUrl={item.book.coverUrl} href={`/books/${item.book.id}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">Recent reviews</h2>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={{
              ...review,
              liked: likedIds.has(review.id),
              currentUsername: currentUser.username
            }}
          />
        ))}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p>
      <p className="mt-3 font-display text-4xl text-white">{value}</p>
    </div>
  );
}
