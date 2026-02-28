"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { timeAgo } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  createdAt: string | Date;
  canDelete?: boolean;
  user: {
    username: string;
    name: string;
  };
};

export function CommentThread({
  reviewId,
  initialComments = [],
  totalCount = 0,
  open,
  onOpenChange,
  onCountChange
}: {
  reviewId: string;
  initialComments?: Comment[];
  totalCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCountChange?: (count: number) => void;
}) {
  const [body, setBody] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [count, setCount] = useState(totalCount);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    setCount(totalCount);
  }, [totalCount]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Comments (${count})`}
      description="Reply to this review without disrupting the feed layout."
      contentClassName="max-h-[min(88vh,760px)] max-w-[min(48rem,calc(100vw-1rem))] overflow-hidden border border-white/10 bg-[#0f1728] p-0 text-white"
      headerClassName="mb-0 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5"
      titleClassName="text-white"
      descriptionClassName="text-white/50"
      closeClassName="text-white/55 hover:bg-white/10"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {comments.length ? (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/users/${comment.user.username}`} className="text-sm font-semibold text-white">
                      @{comment.user.username}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/35">
                      {timeAgo(comment.createdAt)}d
                    </p>
                  </div>
                  {comment.canDelete ? (
                    <button
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={async () => {
                        setDeletingId(comment.id);
                        setError("");

                        try {
                          const response = await fetch("/api/comments", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ commentId: comment.id })
                          });
                          const payload = (await response.json()) as { error?: string };
                          if (!response.ok) {
                            throw new Error(payload.error || "Unable to remove comment.");
                          }

                          const nextComments = comments.filter((item) => item.id !== comment.id);
                          const nextCount = Math.max(0, count - 1);
                          setComments(nextComments);
                          setCount(nextCount);
                          onCountChange?.(nextCount);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Unable to remove comment.");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="shrink-0 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-rose-300 disabled:opacity-50"
                    >
                      {deletingId === comment.id ? "Removing" : "Remove"}
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">{comment.body}</p>
              </div>
            ))
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 px-6 text-center text-sm text-white/45">
              No comments yet. Start the thread.
            </div>
          )}
        </div>
        <form
          className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!body.trim() || loading) return;

            setLoading(true);
            setError("");

            try {
              const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, body: body.trim() })
              });
              const payload = (await response.json()) as Comment | { error?: string };
              if (!response.ok || !("id" in payload)) {
                throw new Error(("error" in payload && payload.error) || "Unable to post comment.");
              }

              const nextComments = [...comments, { ...payload, canDelete: true }];
              const nextCount = count + 1;
              setComments(nextComments);
              setCount(nextCount);
              onCountChange?.(nextCount);
              setBody("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to post comment.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block text-xs uppercase tracking-[0.2em] text-white/35">Add a comment</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={400}
            className="mt-3 min-h-28 w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/20"
            placeholder="Write a thoughtful reply..."
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-white/35">{body.trim().length}/400</p>
            <Button type="submit" size="sm" disabled={loading || !body.trim()}>
              {loading ? "Posting..." : "Post comment"}
            </Button>
          </div>
          {error ? <p className="mt-3 text-xs text-rose-400">{error}</p> : null}
        </form>
      </div>
    </Modal>
  );
}
