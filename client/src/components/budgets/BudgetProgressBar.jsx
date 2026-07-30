import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency, budgetStatusColor, DEFAULT_CURRENCY } from '../../utils/format';
import { WalletIcon, TrendUpIcon, TrendDownIcon, PiggyIcon } from '../ui/icons';

export default function BudgetProgressBar({ budget }) {
  const pct = Math.min(budget.percentUsed, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {budget.category?.icon} {budget.category?.name}
        </span>
        <span className="tabular-nums text-slate-500 dark:text-slate-400">
          {formatCurrency(budget.spent)} <span className="text-slate-400">of</span> {formatCurrency(budget.amount)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${budgetStatusColor(budget.status)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 dark:text-slate-400">{budget.percentUsed}% used</span>
        {budget.status !== 'ok' && (
          <Badge variant={budget.status}>{budget.status === 'over' ? 'Over budget' : 'Nearing limit'}</Badge>
        )}
      </div>
    </div>
  );
}

const summaryConfig = [
  {
    key: 'balance',
    label: 'Total balance',
    sub: 'All time',
    icon: WalletIcon,
    iconClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    valueClass: 'text-slate-900 dark:text-white',
  },
  {
    key: 'monthlyIncome',
    label: 'Income',
    sub: 'This month',
    icon: TrendUpIcon,
    iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    valueClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'monthlyExpenses',
    label: 'Expenses',
    sub: 'This month',
    icon: TrendDownIcon,
    iconClass: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    valueClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'netSavings',
    label: 'Net savings',
    sub: 'This month',
    icon: PiggyIcon,
    iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    valueClass: 'text-indigo-600 dark:text-indigo-400',
  },
];

export function SummaryCards({ summary, currency = DEFAULT_CURRENCY }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {summaryConfig.map(({ key, label, sub, icon: Ico, iconClass, valueClass }) => (
        <Card key={key} className="flex items-start gap-4">
          <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            <Ico size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-xl xl:text-2xl font-bold tabular-nums mt-0.5 truncate ${valueClass}`}>
              {formatCurrency(summary[key], currency)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
