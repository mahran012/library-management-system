import {
  useEffect,
  useState,
} from "react";

import {
  Sidebar,
  type NavigationView,
} from "./components/Sidebar";

import { BookSearchGrid } from "./components/BookSearchGrid";
import { LoginPage } from "./components/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";

import { useLibrary } from "./context/LibraryContext";

const VIEW_CONTENT: Record<
  NavigationView,
  {
    title: string;
    description: string;
  }
> = {
  overview: {
    title: "Library Overview",
    description:
      "Your role-based library workspace is ready.",
  },

  catalogue: {
    title: "Browse Books",
    description:
      "Search the university catalogue by title, author, ISBN, genre and availability.",
  },

  "student-library": {
    title: "My Library",
    description:
      "Review your borrowing requests, active loans, return history and library fines.",
  },

  donations: {
    title: "Donations",
    description:
      "Student donation submission and history will be implemented in the next Student-services task.",
  },

  circulation: {
    title: "Circulation",
    description:
      "Borrow confirmation, issuing, returns and fine handling will be implemented in later tasks.",
  },

  management: {
    title: "Management",
    description:
      "Catalogue administration, donation review and analytics will be implemented in later tasks.",
  },
};

function App() {
  const {
    currentUser,
  } = useLibrary();

  const [
    activeView,
    setActiveView,
  ] =
    useState<NavigationView>(
      "overview",
    );

  useEffect(() => {
    setActiveView("overview");
  }, [
    currentUser?.universityId,
  ]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const content =
    VIEW_CONTENT[activeView];

  const renderWorkspace =
    () => {
      if (
        currentUser.role ===
          "Student" &&
        activeView ===
          "catalogue"
      ) {
        return (
          <BookSearchGrid />
        );
      }

      if (
        currentUser.role ===
          "Student" &&
        activeView ===
          "student-library"
      ) {
        return (
          <StudentDashboard />
        );
      }

      return (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-sm font-semibold text-slate-500">
            Signed in as
          </p>

          <p className="mt-2 text-xl font-semibold">
            {currentUser.name}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {currentUser.email}
          </p>

          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm text-slate-600">
              This workspace
              will be implemented
              in its scheduled
              development task.
            </p>
          </div>
        </div>
      );
    };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <Sidebar
        activeView={
          activeView
        }
        onNavigate={
          setActiveView
        }
      />

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            {
              currentUser.role
            }{" "}
            workspace
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {content.title}
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {
              content.description
            }
          </p>
        </header>

        <section className="mt-8">
          {renderWorkspace()}
        </section>
      </main>
    </div>
  );
}

export default App;
