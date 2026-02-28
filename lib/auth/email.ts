import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

function resolveBaseUrl(baseUrl?: string) {
  if (baseUrl) {
    return baseUrl.replace(/\/$/, "");
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  throw new Error("App URL is not configured. Set NEXTAUTH_URL or provide a request origin.");
}

function getVerificationUrl(token: string, baseUrl?: string) {
  return `${resolveBaseUrl(baseUrl)}/verify-email?token=${token}`;
}

function getPasswordResetUrl(token: string, baseUrl?: string) {
  return `${resolveBaseUrl(baseUrl)}/reset-password?token=${token}`;
}

function getEmailFrom() {
  const from = process.env.EMAIL_FROM?.trim();

  // Resend supports onboarding@resend.dev for testing before a custom domain is verified.
  if (!from || from.includes("example.com")) {
    return "Shelf <onboarding@resend.dev>";
  }

  return from;
}

async function sendWithResend({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFrom();

  if (!apiKey || !from) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed: ${body}`);
  }

  return true;
}

async function sendWithSmtp({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = getEmailFrom();

  if (!host || !port || !from) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text
  });

  return true;
}

export async function sendEmail({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  if (resendConfigured) {
    return sendWithResend({ to, subject, text });
  }

  const smtpSent = await sendWithSmtp({ to, subject, text });
  if (!smtpSent) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY or SMTP credentials.");
  }

  return smtpSent;
}

export async function createEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });

  return token;
}

export async function issueVerificationEmail(
  user: { id: string; email: string; name: string },
  options?: { baseUrl?: string }
) {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id }
  });

  const token = await createEmailVerificationToken(user.id);
  const url = getVerificationUrl(token, options?.baseUrl);
  const text = `Hi ${user.name}, verify your Shelf account: ${url}`;
  const sent = await sendEmail({
    to: user.email,
    subject: "Verify your Shelf account",
    text
  });

  return {
    token,
    url,
    sent
  };
}

export async function createPasswordResetToken(userId: string) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });

  return token;
}

export async function issuePasswordResetEmail(
  user: { id: string; email: string; name: string },
  options?: { baseUrl?: string }
) {
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  const token = await createPasswordResetToken(user.id);
  const url = getPasswordResetUrl(token, options?.baseUrl);
  const text = `Hi ${user.name}, reset your Shelf password: ${url}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Shelf password",
    text
  });

  return { token, url, sent: true };
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!record || record.expiresAt < new Date()) {
    return { ok: false as const };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() }
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId }
    })
  ]);

  return { ok: true as const, email: record.user.email };
}
