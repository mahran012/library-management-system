import { useEffect, useState } from 'react';

import {
  Sidebar,
  type NavigationView,
} from './components/Sidebar';

import { LoginPage } from './components/LoginPage';
import { useLibrary } from './context/LibraryContext';

const VIEW_CONTENT: Record<
  NavigationView,
  {
    title: string;
    description: string;
  }
> = {
  overview: {
    title: 'Library Overview',
    description:
      'Your role-based library workspace is ready.',
  },

  catalogue: {
    title: 'Browse Books',
    description:
      'Searchable catalogue functionality will be implemented in the next development phase.',
  },

  'student-library': {
    title: 'My Library',
    description:
      'Borrowing requests, active loans and fines will be implemented in later tasks.',
  },

  donations: {
    title: 'Donations',
    description:
      'Student donation submission and history will be implemented in a later task.',
  },

  circulation: {
    title: 'Circulation',
    description:
      'Borrow confirmation, issuing, returns and fine handling will be implemented in later tasks.',
  },

  management: {
    title: 'Management',
    description:
      'Catalogue administration, donation review and analytics will be implemented in later tasks.',
  },
};

function App() {
  const {
    currentUser,
  } = useLibrary();

  const [
    activeView,
    setActiveView,
  ] = useState<NavigationView>('overview');

  useEffect(() => {
    setActiveView('overview');
  }, [currentUser?.universityId]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const content = VIEW_CONTENT[activeView];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
      />

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            {currentUser.role} workspace
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {content.title}
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {content.description}
          </p>
        </header>

        <section className="mt-8">
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
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
