import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { registerUser } from "@/lib/auth/register";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const baseUrl = new URL(request.url).origin;
    const { user, verification } = await registerUser(payload, { baseUrl });
    return NextResponse.json({ id: user.id, verificationSent: verification.sent });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 400 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to register"
      },
      { status: 400 }
    );
  }
}
