import { describe, expect, it } from "vitest";
import { recommendBooksForUser } from "@/lib/recommendations/books";

describe("recommendBooksForUser", () => {
  it("prefers co-occurrence recommendations before fallback ranking", () => {
    const recommendations = recommendBooksForUser({
      targetUserId: "u1",
      books: [
        { id: "b1", title: "Book 1" },
        { id: "b2", title: "Book 2" },
        { id: "b3", title: "Book 3" },
        { id: "b4", title: "Book 4" }
      ],
      reviews: [
        { userId: "u1", bookId: "b1", rating: 5, createdAt: new Date("2026-02-10") },
        { userId: "u2", bookId: "b1", rating: 5, createdAt: new Date("2026-02-11") },
        { userId: "u2", bookId: "b3", rating: 4, createdAt: new Date("2026-02-12") },
        { userId: "u3", bookId: "b1", rating: 4, createdAt: new Date("2026-02-12") },
        { userId: "u3", bookId: "b4", rating: 5, createdAt: new Date("2026-02-13") },
        { userId: "u4", bookId: "b2", rating: 5, createdAt: new Date("2026-02-14") }
      ]
    });

    expect(recommendations.map((book) => book.id)).toEqual(["b4", "b3"]);
  });

  it("falls back to high average rating when no co-occurrence exists", () => {
    const recommendations = recommendBooksForUser({
      targetUserId: "u1",
      books: [
        { id: "b1", title: "Book 1" },
        { id: "b2", title: "Book 2" },
        { id: "b3", title: "Book 3" }
      ],
      reviews: [
        { userId: "u1", bookId: "b1", rating: 5, createdAt: new Date("2026-02-01") },
        { userId: "u2", bookId: "b2", rating: 5, createdAt: new Date("2026-02-02") },
        { userId: "u3", bookId: "b2", rating: 4, createdAt: new Date("2026-02-03") },
        { userId: "u4", bookId: "b3", rating: 4, createdAt: new Date("2026-02-05") }
      ]
    });

    expect(recommendations.map((book) => book.id)).toEqual(["b2", "b3"]);
  });

  it("never recommends books the user has already reviewed", () => {
    const recommendations = recommendBooksForUser({
      targetUserId: "u1",
      books: [
        { id: "b1", title: "Book 1" },
        { id: "b2", title: "Book 2" },
        { id: "b3", title: "Book 3" }
      ],
      reviews: [
        { userId: "u1", bookId: "b1", rating: 5, createdAt: new Date("2026-02-01") },
        { userId: "u1", bookId: "b2", rating: 2, createdAt: new Date("2026-02-02") },
        { userId: "u2", bookId: "b1", rating: 5, createdAt: new Date("2026-02-03") },
        { userId: "u2", bookId: "b2", rating: 5, createdAt: new Date("2026-02-03") },
        { userId: "u2", bookId: "b3", rating: 5, createdAt: new Date("2026-02-04") }
      ]
    });

    expect(recommendations.map((book) => book.id)).toEqual(["b3"]);
  });
});
