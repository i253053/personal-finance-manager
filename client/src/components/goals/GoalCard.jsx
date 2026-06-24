import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

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
        {goal.isComplete && <Badge variant="ok">Complete!</Badge>}
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

      <div className="flex gap-2">
        {!goal.isComplete && onContribute && (
          <button
            onClick={() => onContribute(goal)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Contribute
          </button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(goal)} className="text-sm text-slate-600 hover:underline">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(goal)} className="text-sm text-red-600 hover:underline">
            Delete
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
        <p className="text-sm text-slate-500">Active Goals</p>
        <p className="text-2xl font-bold">{active.length}</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-500">Total Saved</p>
        <p className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(totalSaved)}</p>
      </Card>
    </div>
  );
}
