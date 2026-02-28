import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { importGoodreadsCsv } from "@/lib/import/goodreads";

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }

  const csvText = await file.text();
  const summary = await importGoodreadsCsv(user.id, csvText);
  return NextResponse.json(summary);
}
