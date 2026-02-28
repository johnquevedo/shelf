-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "bio" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Book" (
  "id" TEXT NOT NULL,
  "openLibraryId" TEXT,
  "isbn10" TEXT,
  "isbn13" TEXT,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT,
  "coverUrl" TEXT,
  "publishedYear" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Author" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookAuthor" (
  "bookId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  CONSTRAINT "BookAuthor_pkey" PRIMARY KEY ("bookId", "authorId")
);

CREATE TABLE "Shelf" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "emoji" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Shelf_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShelfItem" (
  "id" TEXT NOT NULL,
  "shelfId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShelfItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "rating" INTEGER,
  "body" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Like" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Follow" (
  "id" TEXT NOT NULL,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReadingLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "pagesReadInt" INTEGER NOT NULL,
  CONSTRAINT "ReadingLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Book_openLibraryId_key" ON "Book"("openLibraryId");
CREATE UNIQUE INDEX "Book_isbn10_key" ON "Book"("isbn10");
CREATE UNIQUE INDEX "Book_isbn13_key" ON "Book"("isbn13");
CREATE INDEX "Book_title_idx" ON "Book"("title");
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");
CREATE UNIQUE INDEX "Shelf_userId_slug_key" ON "Shelf"("userId", "slug");
CREATE INDEX "Shelf_userId_idx" ON "Shelf"("userId");
CREATE UNIQUE INDEX "ShelfItem_shelfId_bookId_key" ON "ShelfItem"("shelfId", "bookId");
CREATE INDEX "ShelfItem_bookId_idx" ON "ShelfItem"("bookId");
CREATE UNIQUE INDEX "Review_userId_bookId_key" ON "Review"("userId", "bookId");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
CREATE UNIQUE INDEX "Like_userId_reviewId_key" ON "Like"("userId", "reviewId");
CREATE INDEX "Like_reviewId_idx" ON "Like"("reviewId");
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");
CREATE UNIQUE INDEX "ReadingLog_userId_bookId_date_key" ON "ReadingLog"("userId", "bookId", "date");
CREATE INDEX "ReadingLog_userId_date_idx" ON "ReadingLog"("userId", "date");

ALTER TABLE "BookAuthor"
ADD CONSTRAINT "BookAuthor_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookAuthor"
ADD CONSTRAINT "BookAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shelf"
ADD CONSTRAINT "Shelf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShelfItem"
ADD CONSTRAINT "ShelfItem_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShelfItem"
ADD CONSTRAINT "ShelfItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review"
ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review"
ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like"
ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like"
ADD CONSTRAINT "Like_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow"
ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow"
ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingLog"
ADD CONSTRAINT "ReadingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingLog"
ADD CONSTRAINT "ReadingLog_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
