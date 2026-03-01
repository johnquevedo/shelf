import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { prisma } from "@/lib/prisma";
import { issuePasswordResetEmail } from "@/lib/auth/email";

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
    const payload = forgotPasswordSchema.parse(await request.json());
    const baseUrl = getRequestBaseUrl(request);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() }
    });

    if (user) {
      await issuePasswordResetEmail({ id: user.id, email: user.email, name: user.name }, { baseUrl });
    }

    return NextResponse.json({
      message: "If your account exists, a password reset email was sent."
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid email." }, { status: 400 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send password reset email."
      },
      { status: 500 }
    );
  }
}
