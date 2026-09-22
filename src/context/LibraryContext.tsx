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
  LibraryNotification,
} from '../types';

interface LibraryContextValue {
  books: Book[];
  records: BorrowingRecord[];
  donations: Donation[];
  assistants: AssistantAccount[];
  notifications: LibraryNotification[];
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
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    console.warn(
      `Invalid persisted library data was found for "${key}". Seed data will be restored.`,
    );

    localStorage.removeItem(key);

    return fallback;
  }
}

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined,
);

export function LibraryProvider({ children }: LibraryProviderProps) {
  const [books] = useState<Book[]>(() =>
    loadFromStorage(STORAGE_KEYS.books, INITIAL_BOOKS),
  );

  const [records] = useState<BorrowingRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.records, INITIAL_RECORDS),
  );

  const [donations] = useState<Donation[]>(() =>
    loadFromStorage(STORAGE_KEYS.donations, INITIAL_DONATIONS),
  );

  const [assistants] = useState<AssistantAccount[]>(() =>
    loadFromStorage(STORAGE_KEYS.assistants, INITIAL_ASSISTANTS),
  );

  const [notifications] = useState<LibraryNotification[]>(() =>
    loadFromStorage(
      STORAGE_KEYS.notifications,
      INITIAL_NOTIFICATIONS,
    ),
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.books,
      JSON.stringify(books),
    );

    localStorage.setItem(
      STORAGE_KEYS.records,
      JSON.stringify(records),
    );

    localStorage.setItem(
      STORAGE_KEYS.donations,
      JSON.stringify(donations),
    );

    localStorage.setItem(
      STORAGE_KEYS.assistants,
      JSON.stringify(assistants),
    );

    localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(notifications),
    );
  }, [
    books,
    records,
    donations,
    assistants,
    notifications,
  ]);

  const value: LibraryContextValue = {
    books,
    records,
    donations,
    assistants,
    notifications,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error(
      'useLibrary must be used within a LibraryProvider.',
    );
  }

  return context;
}
