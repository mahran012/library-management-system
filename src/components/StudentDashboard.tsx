import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  History,
} from "lucide-react";

import { useLibrary } from "../context/LibraryContext";

import type {
  BorrowStatus,
} from "../types";

type RecordFilter =
  | "All"
  | BorrowStatus;

const FILTERS: RecordFilter[] = [
  "All",
  "Requested",
  "Borrowed",
  "Returned",
];

const STATUS_STYLES: Record<
  BorrowStatus,
  string
> = {
  Requested:
    "bg-amber-100 text-amber-800",
  Borrowed:
    "bg-blue-100 text-blue-800",
  Returned:
    "bg-green-100 text-green-800",
};

function formatDate(
  value?: string,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

function formatMoney(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value);
}

function isLoanOverdue(
  status: BorrowStatus,
  dueDate: string,
) {
  if (status !== "Borrowed") {
    return false;
  }

  const due = new Date(
    `${dueDate}T23:59:59`,
  );

  return due.getTime() <
    new Date().getTime();
}

export function StudentDashboard() {
  const {
    currentUser,
    records,
  } = useLibrary();

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<RecordFilter>("All");

  const studentId =
    currentUser?.role ===
    "Student"
      ? currentUser.universityId
      : null;

  const studentRecords =
    useMemo(() => {
      if (!studentId) {
        return [];
      }

      return records
        .filter(
          (record) =>
            record.studentId ===
            studentId,
        )
        .sort(
          (a, b) =>
            new Date(
              b.borrowDate,
            ).getTime() -
            new Date(
              a.borrowDate,
            ).getTime(),
        );
    }, [
      records,
      studentId,
    ]);

  const filteredRecords =
    useMemo(() => {
      if (
        selectedFilter === "All"
      ) {
        return studentRecords;
      }

      return studentRecords.filter(
        (record) =>
          record.status ===
          selectedFilter,
      );
    }, [
      studentRecords,
      selectedFilter,
    ]);

  const requestedCount =
    studentRecords.filter(
      (record) =>
        record.status ===
        "Requested",
    ).length;

  const borrowedCount =
    studentRecords.filter(
      (record) =>
        record.status ===
        "Borrowed",
    ).length;

  const returnedCount =
    studentRecords.filter(
      (record) =>
        record.status ===
        "Returned",
    ).length;

  const outstandingFine =
    studentRecords.reduce(
      (total, record) => {
        if (
          record.fineAmount > 0 &&
          !record.finePaid
        ) {
          return (
            total +
            record.fineAmount
          );
        }

        return total;
      },
      0,
    );

  if (
    !currentUser ||
    currentUser.role !==
      "Student"
  ) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Pending requests
            </p>

            <Clock3
              size={20}
              className="text-amber-600"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {requestedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Active loans
            </p>

            <BookOpen
              size={20}
              className="text-blue-600"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {borrowedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Returned books
            </p>

            <History
              size={20}
              className="text-green-600"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {returnedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Outstanding fines
            </p>

            <DollarSign
              size={20}
              className={
                outstandingFine > 0
                  ? "text-red-600"
                  : "text-slate-400"
              }
            />
          </div>

          <p
            className={`mt-3 text-3xl font-bold ${
              outstandingFine > 0
                ? "text-red-700"
                : ""
            }`}
          >
            {formatMoney(
              outstandingFine,
            )}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(
            (filter) => {
              const active =
                selectedFilter ===
                filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setSelectedFilter(
                      filter,
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              );
            },
          )}
        </div>
      </div>

      {studentRecords.length ===
      0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookOpen
            size={42}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-4 text-xl font-semibold">
            No borrowing records yet
          </h3>

          <p className="mt-2 text-slate-600">
            Books you request or
            borrow will appear here.
          </p>
        </div>
      ) : filteredRecords.length ===
        0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold">
            No{" "}
            {selectedFilter.toLowerCase()}{" "}
            records
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Select another status
            filter to view your
            borrowing history.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(
            (record) => {
              const overdue =
                isLoanOverdue(
                  record.status,
                  record.dueDate,
                );

              return (
                <article
                  key={record.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[record.status]}`}
                        >
                          {
                            record.status
                          }
                        </span>

                        {overdue && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                            <AlertCircle
                              size={13}
                            />
                            Overdue
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-xl font-bold">
                        {
                          record.bookTitle
                        }
                      </h3>

                      <p className="mt-1 font-mono text-xs text-slate-500">
                        Record ID:{" "}
                        {record.id}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      {record.finePaid ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-700 lg:justify-end">
                          <CheckCircle2
                            size={17}
                          />
                          Fine settled
                        </div>
                      ) : record.fineAmount >
                        0 ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                            Outstanding
                            fine
                          </p>

                          <p className="mt-1 text-xl font-bold text-red-700">
                            {formatMoney(
                              record.fineAmount,
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-green-700">
                          No outstanding
                          fine
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <CalendarDays
                          size={15}
                        />

                        {record.status ===
                        "Requested"
                          ? "Requested on"
                          : "Borrowed on"}
                      </p>

                      <p className="mt-2 font-semibold">
                        {formatDate(
                          record.borrowDate,
                        )}
                      </p>
                    </div>

                    {record.status ===
                      "Requested" && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Loan status
                        </p>

                        <p className="mt-2 text-sm text-slate-700">
                          Waiting for
                          librarian
                          approval.
                        </p>
                      </div>
                    )}

                    {record.status ===
                      "Borrowed" && (
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <Clock3
                            size={15}
                          />
                          Due date
                        </p>

                        <p
                          className={`mt-2 font-semibold ${
                            overdue
                              ? "text-red-700"
                              : ""
                          }`}
                        >
                          {formatDate(
                            record.dueDate,
                          )}
                        </p>
                      </div>
                    )}

                    {record.status ===
                      "Returned" && (
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <CheckCircle2
                            size={15}
                          />
                          Returned on
                        </p>

                        <p className="mt-2 font-semibold">
                          {formatDate(
                            record.returnDate,
                          )}
                        </p>
                      </div>
                    )}

                    {record.status !==
                      "Requested" && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Due date
                        </p>

                        <p className="mt-2 font-semibold">
                          {formatDate(
                            record.dueDate,
                          )}
                        </p>
                      </div>
                    )}
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
