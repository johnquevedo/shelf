import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { getHomeFeed } from "@/lib/feed/queries";
import { ReviewCard } from "@/components/feed/review-card";
import { FollowButton } from "@/components/feed/follow-button";

export default async function HomePage() {
  const user = await requireUser();
  const { featuredReview, trendingReviews, followingFeed, suggestedReaders } = await getHomeFeed(user.id);

  const followingIds = new Set(
    (
      await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true }
      })
    ).map((follow) => follow.followingId)
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="space-y-6">
        <div className="shell-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35">What&apos;s happening</p>
          {featuredReview ? (
            <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="font-display text-4xl">{featuredReview.book.title}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                {featuredReview.body}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl">Your Following</h2>
            <p className="text-sm text-white/40">Latest from people you follow</p>
          </div>
          {followingFeed.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                liked: review.likes.length > 0,
                currentUsername: user.username
              }}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <section className="shell-card p-6">
          <h2 className="font-display text-3xl">Trending Reviews</h2>
          <div className="mt-4 space-y-4">
            {trendingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{
                  ...review,
                  liked: review.likes.length > 0,
                  currentUsername: user.username
                }}
              />
            ))}
          </div>
        </section>

        <section className="shell-card p-6">
          <h2 className="font-display text-3xl">Follow Top Readers</h2>
          <div className="mt-4 space-y-4">
            {suggestedReaders.map((reader) => (
              <div
                key={reader.id}
                className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <Link href={`/users/${reader.username}`} className="font-semibold">
                    {reader.name}
                  </Link>
                  <p className="text-sm text-white/45">@{reader.username}</p>
                </div>
                <FollowButton userId={reader.id} initialFollowing={followingIds.has(reader.id)} />
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
