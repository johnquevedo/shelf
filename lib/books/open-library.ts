import { z } from "zod";

const searchDocSchema = z.object({
  key: z.string(),
  title: z.string(),
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().optional(),
  first_publish_year: z.number().optional(),
  isbn: z.array(z.string()).optional(),
  language: z.array(z.string()).optional()
});

const searchResponseSchema = z.object({
  docs: z.array(searchDocSchema)
});

const workDetailsSchema = z.object({
  title: z.string(),
  description: z.union([z.string(), z.object({ value: z.string() })]).optional(),
  covers: z.array(z.number()).optional(),
  authors: z.array(z.object({ author: z.object({ key: z.string() }) })).optional(),
  first_publish_date: z.string().optional()
});

const editionsResponseSchema = z.object({
  entries: z
    .array(
      z.object({
        title: z.string().optional(),
        covers: z.array(z.number()).optional(),
        languages: z.array(z.object({ key: z.string() })).optional(),
        publish_date: z.string().optional(),
        isbn_10: z.array(z.string()).optional(),
        isbn_13: z.array(z.string()).optional()
      })
    )
    .optional()
});

const googleBooksResponseSchema = z.object({
  items: z
    .array(
      z.object({
        volumeInfo: z.object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
          authors: z.array(z.string()).optional(),
          description: z.string().optional(),
          publishedDate: z.string().optional(),
          language: z.string().optional(),
          imageLinks: z
            .object({
              thumbnail: z.string().optional(),
              smallThumbnail: z.string().optional()
            })
            .optional()
        })
      })
    )
    .optional()
});

type GoogleBooksMetadata = {
  title: string | null;
  subtitle: string | null;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  publishedYear: number | null;
};

type PreferredEdition = {
  title: string | null;
  coverUrl: string | null;
  publishedYear: number | null;
  isbn10: string | null;
  isbn13: string | null;
};

export type OpenLibrarySearchResult = {
  workId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishedYear: number | null;
  isbn10: string | null;
  isbn13: string | null;
};

type EnrichBookMetadataInput = {
  workId?: string | null;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishedYear: number | null;
  isbn10: string | null;
  isbn13: string | null;
  description?: string | null;
};

function getCoverUrl(coverId?: number | null) {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
}

function normalizeIsbn(isbn?: string | null) {
  return isbn?.replace(/[^0-9X]/gi, "") ?? null;
}

