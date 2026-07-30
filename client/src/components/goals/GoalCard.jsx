import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';
import { PlusIcon, PencilIcon, TrashIcon } from '../ui/icons';

export default function GoalCard({ goal, onContribute, onEdit, onDelete }) {
  const pct = Math.min(goal.percentComplete, 100);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold">{goal.name}</h3>
          {goal.targetDate && (
            <p className="text-xs text-slate-500 mt-0.5">Target: {formatDate(goal.targetDate)}</p>
          )}
        </div>
        {goal.isComplete && <Badge variant="ok">Completed</Badge>}
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span className="tabular-nums font-medium">
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </span>
        <span className="text-slate-500">{goal.percentComplete}%</span>
      </div>

      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${
            goal.isComplete ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-1">
        {!goal.isComplete && onContribute && (
          <button
            onClick={() => onContribute(goal)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <PlusIcon size={13} />
            Contribute
          </button>
        )}
        <span className="flex-1" />
        {onEdit && (
          <button
            onClick={() => onEdit(goal)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            title="Edit goal"
            aria-label="Edit goal"
          >
            <PencilIcon size={15} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(goal)}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
            title="Delete goal"
            aria-label="Delete goal"
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>
    </Card>
  );
}

export function GoalsSummary({ goals }) {
  if (!goals?.length) return null;

  const active = goals.filter((g) => !g.isComplete);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Card>
        <p className="text-sm text-slate-500">Active goals</p>
        <p className="text-2xl font-bold">{active.length}</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-500">Total saved</p>
        <p className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(totalSaved)}</p>
      </Card>
    </div>
  );
}
