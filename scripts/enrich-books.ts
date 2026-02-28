import { backfillStoredBooksMetadata } from "../lib/books/upsert-book";

async function main() {
  const { scanned, updated } = await backfillStoredBooksMetadata(500);
  console.log(`Enriched ${updated} of ${scanned} scanned books.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
