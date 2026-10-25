import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  INITIAL_ASSISTANTS,
  INITIAL_BOOKS,
  INITIAL_DONATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECORDS,
} from '../data';

import type {
  AssistantAccount,
  Book,
  BorrowingRecord,
  Donation,
  DonationType,
  Genre,
  LibraryNotification,
  User,
} from '../types';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface ActionResult {
  success: boolean;
  message: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface DonationSubmission {
  bookTitle: string;
  author: string;
  isbn: string;
  genre: Genre;
  donationType: DonationType;
  durationMonths?: number;
}

interface LibraryContextValue {
  books: Book[];
  records: BorrowingRecord[];
  donations: Donation[];
  assistants: AssistantAccount[];
  notifications: LibraryNotification[];
  currentUser: User | null;
  login: (
    universityId: string,
    role: User['role'],
    password: string,
  ) => Promise<LoginResult>;
  logout: () => void;
  requestBorrow: (bookId: string) => ActionResult;
  submitDonation: (submission: DonationSubmission) => ActionResult;
}

interface LibraryProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  books: 'lms_books',
  records: 'lms_records',
  donations: 'lms_donations',
  assistants: 'lms_assistants',
  notifications: 'lms_notifications',
  currentUser: 'lms_current_user',
  jwtToken: 'lms_jwt_token',
} as const;

const SUPPORTED_GENRES: Genre[] = [
  'Algorithms',
  'Systems',
  'Web Dev',
  'Databases',
  'Architecture',
  'AI/ML',
  'DevOps',
  'Languages',
];

function loadFromStorage<T>(key: string, fallback: T): T {
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    console.warn(
      `Invalid persisted library data was found for "${key}". Fallback data will be used.`,
    );
    localStorage.removeItem(key);
    return fallback;
  }
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, numberOfDays: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + numberOfDays);
  return result;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined,
);

