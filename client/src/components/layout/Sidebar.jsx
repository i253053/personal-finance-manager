import { NavLink } from 'react-router-dom';
import Logo from '../brand/Logo';
import {
  DashboardIcon,
  TransactionsIcon,
  RecurringIcon,
  BudgetsIcon,
  ReportsIcon,
  GoalsIcon,
  CategoriesIcon,
} from '../ui/icons';

const links = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/transactions', label: 'Transactions', icon: TransactionsIcon },
  { to: '/recurring', label: 'Recurring', icon: RecurringIcon },
  { to: '/budgets', label: 'Budgets', icon: BudgetsIcon },
  { to: '/reports', label: 'Reports', icon: ReportsIcon },
  { to: '/goals', label: 'Goals', icon: GoalsIcon },
  { to: '/categories', label: 'Categories', icon: CategoriesIcon },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-700">
        <Logo size={30} textClass="text-lg" />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Ico }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`
            }
          >
            <Ico size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
