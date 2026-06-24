import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';

export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income';
  const cat = transaction.category;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg shrink-0"
          style={{ backgroundColor: cat?.color + '22' }}
        >
          {cat?.icon || '💰'}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate">{cat?.name || 'Unknown'}</p>
          <p className="text-sm text-slate-500 truncate">{transaction.notes || formatDate(transaction.transactionDate)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className={`font-semibold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-slate-400">{formatDate(transaction.transactionDate)}</p>
        </div>
        {onEdit && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(transaction)} className="text-sm text-blue-600 hover:underline">
              Edit
            </button>
            <button onClick={() => onDelete(transaction)} className="text-sm text-red-600 hover:underline">
              Del
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TransactionListCompact({ transactions }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-500 py-4 text-center">No transactions yet</p>;
  }
  return (
    <div>
      {transactions.map((t) => (
        <TransactionRow key={t.id} transaction={t} />
      ))}
      <Link to="/transactions" className="block text-center text-sm text-blue-600 mt-3 hover:underline">
        View all transactions →
      </Link>
    </div>
  );
}
