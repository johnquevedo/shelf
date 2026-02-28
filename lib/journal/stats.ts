import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { sumBy } from "@/lib/utils";

export async function getJournalStats(userId: string) {
  const today = new Date();
  const logs = await prisma.readingLog.findMany({
    where: { userId },
    include: {
      book: true
    },
    orderBy: { date: "desc" }
  });

  const totalBetween = (start: Date, end: Date) =>
    sumBy(
      logs.filter((log) => log.date >= start && log.date <= end),
      (log) => log.pagesReadInt
    );

  const uniqueDays = new Set(logs.map((log) => log.date.toISOString().slice(0, 10)));
  let streak = 0;

  for (let cursor = today; ; cursor = subDays(cursor, 1)) {
    const key = cursor.toISOString().slice(0, 10);
    if (!uniqueDays.has(key)) {
      break;
    }
    streak += 1;
  }

  return {
    stats: {
      today: totalBetween(startOfDay(today), endOfDay(today)),
      week: totalBetween(startOfWeek(today), endOfWeek(today)),
      month: totalBetween(startOfMonth(today), endOfMonth(today)),
      year: totalBetween(startOfYear(today), endOfYear(today))
    },
    streak,
    logs,
    currentBooks: await prisma.shelfItem.findMany({
      where: {
        shelf: {
          userId,
          slug: "reading"
        }
      },
      include: {
        book: {
          include: {
            authors: { include: { author: true } }
          }
        }
      },
      orderBy: { addedAt: "desc" }
    })
  };
}
