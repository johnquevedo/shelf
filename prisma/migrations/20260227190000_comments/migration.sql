CREATE TABLE "Comment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Comment_reviewId_createdAt_idx" ON "Comment"("reviewId", "createdAt");
CREATE INDEX "Comment_userId_createdAt_idx" ON "Comment"("userId", "createdAt");

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
