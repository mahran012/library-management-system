import type { LucideIcon } from 'lucide-react';

import {
  BookOpen,
  Gift,
  LayoutDashboard,
  Library,
  LogOut,
  Search,
  Settings,
} from 'lucide-react';

import { useLibrary } from '../context/LibraryContext';

import type { User } from '../types';

export type NavigationView =
  | 'overview'
  | 'catalogue'
  | 'student-library'
  | 'donations'
  | 'circulation'
  | 'management';

interface NavigationItem {
  id: NavigationView;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  activeView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

const OVERVIEW_ITEM: NavigationItem = {
  id: 'overview',
  label: 'Overview',
  icon: LayoutDashboard,
};

const ROLE_NAVIGATION: Record<User['role'], NavigationItem[]> = {
  Student: [
    {
      id: 'catalogue',
      label: 'Browse Books',
      icon: Search,
    },
    {
      id: 'student-library',
      label: 'My Library',
      icon: BookOpen,
    },
    {
      id: 'donations',
      label: 'Donations',
      icon: Gift,
    },
  ],

  Librarian: [
    {
      id: 'circulation',
      label: 'Circulation',
      icon: Library,
    },
  ],

  Manager: [
    {
      id: 'management',
      label: 'Management',
      icon: Settings,
    },
  ],
};

export function Sidebar({
  activeView,
  onNavigate,
}: SidebarProps) {
  const {
    currentUser,
    logout,
  } = useLibrary();

  if (!currentUser) {
    return null;
  }

  const navigationItems = [
    OVERVIEW_ITEM,
    ...ROLE_NAVIGATION[currentUser.role],
  ];

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-slate-950 text-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          University Library
        </p>

        <h1 className="mt-2 text-lg font-bold">
          Library System
        </h1>
      </div>

      <div className="border-b border-slate-800 px-6 py-5">
        <p className="font-semibold">
          {currentUser.name}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          {currentUser.role}
        </p>

        <p className="mt-1 font-mono text-xs text-slate-500">
          {currentUser.universityId}
        </p>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-white text-slate-950'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={18} />

              <span>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
        >
          <LogOut size={18} />

          <span>
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
