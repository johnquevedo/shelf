import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailToken } from "@/lib/auth/email";

const schema = z.object({
  token: z.string().min(10)
});

export async function POST(request: Request) {
  const payload = schema.parse(await request.json());
  const result = await verifyEmailToken(payload.token);

  if (!result.ok) {
    return NextResponse.json({ error: "Verification link is invalid or expired." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email: result.email });
}
