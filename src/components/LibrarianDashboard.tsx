import {
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  BookCheck,
  BookOpen,
  BookPlus,
  Clock3,
  UserRound,
  RotateCcw,
  AlertTriangle,
  CircleDollarSign,
  BadgeCheck,
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

function getLateDays(dueDate: string): number {
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const due = new Date(`${dueDate}T00:00:00`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.max(
    0,
    Math.ceil((todayDate.getTime() - due.getTime()) / millisecondsPerDay),
  );
}

export function LibrarianDashboard() {
  const {
    books,
    records,
    currentUser,
    confirmBorrowRequest,
    issueBook,
    returnBook,
    settleFine,
  } = useLibrary();

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const [issueStudentId, setIssueStudentId] =
    useState('');

  const [issueStudentName, setIssueStudentName] =
    useState('');

  const [issueBookId, setIssueBookId] =
    useState('');

  const pendingRequests = useMemo(
    () =>
      records
        .filter((record) => record.status === 'Requested')
        .sort(
          (a, b) =>
            new Date(b.borrowDate).getTime() -
            new Date(a.borrowDate).getTime(),
        ),
    [records],
  );

  const activeLoanRecords = useMemo(
    () =>
      records
        .filter((record) => record.status === 'Borrowed')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [records],
  );

  const activeLoans = activeLoanRecords.length;

  const outstandingFineRecords = useMemo(
    () =>
      records
        .filter(
          (record) =>
            record.status === 'Returned' &&
            record.fineAmount > 0 &&
            !record.finePaid,
        )
        .sort((a, b) => b.fineAmount - a.fineAmount),
    [records],
  );

  const outstandingFineTotal = outstandingFineRecords.reduce(
    (total, record) => total + record.fineAmount,
    0,
  );

  const availableBooks = useMemo(
    () =>
      books
        .filter((book) => book.availableCopies > 0)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [books],
  );

  if (!currentUser || currentUser.role !== 'Librarian') {
    return null;
  }

  const handleApprove = (recordId: string) => {
    const result = confirmBorrowRequest(recordId);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const handleDirectIssue = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const result = issueBook(
      issueStudentId,
      issueStudentName,
      issueBookId,
    );

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setIssueStudentId('');
      setIssueStudentName('');
      setIssueBookId('');
    }
  };

  const handleReturn = (recordId: string) => {
    const result = returnBook(recordId);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };


  const handleFineSettlement = (recordId: string) => {
    const result = settleFine(recordId);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  return (
    <section>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Outstanding fines
            </p>

            <CircleDollarSign
              size={20}
              className="text-red-600"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            ${outstandingFineTotal.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {outstandingFineRecords.length} unpaid record{outstandingFineRecords.length === 1 ? '' : 's'}
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

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <BookPlus
            size={22}
            className="text-slate-700"
          />

          <div>
            <h3 className="text-lg font-bold">
              Direct book issue
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Issue an available book directly to a Student.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleDirectIssue}
          className="grid gap-4 lg:grid-cols-2"
        >
          <div>
            <label
              htmlFor="issue-student-id"
              className="mb-2 block text-sm font-semibold"
            >
              Student ID
            </label>

            <input
              id="issue-student-id"
              value={issueStudentId}
              onChange={(event) =>
                setIssueStudentId(event.target.value)
              }
              placeholder="U2023101"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="issue-student-name"
              className="mb-2 block text-sm font-semibold"
            >
              Student name
            </label>

            <input
              id="issue-student-name"
              value={issueStudentName}
              onChange={(event) =>
                setIssueStudentName(event.target.value)
              }
              placeholder="Alex Mercer"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="issue-book"
              className="mb-2 block text-sm font-semibold"
            >
              Available book
            </label>

            <select
              id="issue-book"
              value={issueBookId}
              onChange={(event) =>
                setIssueBookId(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-900"
            >
              <option value="">
                Select a book
              </option>

              {availableBooks.map((book) => (
                <option
                  key={book.id}
                  value={book.id}
                >
                  {book.title} — {book.availableCopies} available
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={!issueBookId}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Issue book
            </button>
          </div>
        </form>
      </div>

      <div className="mb-5 mt-10">
        <h3 className="text-xl font-bold">
          Active loans and returns
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Process returned books and record overdue fines automatically.
        </p>
      </div>

      {activeLoanRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <RotateCcw
            size={38}
            className="mx-auto text-slate-400"
          />

          <h4 className="mt-4 text-lg font-semibold">
            No active loans
          </h4>

          <p className="mt-2 text-sm text-slate-600">
            Borrowed books that can be returned will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeLoanRecords.map((record) => {
            const lateDays = getLateDays(record.dueDate);
            const overdue = lateDays > 0;

            return (
              <article
                key={record.id}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <UserRound size={16} />
                      <span>{record.studentName}</span>
                      <span>·</span>
                      <span className="font-mono">
                        {record.studentId}
                      </span>
                    </div>

                    <h4 className="mt-3 text-xl font-bold">
                      {record.bookTitle}
                    </h4>

                    <p className="mt-2 text-sm text-slate-600">
                      Borrowed on {formatDate(record.borrowDate)}
                    </p>

                    <p
                      className={`mt-2 text-sm font-semibold ${
                        overdue ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      Due {formatDate(record.dueDate)}
                    </p>

                    {overdue && (
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                        <AlertTriangle size={16} />
                        {lateDays} overdue day{lateDays === 1 ? '' : 's'} · expected fine ${lateDays.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReturn(record.id)}
                    className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Process return
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mb-5 mt-10">
        <h3 className="text-xl font-bold">
          Outstanding fine settlements
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Record payments for overdue fines after returned books have been processed.
        </p>
      </div>

      {outstandingFineRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <BadgeCheck
            size={38}
            className="mx-auto text-slate-400"
          />

          <h4 className="mt-4 text-lg font-semibold">
            No outstanding fines
          </h4>

          <p className="mt-2 text-sm text-slate-600">
            Unpaid overdue fines will appear here after returned books are processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {outstandingFineRecords.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <UserRound size={16} />
                    <span>{record.studentName}</span>
                    <span>·</span>
                    <span className="font-mono">
                      {record.studentId}
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-bold">
                    {record.bookTitle}
                  </h4>

                  <p className="mt-2 text-sm text-slate-600">
                    Returned {record.returnDate ? formatDate(record.returnDate) : '—'}
                  </p>

                  <p className="mt-2 text-lg font-bold text-red-700">
                    ${record.fineAmount.toFixed(2)} outstanding
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleFineSettlement(record.id)}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Record fine payment
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold">
          Pending borrowing requests
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Review Student requests before issuing library inventory.
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
            New Student borrowing requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((record) => {
            const book = books.find(
              (candidate) => candidate.id === record.bookId,
            );

            const availableCopies = book?.availableCopies ?? 0;

            return (
              <article
                key={record.id}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <UserRound size={16} />

                      <span>{record.studentName}</span>
                      <span>·</span>

                      <span className="font-mono">
                        {record.studentId}
                      </span>
                    </div>

                    <h4 className="mt-3 text-xl font-bold">
                      {record.bookTitle}
                    </h4>

                    <p className="mt-2 text-sm text-slate-600">
                      Requested on {formatDate(record.borrowDate)}
                    </p>

                    <p
                      className={`mt-2 text-sm font-semibold ${
                        availableCopies > 0
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {availableCopies}{' '}
                      {availableCopies === 1 ? 'copy' : 'copies'}{' '}
                      currently available
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={availableCopies <= 0}
                    onClick={() => handleApprove(record.id)}
                    className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  >
                    {availableCopies > 0
                      ? 'Approve and issue'
                      : 'No copies available'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
