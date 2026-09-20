function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
          University Library
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Library Management System
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          A role-based application for managing university library services.
        </p>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">
            Project foundation ready
          </h2>

          <p className="mt-2 text-slate-600">
            Authentication, catalogue management, borrowing, donations and
            administrative workflows will be added in later development tasks.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
