import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { getUserShelves } from "@/lib/books/shelves";
import { BookCover } from "@/components/ui/book-cover";
import { DeleteShelfButton } from "@/components/library/delete-shelf-button";
import { NewShelfForm } from "@/components/library/new-shelf-form";
import { RemoveShelfItemButton } from "@/components/library/remove-shelf-item-button";

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<{ shelf?: string }>;
}) {
  const user = await requireUser();
  const { shelf: activeSlug } = await searchParams;
  const shelves = await getUserShelves(user.id);
  const activeShelf = shelves.find((shelf) => shelf.slug === activeSlug) || shelves[0];
  const reviewCounts = await prisma.review.groupBy({
    by: ["bookId"],
    where: {
      bookId: { in: activeShelf?.items.map((item) => item.bookId) ?? [] }
    },
    _count: { bookId: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl">Library</h1>
          <p className="mt-2 text-sm text-white/50">Arrange your books across shelves that feel like yours.</p>
        </div>
        <NewShelfForm />
      </div>

      <div className="flex flex-wrap gap-3">
        {shelves.map((shelf) => (
          <Link
            key={shelf.id}
            href={`/library?shelf=${shelf.slug}`}
            className={`rounded-full px-4 py-2 text-sm ${
              activeShelf?.id === shelf.id ? "bg-accent text-slate-950" : "bg-white/5 text-white/60"
            }`}
          >
            {shelf.name}
          </Link>
        ))}
      </div>

      <section className="shell-card p-6">
        <div className="shelf-row rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl">{activeShelf?.name}</h2>
              {activeShelf && !activeShelf.isDefault ? (
                <DeleteShelfButton slug={activeShelf.slug} name={activeShelf.name} />
              ) : null}
            </div>
            <p className="text-sm text-white/45">{activeShelf?.items.length ?? 0} books</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {activeShelf?.items.map((item) => (
              <div key={item.id} className="flex h-full flex-col gap-4 rounded-[26px] bg-[#0d1526]/90 p-4">
                <div className="mx-auto aspect-[2/3] w-full max-w-[150px] shrink-0 overflow-hidden rounded-[22px]">
                  <BookCover title={item.book.title} coverUrl={item.book.coverUrl} href={`/books/${item.book.id}`} />
                </div>
                <div className="space-y-1">
                  <p className="line-clamp-2 font-semibold text-white">{item.book.title}</p>
                  <p className="line-clamp-2 text-sm text-white/45">
                    {item.book.authors.map((author) => author.author.name).join(", ")}
                  </p>
                  <p className="pt-2 text-xs uppercase tracking-[0.2em] text-white/30">
                    {reviewCounts.find((count) => count.bookId === item.book.id)?._count.bookId ?? 0} reviews
                  </p>
                </div>
                <div className="mt-auto pt-1">
                  <RemoveShelfItemButton shelfSlug={activeShelf.slug} bookId={item.book.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
