import bcrypt from "bcrypt";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { createDefaultShelvesForUser } from "@/lib/books/shelves";
import { issueVerificationEmail } from "@/lib/auth/email";
import { registerSchema } from "@/lib/validators/auth";

export async function registerUser(input: unknown, options?: { baseUrl?: string }) {
  const parsed = registerSchema.parse(input);
  const email = parsed.email.toLowerCase();
  const usernameBase = slugify(email.split("@")[0], { lower: true, strict: true }) || "reader";
  let username = usernameBase;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    counter += 1;
    username = `${usernameBase}${counter}`;
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.name,
      username
    }
  });

  await createDefaultShelvesForUser(user.id);
  const verification = await issueVerificationEmail(
    { id: user.id, email: user.email, name: user.name },
    { baseUrl: options?.baseUrl }
  );

  return { user, verification };
}
