import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import BudgetProgressBar from '../components/budgets/BudgetProgressBar';
import { getBudgets, createBudget, updateBudget, deleteBudget, copyBudgets } from '../api/budgets';
import { getCategories } from '../api/categories';
import { getCurrentMonthYear, formatCurrency, formatMonthYear } from '../utils/format';
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/ui/icons';

export default function BudgetsPage() {
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ categoryId: '', amount: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetData, catData] = await Promise.all([
        getBudgets(month, year),
        getCategories('expense'),
      ]);
      setBudgets(budgetData);
      setCategories(catData);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const shiftMonth = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    setMonthYear({ month: d.getMonth() + 1, year: d.getFullYear() });
  };

  const handleCopy = async () => {
    const prev = new Date(year, month - 2, 1);
    try {
      const created = await copyBudgets({
        fromMonth: prev.getMonth() + 1,
        fromYear: prev.getFullYear(),
        toMonth: month,
        toYear: year,
      });
      toast.success(`Copied ${created.length} budgets`);
      load();
    } catch {
      toast.error('Failed to copy budgets');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ categoryId: '', amount: '' });
    setShowForm(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    setForm({ categoryId: budget.categoryId, amount: String(budget.amount) });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.categoryId || !form.amount) {
      toast.error('Category and amount required');
      return;
    }
    try {
      if (editing) {
        await updateBudget(editing.id, { amount: parseFloat(form.amount) });
        toast.success('Budget updated');
      } else {
        await createBudget({
          categoryId: form.categoryId,
          month,
          year,
          amount: parseFloat(form.amount),
        });
        toast.success('Budget created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
      toast.success('Budget deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const handleMonthInput = (e) => {
    const [y, m] = e.target.value.split('-');
    setMonthYear({ month: parseInt(m, 10), year: parseInt(y, 10) });
  };

  return (
    <>
      <main className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Budgets</h1>
            <p className="text-slate-500">{formatMonthYear(month, year)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => shiftMonth(-1)} className="gap-1" aria-label="Previous month"><ChevronLeftIcon size={14} />Prev</Button>
            <input
              type="month"
              value={`${year}-${String(month).padStart(2, '0')}`}
              onChange={handleMonthInput}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:bg-slate-800 dark:border-slate-600"
            />
            <Button variant="secondary" size="sm" onClick={() => shiftMonth(1)} className="gap-1" aria-label="Next month">Next<ChevronRightIcon size={14} /></Button>
            <Button variant="secondary" size="sm" onClick={handleCopy}>Copy last month</Button>
            <Button onClick={openCreate} className="gap-1.5"><PlusIcon size={16} />Add budget</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Budgeted</p>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(totalBudgeted)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Spent</p>
            <p className="text-xl font-bold tabular-nums text-rose-600">{formatCurrency(totalSpent)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
            <p className="text-xl font-bold tabular-nums text-emerald-600">
              {formatCurrency(totalBudgeted - totalSpent)}
            </p>
          </Card>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : budgets.length === 0 ? (
            <EmptyState
              title="No budgets for this month"
              description="Set spending limits per category"
              actionLabel="Add budget"
              onAction={openCreate}
            />
          ) : (
            <div className="space-y-6">
              {budgets.map((b) => (
                <div key={b.id} className="flex items-start gap-4">
                  <div className="flex-1">
                    <BudgetProgressBar budget={b} />
                  </div>
                  <div className="flex shrink-0">
                    <button
                      onClick={() => openEdit(b)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      title="Edit budget"
                      aria-label="Edit budget"
                    >
                      <PencilIcon size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                      title="Delete budget"
                      aria-label="Delete budget"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit budget' : 'Add budget'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </Select>
          )}
          <Input
            label="Monthly Limit"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
      </Modal>
    </>
  );
}
