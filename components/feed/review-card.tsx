"use client";

import { useMemo, useOptimistic, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { BookCover } from "@/components/ui/book-cover";
import { CommentThread } from "@/components/feed/comment-thread";
import { Stars } from "@/components/ui/stars";
import { timeAgo } from "@/lib/utils";

type ReviewCardProps = {
  review: {
    id: string;
    body: string | null;
    rating: number | null;
    createdAt: Date | string;
    user: { name: string; username: string };
    book: {
      id: string;
      title: string;
      coverUrl: string | null;
    };
    comments?: Array<{
      id: string;
      body: string;
      createdAt: Date | string;
      user: { name: string; username: string };
    }>;
    _count?: { likes: number; comments?: number };
    liked?: boolean;
    currentUsername?: string;
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(review._count?.comments ?? review.comments?.length ?? 0);
  const stableComments = useMemo(
    () =>
      review.comments?.map((comment) => ({
        ...comment,
        canDelete: review.currentUsername ? comment.user.username === review.currentUsername : false
      })),
    [review.comments, review.currentUsername]
  );
  const [optimistic, updateOptimistic] = useOptimistic(
    { liked: review.liked ?? false, likesCount: review._count?.likes ?? 0 },
    (state, next: { liked: boolean }) => ({
      liked: next.liked,
      likesCount: state.likesCount + (next.liked ? 1 : -1)
    })
  );

  const toggleLike = async () => {
    if (pending) return;
    const nextLiked = !optimistic.liked;
    setError("");
    startTransition(() => updateOptimistic({ liked: nextLiked }));
    setPending(true);
    try {
      const response = await fetch("/api/likes", {
        method: nextLiked ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id })
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to update like.");
      }
      router.refresh();
    } catch (err) {
      startTransition(() => updateOptimistic({ liked: !nextLiked }));
      setError(err instanceof Error ? err.message : "Unable to update like.");
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="shell-card p-5">
      <div className="grid gap-4 md:grid-cols-[84px_1fr]">
        <div className="h-[118px] w-[84px]">
          <BookCover title={review.book.title} coverUrl={review.book.coverUrl} href={`/books/${review.book.id}`} />
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href={`/books/${review.book.id}`} className="font-display text-2xl text-white">
                {review.book.title}
              </Link>
              <p className="mt-1 text-sm text-white/50">
                <Link href={`/users/${review.user.username}`} className="hover:text-white">
                  @{review.user.username}
                </Link>{" "}
                • {timeAgo(review.createdAt)}d
              </p>
            </div>
            <Stars value={review.rating ?? 0} />
          </div>
          <p className="mt-4 text-sm leading-6 text-white/75">
            {review.body || "Left a rating without a written note."}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
            <button
              onClick={toggleLike}
              disabled={pending}
              type="button"
              aria-pressed={optimistic.liked}
              aria-label={optimistic.liked ? "Unlike review" : "Like review"}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${
                optimistic.liked
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-white/10 bg-white/5 text-white/50"
              }`}
            >
              <Heart className={`h-4 w-4 ${optimistic.liked ? "fill-current" : ""}`} />
              {optimistic.likesCount}
            </button>
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              aria-label="Open comments"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/50 transition hover:border-white/20 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              {commentCount}
            </button>
          </div>
          {error ? <p className="mt-3 text-xs text-rose-400">{error}</p> : null}
        </div>
      </div>
      <CommentThread
        reviewId={review.id}
        initialComments={stableComments}
        totalCount={commentCount}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        onCountChange={setCommentCount}
      />
    </article>
  );
}
