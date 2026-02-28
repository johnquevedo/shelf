import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { commentSchema, deleteCommentSchema } from "@/lib/validators/reviews";

export async function POST(request: Request) {
  const user = await requireUser();
  const payload = commentSchema.parse(await request.json());

  const comment = await prisma.comment.create({
    data: {
      userId: user.id,
      reviewId: payload.reviewId,
      body: payload.body
    },
    include: {
      user: true
    }
  });

  return NextResponse.json(comment);
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const payload = deleteCommentSchema.parse(await request.json());

  const comment = await prisma.comment.findUnique({
    where: { id: payload.commentId },
    select: { id: true, userId: true }
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (comment.userId !== user.id) {
    return NextResponse.json({ error: "You can only remove your own comments." }, { status: 403 });
  }

  await prisma.comment.delete({
    where: { id: comment.id }
  });

  return NextResponse.json({ ok: true, commentId: comment.id });
}
