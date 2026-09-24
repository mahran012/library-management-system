import { LoginPage } from './components/LoginPage';
import { useLibrary } from './context/LibraryContext';

function App() {
  const {
    currentUser,
    logout,
  } = useLibrary();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Authenticated session
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {currentUser.name}
            </h1>

            <p className="mt-2 text-slate-600">
              Signed in as {currentUser.role} using ID{' '}
              <span className="font-mono font-semibold">
                {currentUser.universityId}
              </span>.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8">
          <h2 className="text-xl font-semibold">
            Role application shell
          </h2>

          <p className="mt-2 text-slate-600">
            Role-aware navigation and library workspaces will
            be implemented in the next development task.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
