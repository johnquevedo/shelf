import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { searchUsers } from "@/lib/users";

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const users = await searchUsers(query, user.id);
  return NextResponse.json({ users });
}
