import { useState, type FormEvent } from 'react';

import { useLibrary } from '../context/LibraryContext';

import type { User } from '../types';

type Role = User['role'];

const QUICK_ACCOUNTS: Record<Role, string> = {
  Student: 'U2023101',
  Librarian: 'AST001',
  Manager: 'MGR001',
};

export function LoginPage() {
  const { login } = useLibrary();

  const [role, setRole] = useState<Role>('Student');
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('password123');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setUniversityId('');
    setError(null);
  };

  const authenticate = async (
    loginId: string,
    loginRole: Role,
    loginPassword: string,
  ) => {
    setError(null);
    setLoading(true);

    const result = await login(
      loginId,
      loginRole,
      loginPassword,
    );

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ?? 'Authentication failed.',
      );
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedId = universityId.trim();

    if (!normalizedId) {
      setError('University ID or staff code is required.');
      return;
    }

    await authenticate(
      normalizedId,
      role,
      password,
    );
  };

  const handleQuickLogin = async (selectedRole: Role) => {
    setRole(selectedRole);
    setUniversityId(QUICK_ACCOUNTS[selectedRole]);

    await authenticate(
      QUICK_ACCOUNTS[selectedRole],
      selectedRole,
      'password123',
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              University Library
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Sign in
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select your library role and authenticate using
              your university credentials.
            </p>
          </header>

          <div className="mb-6 grid grid-cols-3 gap-2">
            {(
              [
                'Student',
                'Librarian',
                'Manager',
              ] as Role[]
            ).map((availableRole) => (
              <button
                key={availableRole}
                type="button"
                onClick={() => selectRole(availableRole)}
                disabled={loading}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  role === availableRole
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {availableRole}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="university-id"
                className="mb-2 block text-sm font-semibold"
              >
                {role === 'Student'
                  ? 'University ID'
                  : 'Staff code'}
              </label>

              <input
                id="university-id"
                value={universityId}
                onChange={(event) =>
                  setUniversityId(event.target.value)
                }
                disabled={loading}
                placeholder={
                  role === 'Student'
                    ? 'U2023101'
                    : role === 'Librarian'
                      ? 'AST001'
                      : 'MGR001'
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? 'Authenticating...'
                : `Sign in as ${role}`}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-200 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Development quick login
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('Student')}
                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium hover:bg-slate-50"
              >
                Student
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('Librarian')}
                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium hover:bg-slate-50"
              >
                Librarian
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('Manager')}
                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium hover:bg-slate-50"
              >
                Manager
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Seed account password: password123
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
