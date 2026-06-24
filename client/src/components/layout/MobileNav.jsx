import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/transactions', label: 'Txns', icon: '💳' },
  { to: '/recurring', label: 'Repeat', icon: '🔄' },
  { to: '/budgets', label: 'Budget', icon: '📊' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/categories', label: 'Cats', icon: '📁' },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="flex justify-around py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs px-2 ${
                isActive ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