function extractYear(value?: string | null) {
  if (!value) return null;
  const match = value.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function containsNonLatin(value?: string | null) {
  return value ? /[^\u0000-\u024f]/.test(value) : false;
}

function hasEnglishLanguage(languages?: string[]) {
  return Boolean(languages?.some((language) => language === "eng" || language === "en"));
}

function isBetterEnglishTitle(primary: string, candidate?: string | null) {
  if (!candidate) return false;
  if (!containsNonLatin(primary) && containsNonLatin(candidate)) return false;
  return containsNonLatin(primary) && !containsNonLatin(candidate);
}

function scoreSearchDoc(doc: z.infer<typeof searchDocSchema>, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTitle = doc.title.toLowerCase();
  let score = 0;

  if (normalizedTitle === normalizedQuery) score += 80;
  if (normalizedTitle.startsWith(normalizedQuery)) score += 40;
  if (normalizedTitle.includes(normalizedQuery)) score += 20;
  if (hasEnglishLanguage(doc.language)) score += 24;
  if (!containsNonLatin(doc.title)) score += 14;
  if (doc.cover_i) score += 8;
  if (doc.first_publish_year) score += 2;

  return score;
}

async function fetchPreferredEdition(workId: string): Promise<PreferredEdition | null> {
  try {
    const response = await fetch(`https://openlibrary.org/works/${workId}/editions.json?limit=20`, {
      next: { revalidate: 60 * 60 * 24 }
    });
    if (!response.ok) return null;

    const payload = editionsResponseSchema.parse(await response.json());
    const entries = payload.entries ?? [];
    if (!entries.length) return null;

    const preferred = [...entries].sort((left, right) => {
      const leftScore =
        (left.languages?.some((language) => language.key.endsWith("/eng")) ? 40 : 0) +
        (!containsNonLatin(left.title) ? 20 : 0) +
        ((left.covers?.length ?? 0) > 0 ? 10 : 0) +
        (left.title ? 5 : 0);
      const rightScore =
        (right.languages?.some((language) => language.key.endsWith("/eng")) ? 40 : 0) +
        (!containsNonLatin(right.title) ? 20 : 0) +
        ((right.covers?.length ?? 0) > 0 ? 10 : 0) +
        (right.title ? 5 : 0);

      return rightScore - leftScore;
    })[0];

    return {
      title: preferred.title ?? null,
      coverUrl: getCoverUrl(preferred.covers?.[0]),
      publishedYear: extractYear(preferred.publish_date),
      isbn10: normalizeIsbn(preferred.isbn_10?.[0]),
      isbn13: normalizeIsbn(preferred.isbn_13?.[0])
    };
  } catch {
    return null;
  }
}

async function fetchGoogleBooksMetadata({
  title,
  authors,
  isbn10,
  isbn13
}: {
  title: string;
  authors: string[];
  isbn10?: string | null;
  isbn13?: string | null;
}): Promise<GoogleBooksMetadata | null> {
  try {
    const query = isbn13
      ? `isbn:${isbn13}`
      : isbn10
        ? `isbn:${isbn10}`
        : `intitle:${title}${authors[0] ? ` inauthor:${authors[0]}` : ""}`;

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=3`, {
      next: { revalidate: 60 * 60 * 24 }
    });
    if (!response.ok) return null;

    const payload = googleBooksResponseSchema.parse(await response.json());
    const candidates = payload.items ?? [];
    if (!candidates.length) return null;

    const selected =
      candidates.find((item) => item.volumeInfo.language === "en" && !containsNonLatin(item.volumeInfo.title)) ??
      candidates.find((item) => !containsNonLatin(item.volumeInfo.title)) ??
      candidates[0];

    return {
      title: selected.volumeInfo.title ?? null,
      subtitle: selected.volumeInfo.subtitle ?? null,
      authors: selected.volumeInfo.authors ?? [],
      description: selected.volumeInfo.description ?? null,
      coverUrl:
        selected.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ??
        selected.volumeInfo.imageLinks?.smallThumbnail?.replace("http://", "https://") ??
        null,
      publishedYear: extractYear(selected.volumeInfo.publishedDate)
    };
  } catch {
    return null;
  }
}

export async function enrichBookMetadata(input: EnrichBookMetadataInput) {
  const needsEnglishTitle = containsNonLatin(input.title);
  const needsCover = !input.coverUrl;
  const edition =
    input.workId && (needsEnglishTitle || needsCover) ? await fetchPreferredEdition(input.workId) : null;
  const google = needsEnglishTitle || needsCover
    ? await fetchGoogleBooksMetadata({
        title: edition?.title ?? input.title,
        authors: input.authors,
        isbn10: input.isbn10,
        isbn13: input.isbn13
      })
    : null;

  return {
    ...input,
    title: isBetterEnglishTitle(input.title, edition?.title)
      ? edition?.title ?? input.title
      : isBetterEnglishTitle(input.title, google?.title)
        ? google?.title ?? input.title
        : input.title,
    authors: input.authors.length ? input.authors : google?.authors.length ? google.authors : ["Unknown author"],
    coverUrl: input.coverUrl ?? edition?.coverUrl ?? google?.coverUrl ?? null,
    publishedYear: input.publishedYear ?? edition?.publishedYear ?? google?.publishedYear ?? null,
    isbn10: input.isbn10 ?? edition?.isbn10 ?? null,
    isbn13: input.isbn13 ?? edition?.isbn13 ?? null,
    description: input.description ?? google?.description ?? null
  };
}

export async function enrichOpenLibraryResult(result: OpenLibrarySearchResult) {
  return enrichBookMetadata(result);
}

export async function searchOpenLibrary(query: string) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`,
    { next: { revalidate: 60 * 10 } }
  );

  if (!response.ok) {
    throw new Error("Unable to search Open Library");
  }

  const payload = searchResponseSchema.parse(await response.json());
  const rankedDocs = [...payload.docs].sort((left, right) => scoreSearchDoc(right, query) - scoreSearchDoc(left, query));

  return Promise.all(
    rankedDocs.map(async (doc) => {
      const workId = doc.key.replace("/works/", "");
      const isbn10 = normalizeIsbn(doc.isbn?.find((isbn) => normalizeIsbn(isbn)?.length === 10));
      const isbn13 = normalizeIsbn(doc.isbn?.find((isbn) => normalizeIsbn(isbn)?.length === 13));

      return enrichOpenLibraryResult({
        workId,
        title: doc.title,
        authors: doc.author_name ?? ["Unknown author"],
        coverUrl: getCoverUrl(doc.cover_i),
        publishedYear: doc.first_publish_year ?? null,
        isbn10,
        isbn13
      });
    })
  );
}

export async function getOpenLibraryWork(workId: string) {
  const workResponse = await fetch(`https://openlibrary.org/works/${workId}.json`, {
    next: { revalidate: 60 * 60 }
  });

  if (!workResponse.ok) {
    throw new Error("Unable to fetch book details");
  }

  const work = workDetailsSchema.parse(await workResponse.json());
  const authorKeys = work.authors?.map((entry) => entry.author.key).filter(Boolean) ?? [];
  const authorPayloads = await Promise.all(
    authorKeys.map(async (key) => {
      const response = await fetch(`https://openlibrary.org${key}.json`, {
        next: { revalidate: 60 * 60 }
      });
      if (!response.ok) {
        return null;
      }
      const author = (await response.json()) as { name?: string };
      return author.name ?? null;
    })
  );

  const authors = (authorPayloads.filter(Boolean) as string[]).length
    ? (authorPayloads.filter(Boolean) as string[])
    : ["Unknown author"];
  const edition = await fetchPreferredEdition(workId);
  const google = await fetchGoogleBooksMetadata({
    title: edition?.title ?? work.title,
    authors,
    isbn10: edition?.isbn10,
    isbn13: edition?.isbn13
  });

  return {
    title: isBetterEnglishTitle(work.title, edition?.title)
      ? edition?.title ?? work.title
      : isBetterEnglishTitle(work.title, google?.title)
        ? google?.title ?? work.title
        : work.title,
    description:
      (typeof work.description === "string" ? work.description : work.description?.value) ??
      google?.description ??
      null,
    coverUrl: getCoverUrl(work.covers?.[0]) ?? edition?.coverUrl ?? google?.coverUrl ?? null,
    authors: authors.length ? authors : google?.authors.length ? google.authors : ["Unknown author"],
    publishedYear:
      extractYear(work.first_publish_date) ?? edition?.publishedYear ?? google?.publishedYear ?? null,
    isbn10: edition?.isbn10 ?? null,
    isbn13: edition?.isbn13 ?? null
  };
}
