import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { createShelfSchema, deleteShelfSchema } from "@/lib/validators/shelves";
import { slugifyShelfName } from "@/lib/utils";

export async function GET() {
  const user = await requireUser();
  const shelves = await prisma.shelf.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
  });
  return NextResponse.json({ shelves });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const payload = createShelfSchema.parse(await request.json());
  const slug = slugifyShelfName(payload.name);

  const shelf = await prisma.shelf.upsert({
    where: {
      userId_slug: {
        userId: user.id,
        slug
      }
    },
    update: {
      name: payload.name
    },
    create: {
      userId: user.id,
      name: payload.name,
      slug
    }
  });

  return NextResponse.json(shelf);
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const payload = deleteShelfSchema.parse(await request.json());

  const shelf = await prisma.shelf.findUnique({
    where: {
      userId_slug: {
        userId: user.id,
        slug: payload.slug
      }
    },
    select: {
      id: true,
      isDefault: true
    }
  });

  if (!shelf) {
    return NextResponse.json({ error: "Shelf not found." }, { status: 404 });
  }

  if (shelf.isDefault) {
    return NextResponse.json({ error: "Default shelves cannot be removed." }, { status: 400 });
  }

  await prisma.shelf.delete({
    where: { id: shelf.id }
  });

  return NextResponse.json({ ok: true });
}
