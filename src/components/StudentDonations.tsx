import { useMemo, useState, type FormEvent } from 'react';
import { BookOpen, Gift, History, Send } from 'lucide-react';

import { useLibrary } from '../context/LibraryContext';
import type { DonationType, Genre } from '../types';

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

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
} as const;

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);

  return Number.isNaN(date.getTime())
    ? dateValue
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function StudentDonations() {
  const { currentUser, donations, submitDonation } = useLibrary();

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState<Genre>('Web Dev');
  const [donationType, setDonationType] = useState<DonationType>('Permanent');
  const [durationMonths, setDurationMonths] = useState('6');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const studentId = currentUser?.role === 'Student'
    ? currentUser.universityId
    : null;

  const myDonations = useMemo(() => {
    if (!studentId) {
      return [];
    }

    return donations
      .filter((donation) => donation.donorId === studentId)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }, [donations, studentId]);

  if (!studentId) {
    return null;
  }

  const pending = myDonations.filter((donation) => donation.status === 'Pending').length;
  const approved = myDonations.filter((donation) => donation.status === 'Approved').length;
  const rejected = myDonations.filter((donation) => donation.status === 'Rejected').length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const result = submitDonation({
      bookTitle,
      author,
      isbn,
      genre,
      donationType,
      ...(donationType === 'Temporary'
        ? { durationMonths: Number(durationMonths) }
        : {}),
    });

    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setBookTitle('');
      setAuthor('');
      setIsbn('');
      setGenre('Web Dev');
      setDonationType('Permanent');
      setDurationMonths('6');
    }
  };

  return (
    <section className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total requests', value: myDonations.length },
          { label: 'Pending', value: pending },
          { label: 'Approved', value: approved },
          { label: 'Rejected', value: rejected },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="h-fit rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <Gift size={22} aria-hidden="true" className="text-slate-700" />
            <h3 className="text-xl font-bold">Submit a book donation</h3>
          </div>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            Submit a permanent or temporary donation. A manager will review
            the request before any book is added to the catalogue.
          </p>

          {feedback && (
            <div
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`mb-5 rounded-lg border p-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="donation-title" className="mb-2 block text-sm font-semibold">
                Book title
              </label>
              <input
                id="donation-title"
                required
                value={bookTitle}
                onChange={(event) => setBookTitle(event.target.value)}
                placeholder="e.g. Clean Code"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label htmlFor="donation-author" className="mb-2 block text-sm font-semibold">
                Author
              </label>
              <input
                id="donation-author"
                required
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label htmlFor="donation-isbn" className="mb-2 block text-sm font-semibold">
                ISBN-10 or ISBN-13
              </label>
              <input
                id="donation-isbn"
                required
                value={isbn}
                onChange={(event) => setIsbn(event.target.value)}
                placeholder="9780132350884"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label htmlFor="donation-genre" className="mb-2 block text-sm font-semibold">
                Genre
              </label>
              <select
                id="donation-genre"
                value={genre}
                onChange={(event) => setGenre(event.target.value as Genre)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-900"
              >
                {GENRES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Donation type</legend>
              <div className="flex flex-wrap gap-4 text-sm">
                {(['Permanent', 'Temporary'] as const).map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="donation-type"
                      value={type}
                      checked={donationType === type}
                      onChange={() => setDonationType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            {donationType === 'Temporary' && (
              <div>
                <label htmlFor="donation-duration" className="mb-2 block text-sm font-semibold">
                  Duration (months)
                </label>
                <input
                  id="donation-duration"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={durationMonths}
                  onChange={(event) => setDurationMonths(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
                />
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <Send size={17} aria-hidden="true" />
              Submit for manager review
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <History size={22} aria-hidden="true" className="text-slate-700" />
            <h3 className="text-xl font-bold">My donation history</h3>
          </div>

          {myDonations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
              <BookOpen size={36} aria-hidden="true" className="mx-auto text-slate-400" />
              <p className="mt-3 font-semibold">No donation requests yet</p>
              <p className="mt-2 text-sm text-slate-600">
                Your submitted requests and review results will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myDonations.map((donation) => (
                <article
                  key={donation.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{donation.bookTitle}</h4>
                      <p className="mt-1 text-sm text-slate-600">By {donation.author}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[donation.status]}`}>
                      {donation.status}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">ISBN</dt>
                      <dd className="mt-1 break-all font-mono">{donation.isbn}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Genre</dt>
                      <dd className="mt-1">{donation.genre}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Type</dt>
                      <dd className="mt-1">
                        {donation.donationType}
                        {donation.donationType === 'Temporary' && donation.durationMonths
                          ? ` (${donation.durationMonths} months)`
                          : ''}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Submitted</dt>
                      <dd className="mt-1">{formatDate(donation.requestedAt)}</dd>
                    </div>
                  </dl>
                  {donation.status === 'Rejected' && donation.rejectionReason && (
                    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                      Rejection reason: {donation.rejectionReason}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
