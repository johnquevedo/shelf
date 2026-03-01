import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { getJournalStats } from "@/lib/journal/stats";
import { getNotificationCount } from "@/lib/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  noStore();
  const sessionUser = await requireUser();
  const [user, distinctBooks, journalStats, notificationCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id }
    }),
    prisma.shelfItem.findMany({
      where: {
        shelf: {
          userId: sessionUser.id
        }
      },
      distinct: ["bookId"]
    }),
    getJournalStats(sessionUser.id),
    getNotificationCount(sessionUser.id)
  ]);

  const counters = [
    { label: "Books", value: String(distinctBooks.length) },
    { label: "Pages", value: String(journalStats.stats.month) },
    { label: "Streak", value: `${journalStats.streak}d` }
  ];

  return (
    <div className="flex min-h-screen bg-[#0f1728] text-white">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar
          name={user.name}
          username={user.username}
          imageUrl={user.imageUrl}
          counters={counters}
          notificationCount={notificationCount}
        />
        <main className="px-4 py-6 pb-24 md:px-8 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
