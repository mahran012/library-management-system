import { useMemo, useState } from "react";

import {
  BookOpen,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";

import { useLibrary } from "../context/LibraryContext";

import type { Genre } from "../types";

type GenreFilter = Genre | "All";

type AvailabilityFilter =
  | "all"
  | "available"
  | "unavailable";

type Feedback = {
  type: "success" | "error";
  message: string;
};

const GENRES: Genre[] = [
  "Algorithms",
  "Systems",
  "Web Dev",
  "Databases",
  "Architecture",
  "AI/ML",
  "DevOps",
  "Languages",
];

export function BookSearchGrid() {
  const {
    books,
    records,
    currentUser,
    requestBorrow,
  } = useLibrary();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedGenre, setSelectedGenre] =
    useState<GenreFilter>("All");

  const [availability, setAvailability] =
    useState<AvailabilityFilter>("all");

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const filteredBooks = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        query.length === 0 ||
        book.title
          .toLowerCase()
          .includes(query) ||
        book.author
          .toLowerCase()
          .includes(query) ||
        book.isbn
          .toLowerCase()
          .includes(query);

      const matchesGenre =
        selectedGenre === "All" ||
        book.genre === selectedGenre;

      const matchesAvailability =
        availability === "all" ||
        (availability === "available" &&
          book.availableCopies > 0) ||
        (availability === "unavailable" &&
          book.availableCopies === 0);

      return (
        matchesSearch &&
        matchesGenre &&
        matchesAvailability
      );
    });
  }, [
    books,
    searchQuery,
    selectedGenre,
    availability,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedGenre !== "All" ||
    availability !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    setAvailability("all");
  };

  const handleBorrowRequest = (
    bookId: string,
  ) => {
    const result =
      requestBorrow(bookId);

    setFeedback({
      type: result.success
        ? "success"
        : "error",
      message: result.message,
    });
  };

  const availableTitles =
    books.filter(
      (book) =>
        book.availableCopies > 0,
    ).length;

  return (
    <section>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Catalogue titles
          </p>

          <p className="mt-2 text-3xl font-bold">
            {books.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Available titles
          </p>

          <p className="mt-2 text-3xl font-bold">
            {availableTitles}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Matching results
          </p>

          <p className="mt-2 text-3xl font-bold">
            {filteredBooks.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label
              htmlFor="book-search"
              className="mb-2 block text-sm font-semibold"
            >
              Search catalogue
            </label>

            <div className="relative">
              <Search
                aria-hidden="true"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="book-search"
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search title, author or ISBN..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="genre-filter"
              className="mb-2 block text-sm font-semibold"
            >
              Genre
            </label>

            <select
              id="genre-filter"
              value={selectedGenre}
              onChange={(event) =>
                setSelectedGenre(
                  event.target
                    .value as GenreFilter,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-slate-900"
            >
              <option value="All">
                All genres
              </option>

              {GENRES.map((genre) => (
                <option
                  key={genre}
                  value={genre}
                >
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="availability-filter"
              className="mb-2 block text-sm font-semibold"
            >
              Availability
            </label>

            <select
              id="availability-filter"
              value={availability}
              onChange={(event) =>
                setAvailability(
                  event.target
                    .value as AvailabilityFilter,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-slate-900"
            >
              <option value="all">
                All books
              </option>

              <option value="available">
                Available
              </option>

              <option value="unavailable">
                Unavailable
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p
            aria-live="polite"
            className="text-sm text-slate-600"
          >
            Showing{" "}
            {filteredBooks.length} of{" "}
            {books.length} books
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
            >
              <RotateCcw size={15} />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mt-6 rounded-lg border p-4 text-sm ${
            feedback.type ===
            "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {filteredBooks.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookOpen
            aria-hidden="true"
            size={36}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-4 text-xl font-semibold">
            No matching books
          </h3>

          <p className="mt-2 text-slate-600">
            Try a different search or
            change your filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Show all books
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map(
            (book) => {
              const isAvailable =
                book.availableCopies > 0;

              const existingRecord =
                currentUser?.role ===
                "Student"
                  ? records.find(
                      (record) =>
                        record.studentId ===
                          currentUser.universityId &&
                        record.bookId ===
                          book.id &&
                        record.status !==
                          "Returned",
                    )
                  : undefined;

              return (
                <article
                  key={book.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex h-48 items-center justify-center bg-slate-100">
                    {book.imageUrl ? (
                      <img
                        src={
                          book.imageUrl
                        }
                        alt={`Cover of ${book.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen
                        aria-hidden="true"
                        size={48}
                        className="text-slate-400"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {book.genre}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">
                      {book.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      By {book.author}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {
                        book.description
                      }
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                      <p className="text-slate-500">
                        ISBN:{" "}
                        <span className="font-mono text-slate-800">
                          {
                            book.isbn
                          }
                        </span>
                      </p>

                      <p className="flex items-center gap-2 text-slate-600">
                        <MapPin
                          size={16}
                          aria-hidden="true"
                        />

                        {
                          book.shelfLocation
                        }
                      </p>

                      <p className="font-semibold text-slate-800">
                        {
                          book.availableCopies
                        }{" "}
                        of{" "}
                        {
                          book.totalCopies
                        }{" "}
                        copies available
                      </p>

                      {currentUser?.role ===
                        "Student" && (
                        <div className="pt-3">
                          {existingRecord ? (
                            <div className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
                              {existingRecord.status ===
                              "Requested"
                                ? "Request pending approval"
                                : "Currently borrowed"}
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                !isAvailable
                              }
                              onClick={() =>
                                handleBorrowRequest(
                                  book.id,
                                )
                              }
                              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                            >
                              {isAvailable
                                ? "Request this book"
                                : "Currently unavailable"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}
