import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getJournalStats } from "@/lib/journal/stats";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await getJournalStats(user.id));
}
