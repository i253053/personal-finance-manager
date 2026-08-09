import { NavLink } from 'react-router-dom';
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
  { to: '/', label: 'Home', icon: DashboardIcon },
  { to: '/transactions', label: 'Activity', icon: TransactionsIcon },
  { to: '/recurring', label: 'Repeat', icon: RecurringIcon },
  { to: '/budgets', label: 'Budgets', icon: BudgetsIcon },
  { to: '/reports', label: 'Reports', icon: ReportsIcon },
  { to: '/goals', label: 'Goals', icon: GoalsIcon },
  { to: '/categories', label: 'Tags', icon: CategoriesIcon },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="flex justify-around py-2">
        {links.map(({ to, label, icon: Ico }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[11px] px-2 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Ico size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
