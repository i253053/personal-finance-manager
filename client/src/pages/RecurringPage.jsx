import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import RecurringForm from '../components/recurring/RecurringForm';
import {
  getRecurring,
  deleteRecurring,
  processRecurring,
  updateRecurring,
} from '../api/recurring';
import { formatCurrency, formatDate } from '../utils/format';

const FREQ_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function RecurringPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecurring();
      setItems(data);
    } catch {
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const result = await processRecurring();
      if (result.processed > 0) {
        toast.success(`Created ${result.processed} transaction(s)`);
      } else {
        toast.success('No due recurring transactions');
      }
      load();
    } catch {
      toast.error('Failed to process recurring transactions');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await updateRecurring(item.id, { isActive: !item.isActive });
      toast.success(item.isActive ? 'Paused' : 'Resumed');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete recurring "${item.notes || item.category?.name}"?`)) return;
    try {
      await deleteRecurring(item.id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <Header />
      <main className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Recurring Transactions</h1>
            <p className="text-slate-500">Automate income and expenses on a schedule</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleProcess} disabled={processing}>
              {processing ? 'Processing...' : 'Run Due Now'}
            </Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              + Add Recurring
            </Button>
          </div>
        </div>

        <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Due recurring transactions are processed automatically when you open the dashboard.
            Use &quot;Run Due Now&quot; to process them immediately.
          </p>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No recurring transactions"
            description="Set up subscriptions, salary, or other repeating entries"
            actionLabel="Add Recurring"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className={!item.isActive ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg shrink-0"
                      style={{ backgroundColor: (item.category?.color || '#3B82F6') + '22' }}
                    >
                      {item.category?.icon || '🔄'}
                    </span>
                    <div>
                      <p className="font-medium">
                        {item.category?.name}
                        {!item.isActive && <Badge className="ml-2">Paused</Badge>}
                      </p>
                      <p className="text-sm text-slate-500">
                        {FREQ_LABELS[item.frequency]} · Next: {formatDate(item.nextDate)}
                      </p>
                      {item.notes && <p className="text-sm text-slate-400 mt-0.5">{item.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-semibold tabular-nums ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => handleToggle(item)}
                        className="text-xs text-slate-600 hover:underline"
                      >
                        {item.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => { setEditing(item); setShowForm(true); }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <RecurringForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSuccess={load}
        item={editing}
      />
    </>
  );
}
