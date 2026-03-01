import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { registerUser } from "@/lib/auth/register";

function getRequestBaseUrl(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get("host");
  if (host) {
    return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const baseUrl = getRequestBaseUrl(request);
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