export function LibraryProvider({ children }: LibraryProviderProps) {
  const [books] = useState<Book[]>(() =>
    loadFromStorage(STORAGE_KEYS.books, INITIAL_BOOKS),
  );

  const [records, setRecords] = useState<BorrowingRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.records, INITIAL_RECORDS),
  );

  const [donations, setDonations] = useState<Donation[]>(() =>
    loadFromStorage(STORAGE_KEYS.donations, INITIAL_DONATIONS),
  );

  const [assistants] = useState<AssistantAccount[]>(() =>
    loadFromStorage(STORAGE_KEYS.assistants, INITIAL_ASSISTANTS),
  );

  const [notifications, setNotifications] =
    useState<LibraryNotification[]>(() =>
      loadFromStorage(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS),
    );

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(STORAGE_KEYS.currentUser, null),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEYS.donations, JSON.stringify(donations));
    localStorage.setItem(STORAGE_KEYS.assistants, JSON.stringify(assistants));
    localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(notifications),
    );
  }, [books, records, donations, assistants, notifications]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.jwtToken);

    if (!token) {
      if (currentUser) {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEYS.currentUser);
      }
      return;
    }

    fetch('/api/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = (await response.json()) as AuthResponse;

        if (!response.ok || !data.success) {
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEYS.currentUser);
          localStorage.removeItem(STORAGE_KEYS.jwtToken);
        }
      })
      .catch(() => {
        console.warn(
          'Authentication token could not be verified because the server is unavailable.',
        );
      });
    // Restore the existing session at application startup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (
    universityId: string,
    role: User['role'],
    password: string,
  ): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId, role, password }),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.success || !data.token || !data.user) {
        return {
          success: false,
          error:
            data.message ??
            'Authentication failed. Please check your credentials.',
        };
      }

      setCurrentUser(data.user);
      localStorage.setItem(
        STORAGE_KEYS.currentUser,
        JSON.stringify(data.user),
      );
      localStorage.setItem(STORAGE_KEYS.jwtToken, data.token);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'The authentication server could not be reached. Please try again.',
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.jwtToken);
  };

  const hasOutstandingFines = (studentId: string): boolean =>
    records.some(
      (record) =>
        record.studentId === studentId &&
        record.fineAmount > 0 &&
        !record.finePaid,
    );

  const requestBorrow = (bookId: string): ActionResult => {
    if (!currentUser || currentUser.role !== 'Student') {
      return {
        success: false,
        message: 'Only authenticated students can request library books.',
      };
    }

    const book = books.find((candidate) => candidate.id === bookId);

    if (!book) {
      return { success: false, message: 'The selected book could not be found.' };
    }

    if (book.availableCopies <= 0) {
      return {
        success: false,
        message: 'This book is currently unavailable for borrowing.',
      };
    }

    if (hasOutstandingFines(currentUser.universityId)) {
      return {
        success: false,
        message:
          'Outstanding library fines must be settled before requesting another book.',
      };
    }

    const duplicateRecord = records.some(
      (record) =>
        record.studentId === currentUser.universityId &&
        record.bookId === book.id &&
        record.status !== 'Returned',
    );

    if (duplicateRecord) {
      return {
        success: false,
        message: 'You already have an active request or loan for this book.',
      };
    }

    const requestDate = new Date();
    const record: BorrowingRecord = {
      id: `BR-${crypto.randomUUID()}`,
      studentId: currentUser.universityId,
      studentName: currentUser.name,
      bookId: book.id,
      bookTitle: book.title,
      borrowDate: toDateString(requestDate),
      dueDate: toDateString(addDays(requestDate, 14)),
      status: 'Requested',
      fineAmount: 0,
      finePaid: false,
    };

    const notification: LibraryNotification = {
      id: `NT-${crypto.randomUUID()}`,
      userId: currentUser.universityId,
      title: 'Borrow Request Submitted',
      text: `Your request for "${book.title}" has been submitted for librarian approval.`,
      type: 'Info',
      date: toDateString(requestDate),
      isRead: false,
    };

    setRecords((currentRecords) => [record, ...currentRecords]);
    setNotifications((currentNotifications) => [
      notification,
      ...currentNotifications,
    ]);

    return {
      success: true,
      message:
        'Borrow request submitted successfully. A librarian must approve it before the book is issued.',
    };
  };

  const submitDonation = (submission: DonationSubmission): ActionResult => {
    if (!currentUser || currentUser.role !== 'Student') {
      return {
        success: false,
        message: 'Only authenticated students can submit donation requests.',
      };
    }

    const bookTitle = submission.bookTitle.trim();
    const author = submission.author.trim();
    const isbn = submission.isbn.replace(/[\s-]/g, '').toUpperCase();

    if (!bookTitle || !author || !isbn) {
      return {
        success: false,
        message: 'Book title, author and ISBN are required.',
      };
    }

    if (!/^(?:\d{10}|\d{13}|\d{9}X)$/.test(isbn)) {
      return {
        success: false,
        message: 'Enter a valid ISBN-10 or ISBN-13 format.',
      };
    }

    if (!SUPPORTED_GENRES.includes(submission.genre)) {
      return { success: false, message: 'Please select a supported genre.' };
    }

    if (submission.donationType !== 'Permanent' &&
        submission.donationType !== 'Temporary') {
      return { success: false, message: 'Please select a donation type.' };
    }

    if (
      submission.donationType === 'Temporary' &&
      (!Number.isInteger(submission.durationMonths) ||
        (submission.durationMonths ?? 0) < 1)
    ) {
      return {
        success: false,
        message: 'Temporary donations require a positive whole-number duration.',
      };
    }

    const today = new Date();
    const donation: Donation = {
      id: `DON-${crypto.randomUUID()}`,
      donorId: currentUser.universityId,
      donorName: currentUser.name,
      bookTitle,
      author,
      isbn,
      genre: submission.genre,
      donationType: submission.donationType,
      ...(submission.donationType === 'Temporary'
        ? { durationMonths: submission.durationMonths }
        : {}),
      status: 'Pending',
      requestedAt: today.toISOString(),
    };

    const notification: LibraryNotification = {
      id: `NT-${crypto.randomUUID()}`,
      userId: currentUser.universityId,
      title: 'Donation Request Submitted',
      text: `Your donation request for "${bookTitle}" is awaiting manager review.`,
      type: 'Info',
      date: toDateString(today),
      isRead: false,
    };

    setDonations((currentDonations) => [donation, ...currentDonations]);
    setNotifications((currentNotifications) => [
      notification,
      ...currentNotifications,
    ]);

    return {
      success: true,
      message: `Your donation request for "${bookTitle}" was submitted for review.`,
    };
  };

  const value: LibraryContextValue = {
    books,
    records,
    donations,
    assistants,
    notifications,
    currentUser,
    login,
    logout,
    requestBorrow,
    submitDonation,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider.');
  }

  return context;
}
