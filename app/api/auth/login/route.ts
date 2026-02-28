import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginSchema } from "@/lib/validators/auth";
import { validateCredentials } from "@/lib/auth/credentials";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const result = await validateCredentials(payload.email, payload.password);

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.reason === "EMAIL_NOT_VERIFIED"
              ? "Verify your email before logging in."
              : "Invalid email or password."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid login details." }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to log in."
      },
      { status: 500 }
    );
  }
}
