import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/format';
import { PencilIcon, TrashIcon, ArrowRightIcon } from '../ui/icons';

export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income';
  const cat = transaction.category;

  return (
    <div className="group flex items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-base shrink-0"
          style={{ backgroundColor: (cat?.color || '#64748B') + '1f', color: cat?.color }}
        >
          {cat?.icon || '•'}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate text-slate-900 dark:text-slate-100">
            {transaction.notes || cat?.name || 'Transaction'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {cat?.name || 'Uncategorized'} · {formatDate(transaction.transactionDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <p
          className={`font-semibold tabular-nums text-sm ${
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
        </p>
        {onEdit && (
          <div className="flex opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-2">
            <button
              onClick={() => onEdit(transaction)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              title="Edit"
              aria-label="Edit transaction"
            >
              <PencilIcon size={15} />
            </button>
            <button
              onClick={() => onDelete(transaction)}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
              title="Delete"
              aria-label="Delete transaction"
            >
              <TrashIcon size={15} />
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
      <Link
        to="/transactions"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        View all transactions
        <ArrowRightIcon size={14} />
      </Link>
    </div>
  );
}
