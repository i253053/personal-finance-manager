import { NavLink } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Header({ month, year, onMonthChange, showMonthPicker = false }) {
  const { user, logout } = useAuth();

  const handleMonthInput = (e) => {
    const [y, m] = e.target.value.split('-');
    onMonthChange?.(parseInt(m, 10), parseInt(y, 10));
  };

  const monthValue = `${year}-${String(month).padStart(2, '0')}`;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-4 lg:px-8 dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex items-center gap-3 lg:hidden">
        <span className="text-xl">💰</span>
        <span className="font-bold">FinanceApp</span>
      </div>

      {showMonthPicker && (
        <input
          type="month"
          value={monthValue}
          onChange={handleMonthInput}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-600"
        />
      )}

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Toggle dark mode"
        >
          🌙
        </button>
        <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-300">
          {user?.displayName}
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
