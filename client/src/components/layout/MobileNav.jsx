import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Logo from '../brand/Logo';
import { SunIcon, MoonIcon, LogOutIcon } from '../ui/icons';
import { useAuth } from '../../context/AuthContext';

function useDarkMode() {
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
}

export default function Header({ month, year, onMonthChange, showMonthPicker = false }) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();

  const handleMonthInput = (e) => {
    const [y, m] = e.target.value.split('-');
    onMonthChange?.(parseInt(m, 10), parseInt(y, 10));
  };

  const monthValue = `${year}-${String(month).padStart(2, '0')}`;

  const initials = (user?.displayName || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-4 lg:px-8 dark:border-slate-700 dark:bg-slate-900/80">
      <div className="lg:hidden">
        <Logo size={28} textClass="text-base" />
      </div>

      {showMonthPicker && (
        <input
          type="month"
          value={monthValue}
          onChange={handleMonthInput}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-600"
        />
      )}

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {initials}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300">{user?.displayName}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
          <LogOutIcon size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
