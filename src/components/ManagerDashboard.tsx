import { useMemo, useState, type FormEvent } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Gift,
  LibraryBig,
  UserPlus,
  UsersRound,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  XCircle,
  X,
} from 'lucide-react';

import {
  useLibrary,
  type BookSubmission,
} from '../context/LibraryContext';
import type { Book, Genre } from '../types';

const GENRES: Genre[] = [
  'Algorithms',
  'Systems',
  'Web Dev',
  'Databases',
  'Architecture',
  'AI/ML',
  'DevOps',
  'Languages',
];

const EMPTY_FORM: BookSubmission = {
  title: '',
  author: '',
  isbn: '',
  genre: 'Web Dev',
  description: '',
  imageUrl: '',
  shelfLocation: '',
  totalCopies: 1,
};

type Feedback = {
  type: 'success' | 'error';
  message: string;
};

export function ManagerDashboard() {
  const {
    books,
    donations,
    assistants,
    currentUser,
    addBook,
    updateBook,
    deleteBook,
    approveDonation,
    rejectDonation,
    addAssistant,
  } = useLibrary();

  const [query, setQuery] = useState('');
  const [form, setForm] = useState<BookSubmission>(EMPTY_FORM);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editForm, setEditForm] = useState<BookSubmission>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [donationShelf, setDonationShelf] = useState<Record<string, string>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [assistantName, setAssistantName] = useState('');
  const [assistantEmail, setAssistantEmail] = useState('');

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) =>
      [
        book.title,
        book.author,
        book.isbn,
        book.genre,
        book.shelfLocation,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [books, query]);

  const totalCopies = useMemo(
    () => books.reduce((sum, book) => sum + book.totalCopies, 0),
    [books],
  );

  const availableCopies = useMemo(
    () => books.reduce((sum, book) => sum + book.availableCopies, 0),
    [books],
  );


  const pendingDonations = useMemo(
    () => donations.filter((donation) => donation.status === 'Pending'),
    [donations],
  );

  const evaluatedDonations = useMemo(
    () => donations.filter((donation) => donation.status !== 'Pending'),
    [donations],
  );

  if (!currentUser || currentUser.role !== 'Manager') {
    return null;
  }

  const updateFormField = <K extends keyof BookSubmission>(
    key: K,
    value: BookSubmission[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateEditField = <K extends keyof BookSubmission>(
    key: K,
    value: BookSubmission[K],
  ) => {
    setEditForm((current) => ({ ...current, [key]: value }));
  };

  const handleAddBook = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addBook(form);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setForm(EMPTY_FORM);
    }
  };

  const startEditing = (book: Book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      description: book.description,
      imageUrl: book.imageUrl,
      shelfLocation: book.shelfLocation,
      totalCopies: book.totalCopies,
    });
    setFeedback(null);
  };

  const handleUpdateBook = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingBook) {
      return;
    }

    const result = updateBook(editingBook.id, editForm);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setEditingBook(null);
    }
  };

  const handleDeleteBook = (book: Book) => {
    const confirmed = window.confirm(
      `Remove \"${book.title}\" from the catalogue?`,
    );

    if (!confirmed) {
      return;
    }

    const result = deleteBook(book.id);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };


  const handleApproveDonation = (donationId: string) => {
    const result = approveDonation(
      donationId,
      donationShelf[donationId] ?? '',
    );

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setDonationShelf((current) => ({ ...current, [donationId]: '' }));
      setRejectionReason((current) => ({ ...current, [donationId]: '' }));
    }
  };

  const handleRejectDonation = (donationId: string) => {
    const result = rejectDonation(
      donationId,
      rejectionReason[donationId] ?? '',
    );

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setDonationShelf((current) => ({ ...current, [donationId]: '' }));
      setRejectionReason((current) => ({ ...current, [donationId]: '' }));
    }
  };


  const handleAddAssistant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = addAssistant(assistantName, assistantEmail);

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setAssistantName('');
      setAssistantEmail('');
    }
  };

  const formFields = (
    values: BookSubmission,
    updateField: <K extends keyof BookSubmission>(
      key: K,
      value: BookSubmission[K],
    ) => void,
  ) => (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700">
        Title
        <input
          value={values.title}
          onChange={(event) => updateField('title', event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
          placeholder="Clean Code"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Author
        <input
          value={values.author}
          onChange={(event) => updateField('author', event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
          placeholder="Robert C. Martin"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700">
        ISBN
        <input
          value={values.isbn}
          onChange={(event) => updateField('isbn', event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
          placeholder="9780132350884"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Genre
        <select
          value={values.genre}
          onChange={(event) =>
            updateField('genre', event.target.value as Genre)
          }
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-900"
        >
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Shelf location
        <input
          value={values.shelfLocation}
          onChange={(event) =>
            updateField('shelfLocation', event.target.value)
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
          placeholder="WEB-B101"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Total copies
        <input
          type="number"
          min={1}
          step={1}
          value={values.totalCopies}
          onChange={(event) =>
            updateField('totalCopies', Number(event.target.value))
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700 md:col-span-2">
        Image URL
        <input
          value={values.imageUrl}
          onChange={(event) => updateField('imageUrl', event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
          placeholder="Optional image URL"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700 md:col-span-2">
        Description
        <textarea
          rows={3}
          value={values.description}
          onChange={(event) =>
            updateField('description', event.target.value)
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-900"
          placeholder="Short catalogue description"
        />
      </label>
    </div>
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Catalogue titles</p>
            <LibraryBig size={20} className="text-slate-700" />
          </div>
          <p className="mt-3 text-3xl font-bold">{books.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total copies</p>
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold">{totalCopies}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Available copies</p>
            <PackageCheck size={20} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold">{availableCopies}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending donations</p>
            <Gift size={20} className="text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-bold">{pendingDonations.length}</p>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-lg border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {feedback.message}
        </div>
      )}


      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <UsersRound size={24} className="mt-0.5 text-indigo-700" />
            <div>
              <h3 className="text-xl font-bold">Assistant Librarian accounts</h3>
              <p className="mt-1 text-sm text-slate-600">
                Create staff IDs for Librarians who operate circulation, returns and fine settlement.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {assistants.length} active account{assistants.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Staff ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {assistants.map((assistant) => (
                    <tr key={assistant.id}>
                      <td className="px-4 py-4 font-mono font-bold text-indigo-700">
                        {assistant.id}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {assistant.name}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {assistant.email}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {assistant.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {assistants.length === 0 && (
              <div className="border-t border-slate-200 px-5 py-10 text-center text-sm text-slate-600">
                No Assistant Librarian accounts have been created.
              </div>
            )}
          </div>

          <form
            onSubmit={handleAddAssistant}
            className="rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-5 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-700" />
              <h4 className="font-bold">Create Assistant account</h4>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Assistant name
              <input
                required
                value={assistantName}
                onChange={(event) => setAssistantName(event.target.value)}
                placeholder="Jane Sheppard"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-900"
              />
            </label>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              University email
              <input
                required
                type="email"
                value={assistantEmail}
                onChange={(event) => setAssistantEmail(event.target.value)}
                placeholder="jane.s@university.edu"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-900"
              />
            </label>

            <p className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
              A sequential AST staff ID is generated automatically. Librarians use the standard system password configured for the course demo.
            </p>

            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <UserPlus size={17} />
              Create Assistant account
            </button>
          </form>
        </div>
      </div>


      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Gift size={22} className="text-amber-600" />
          <div>
            <h3 className="text-xl font-bold">Donation review queue</h3>
            <p className="mt-1 text-sm text-slate-600">
              Approve suitable donations into the catalogue or reject them with review notes.
            </p>
          </div>
        </div>

        {pendingDonations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
            No pending donation requests require review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDonations.map((donation) => {
              const matchingBook = books.find(
                (book) =>
                  book.isbn.replace(/[\s-]/g, '').toUpperCase() ===
                  donation.isbn.replace(/[\s-]/g, '').toUpperCase(),
              );

              return (
                <article
                  key={donation.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span>{donation.donationType}</span>
                        <span>·</span>
                        <span>{donation.genre}</span>
                        <span>·</span>
                        <span>ISBN {donation.isbn}</span>
                      </div>

                      <h4 className="mt-2 text-lg font-bold">{donation.bookTitle}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {donation.author} · Donated by {donation.donorName} ({donation.donorId})
                      </p>

                      {donation.donationType === 'Temporary' && (
                        <p className="mt-2 text-sm font-semibold text-amber-700">
                          Temporary donation for {donation.durationMonths ?? 1} month{(donation.durationMonths ?? 1) === 1 ? '' : 's'}
                        </p>
                      )}

                      {matchingBook && (
                        <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                          This ISBN already exists at {matchingBook.shelfLocation}. Approval will add one available copy to the existing catalogue record.
                        </p>
                      )}
                    </div>

                    <div className="w-full space-y-3 xl:w-96">
                      {!matchingBook && (
                        <label className="block text-sm font-semibold text-slate-700">
                          Shelf location
                          <input
                            value={donationShelf[donation.id] ?? ''}
                            onChange={(event) =>
                              setDonationShelf((current) => ({
                                ...current,
                                [donation.id]: event.target.value,
                              }))
                            }
                            placeholder="DON-A101"
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-900"
                          />
                        </label>
                      )}

                      <label className="block text-sm font-semibold text-slate-700">
                        Rejection reason
                        <input
                          value={rejectionReason[donation.id] ?? ''}
                          onChange={(event) =>
                            setRejectionReason((current) => ({
                              ...current,
                              [donation.id]: event.target.value,
                            }))
                          }
                          placeholder="Required only when rejecting"
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-900"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveDonation(donation.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                          <CheckCircle2 size={16} />
                          Approve donation
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectDonation(donation.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {evaluatedDonations.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h4 className="font-bold">Donation review history</h4>
            <div className="mt-3 space-y-2">
              {evaluatedDonations.slice(0, 8).map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-col gap-1 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-semibold">{donation.bookTitle}</span>
                    <span className="text-slate-500"> · {donation.donorName}</span>
                    {donation.rejectionReason && (
                      <p className="mt-1 text-xs text-slate-500">
                        Review note: {donation.rejectionReason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-semibold ${
                      donation.status === 'Approved'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {donation.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Plus size={22} />
          <div>
            <h3 className="text-xl font-bold">Add catalogue book</h3>
            <p className="mt-1 text-sm text-slate-600">
              Register a new title and its initial physical inventory.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddBook}>
          {formFields(form, updateFormField)}
          <button
            type="submit"
            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add book
          </button>
        </form>
      </div>

      <div>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-bold">Catalogue inventory</h3>
            <p className="mt-1 text-sm text-slate-600">
              Search, edit or remove catalogue records.
            </p>
          </div>

          <label className="relative block w-full lg:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 outline-none focus:border-slate-900"
              placeholder="Search title, author, ISBN or shelf"
            />
          </label>
        </div>

        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <article
              key={book.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>{book.genre}</span>
                    <span>·</span>
                    <span>{book.shelfLocation}</span>
                    <span>·</span>
                    <span>ISBN {book.isbn}</span>
                  </div>

                  <h4 className="mt-2 text-lg font-bold">{book.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{book.author}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {book.availableCopies} available / {book.totalCopies} total
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(book)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBook(book)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {filteredBooks.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
              No catalogue books match this search.
            </div>
          )}
        </div>
      </div>

      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Edit catalogue book</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Inventory cannot be reduced below copies currently on loan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingBook(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close edit dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBook}>
              {formFields(editForm, updateEditField)}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
