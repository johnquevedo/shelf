import { redirect } from "next/navigation";
import { ensureBookByOpenLibraryId } from "@/lib/books/upsert-book";

export default async function OpenLibraryRedirectPage({
  params
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const book = await ensureBookByOpenLibraryId(workId);
  redirect(`/books/${book.id}`);
}
