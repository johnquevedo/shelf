import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { getExploreSections } from "@/lib/recommendations/queries";
import { searchUsers } from "@/lib/users";
import { SearchPanel } from "@/components/books/search-panel";
import { BookCover } from "@/components/ui/book-cover";
import { UserSearchResults } from "@/components/users/user-search-results";

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const [sections, people, following] = await Promise.all([
    getExploreSections(user.id),
    searchUsers(q, user.id),
    prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true }
    })
  ]);
  const { trending, recent, recommended, topReviewers, topRated } = sections;
  const followingIds = new Set(following.map((item) => item.followingId));

  return (
    <div className="space-y-6">
      <SearchPanel initialQuery={q} />
      <UserSearchResults users={people} followingIds={followingIds} />
      <Section title="Trending This Week" books={trending} />
      <Section title="Recently Published" books={recent} />
      <Section title="Books For You" books={recommended} />

      <section className="shell-card p-6">
        <h2 className="font-display text-3xl">Top Reviewers This Week</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {topReviewers.map((reviewer) => (
            <div key={reviewer.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <Link href={`/users/${reviewer.username}`} className="font-semibold">
                {reviewer.name}
              </Link>
              <p className="mt-1 text-sm text-white/50">@{reviewer.username}</p>
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/35">
                {reviewer._count.reviews} reviews
              </p>
            </div>
          ))}
        </div>
      </section>

      <Section title="Top Rated Books of All Time" books={topRated} />
    </div>
  );
}

function Section({
  title,
  books
}: {
  title: string;
  books: Array<{
    id: string;
    title: string;
    coverUrl?: string | null;
    authors?: Array<{ author: { name: string } }>;
  }>;
}) {
  return (
    <section className="shell-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-3xl">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="flex h-full flex-col rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div className="mx-auto aspect-[2/3] w-full max-w-[140px]">
              <BookCover title={book.title} coverUrl={book.coverUrl} />
            </div>
            <p className="mt-4 line-clamp-2 font-semibold text-white">{book.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-white/45">
              {book.authors?.map((entry) => entry.author.name).join(", ") || "Unknown author"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
