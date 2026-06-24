import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import { budgetStatusColor } from '../../utils/format';
import Badge from '../ui/Badge';

export default function BudgetProgressBar({ budget }) {
  const pct = Math.min(budget.percentUsed, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {budget.category?.icon} {budget.category?.name}
        </span>
        <span className="tabular-nums text-slate-500">
          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${budgetStatusColor(budget.status)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{budget.percentUsed}% used</span>
        {budget.status !== 'ok' && (
          <Badge variant={budget.status}>{budget.status === 'over' ? 'Over budget' : 'Warning'}</Badge>
        )}
      </div>
    </div>
  );
}

export function SummaryCards({ summary, currency = 'USD' }) {
  const cards = [
    { label: 'Balance', value: summary.balance, sub: 'all time', color: 'text-slate-900 dark:text-white' },
    { label: 'Income', value: summary.monthlyIncome, sub: 'this month', color: 'text-emerald-600' },
    { label: 'Expenses', value: summary.monthlyExpenses, sub: 'this month', color: 'text-rose-600' },
    { label: 'Net Savings', value: summary.netSavings, sub: 'this month', color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className={`text-2xl font-bold tabular-nums mt-1 ${card.color}`}>
            {formatCurrency(card.value, currency)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
        </Card>
      ))}
    </div>
  );
}
