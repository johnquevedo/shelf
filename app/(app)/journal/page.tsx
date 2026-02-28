import Link from "next/link";
import { getJournalStats } from "@/lib/journal/stats";
import { requireUser } from "@/lib/auth/session";
import { LogForm } from "@/components/journal/log-form";
import { BookCover } from "@/components/ui/book-cover";

export default async function JournalPage() {
  const user = await requireUser();
  const { stats, streak, currentBooks, logs } = await getJournalStats(user.id);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="shell-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-5xl">Journal</h1>
              <p className="mt-2 text-sm text-white/50">Track pages, keep a streak, and see your cadence clearly.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-accent">
              {streak} day streak
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Today", value: stats.today },
              { label: "Per Week", value: stats.week },
              { label: "Per Month", value: stats.month },
              { label: "Per Year", value: stats.year }
            ].map((card) => (
              <div key={card.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">{card.label}</p>
                <p className="mt-3 font-display text-4xl">{card.value}</p>
                <p className="mt-1 text-sm text-white/45">pages read</p>
              </div>
            ))}
          </div>
        </div>

        <section className="shell-card p-6">
          <h2 className="font-display text-3xl">Currently Reading</h2>
          {currentBooks.length ? (
            <div className="mt-4 space-y-4">
              {currentBooks.map((item) => (
                <div key={item.id} className="grid grid-cols-[72px_1fr] gap-4 rounded-[24px] bg-white/5 p-4">
                  <div className="h-[102px] w-[72px]">
                    <BookCover title={item.book.title} coverUrl={item.book.coverUrl} />
                  </div>
                  <div>
                    <p className="font-semibold">{item.book.title}</p>
                    <p className="mt-1 text-sm text-white/45">
                      {item.book.authors.map((author) => author.author.name).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-white/15 bg-white/5 p-6">
              <p className="text-sm text-white/50">Nothing on your Reading shelf yet.</p>
              <Link href="/explore" className="mt-4 inline-block text-sm font-semibold text-accent">
                Explore Books
              </Link>
            </div>
          )}
        </section>
      </section>

      <LogForm books={currentBooks.map((item) => ({ id: item.book.id, title: item.book.title }))} />

      <section className="shell-card p-6">
        <h2 className="font-display text-3xl">Recent logs</h2>
        <div className="mt-4 space-y-3">
          {logs.slice(0, 10).map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-[22px] bg-white/5 px-4 py-3">
              <div>
                <p className="font-semibold">{log.book.title}</p>
                <p className="text-sm text-white/45">{new Date(log.date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-white/70">{log.pagesReadInt} pages</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
