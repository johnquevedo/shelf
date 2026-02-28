import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getHomeFeed } from "@/lib/feed/queries";

export async function GET() {
  const user = await requireUser();
  const feed = await getHomeFeed(user.id);
  return NextResponse.json(feed);
}
