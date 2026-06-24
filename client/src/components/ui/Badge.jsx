const colors = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  over: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant] || colors.default} ${className}`}
    >
      {children}
    </span>
  );
}
