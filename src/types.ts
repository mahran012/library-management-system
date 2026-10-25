export type Genre =
  | 'Algorithms'
  | 'Systems'
  | 'Web Dev'
  | 'Databases'
  | 'Architecture'
  | 'AI/ML'
  | 'DevOps'
  | 'Languages';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: Genre;
  description: string;
  imageUrl: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
}

export type BorrowStatus = 'Requested' | 'Borrowed' | 'Returned';

export interface BorrowingRecord {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  fineAmount: number;
  finePaid: boolean;
}

export type DonationType = 'Permanent' | 'Temporary';

export type DonationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  bookTitle: string;
  author: string;
  isbn: string;
  genre: Genre;
  donationType: DonationType;
  durationMonths?: number;
  status: DonationStatus;
  rejectionReason?: string;
  requestedAt: string;
}

export interface LibraryNotification {
  id: string;
  userId: string;
  title: string;
  text: string;
  type: 'Alert' | 'Success' | 'Info';
  date: string;
  isRead: boolean;
}

export interface User {
  universityId: string;
  name: string;
  role: 'Student' | 'Manager' | 'Librarian';
  email: string;
}

export interface AssistantAccount {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
