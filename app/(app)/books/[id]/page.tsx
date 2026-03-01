import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { getBookShelfState } from "@/lib/books/shelves";
import { BookCover } from "@/components/ui/book-cover";
import { ShelfPicker } from "@/components/books/shelf-picker";
import { ReviewForm } from "@/components/books/review-form";
import { ReviewCard } from "@/components/feed/review-card";

export default async function BookDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [book, shelves, existingReview, reviews, likes, shelfState] = await Promise.all([
    prisma.book.findUnique({
      where: { id },
      include: {
        authors: { include: { author: true } }
      }
    }),
    prisma.shelf.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, slug: true, isDefault: true }
    }),
    prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: id
        }
      }
    }),
    prisma.review.findMany({
      where: { bookId: id },
      include: {
        user: true,
        comments: {
          include: {
            user: true
          },
          orderBy: { createdAt: "asc" },
          take: 10
        },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.like.findMany({
      where: {
        userId: user.id,
        review: {
          bookId: id
        }
      },
      select: {
        reviewId: true
      }
    }),
    getBookShelfState(user.id, id)
  ]);

  if (!book) {
    notFound();
  }

  const likedIds = new Set(likes.map((like) => like.reviewId));

  return (
    <div className="space-y-6">
      <section className="shell-card p-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="mx-auto aspect-[2/3] w-full max-w-[280px]">
            <BookCover title={book.title} coverUrl={book.coverUrl} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Book</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">{book.title}</h1>
            <p className="mt-3 text-lg text-white/60">
              {book.authors.map((author) => author.author.name).join(", ")}
            </p>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/70">
              {book.description || "No description available yet."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <ShelfPicker
            shelves={shelves}
            bookId={book.id}
            activeShelfSlugs={shelfState.shelfSlugs}
            activeDefaultShelfSlug={shelfState.defaultShelfSlug}
          />
          <ReviewForm bookId={book.id} initialReview={existingReview} />
        </div>
        <section className="space-y-4">
          <h2 className="font-display text-3xl">Reader notes</h2>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                book: {
                  id: book.id,
                  title: book.title,
                  coverUrl: book.coverUrl
                },
                liked: likedIds.has(review.id),
                currentUsername: user.username
              }}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
