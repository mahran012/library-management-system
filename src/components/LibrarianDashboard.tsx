import { useMemo, useState } from 'react';

import {
  BookCheck,
  BookOpen,
  Clock3,
  UserRound,
} from 'lucide-react';

import { useLibrary } from '../context/LibraryContext';

type Feedback = {
  type: 'success' | 'error';
  message: string;
};

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function LibrarianDashboard() {
  const {
    books,
    records,
    currentUser,
    confirmBorrowRequest,
  } = useLibrary();

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const pendingRequests = useMemo(
    () =>
      records
        .filter(
          (record) =>
            record.status === 'Requested',
        )
        .sort(
          (a, b) =>
            new Date(b.borrowDate).getTime() -
            new Date(a.borrowDate).getTime(),
        ),
    [records],
  );

  const activeLoans = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === 'Borrowed',
      ).length,
    [records],
  );

  if (
    !currentUser ||
    currentUser.role !== 'Librarian'
  ) {
    return null;
  }

  const handleApprove = (
    recordId: string,
  ) => {
    const result =
      confirmBorrowRequest(recordId);

    setFeedback({
      type: result.success
        ? 'success'
        : 'error',
      message: result.message,
    });
  };

  return (
    <section>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
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
            {pendingRequests.length}
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
            {activeLoans}
          </p>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mb-6 rounded-lg border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold">
          Pending borrowing requests
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Review Student requests before
          issuing library inventory.
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookCheck
            size={42}
            className="mx-auto text-slate-400"
          />

          <h4 className="mt-4 text-lg font-semibold">
            No pending requests
          </h4>

          <p className="mt-2 text-sm text-slate-600">
            New Student borrowing requests
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(
            (record) => {
              const book = books.find(
                (candidate) =>
                  candidate.id ===
                  record.bookId,
              );

              const availableCopies =
                book?.availableCopies ?? 0;

              return (
                <article
                  key={record.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <UserRound size={16} />

                        <span>
                          {record.studentName}
                        </span>

                        <span>·</span>

                        <span className="font-mono">
                          {record.studentId}
                        </span>
                      </div>

                      <h4 className="mt-3 text-xl font-bold">
                        {record.bookTitle}
                      </h4>

                      <p className="mt-2 text-sm text-slate-600">
                        Requested on{' '}
                        {formatDate(
                          record.borrowDate,
                        )}
                      </p>

                      <p
                        className={`mt-2 text-sm font-semibold ${
                          availableCopies > 0
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {availableCopies}{' '}
                        {availableCopies === 1
                          ? 'copy'
                          : 'copies'}{' '}
                        currently available
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        availableCopies <= 0
                      }
                      onClick={() =>
                        handleApprove(
                          record.id,
                        )
                      }
                      className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                    >
                      {availableCopies > 0
                        ? 'Approve and issue'
                        : 'No copies available'}
                    </button>
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