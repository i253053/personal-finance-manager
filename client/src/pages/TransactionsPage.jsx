import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../components/ui/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import TransactionRow from '../components/transactions/TransactionRow';
import TransactionForm from '../components/transactions/TransactionForm';
import { getTransactions, deleteTransaction } from '../api/transactions';
import { getCategories } from '../api/categories';
import { useDebounce } from '../hooks/useDebounce';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ type: '', categoryId: '' });

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      const res = await getTransactions(params);
      setTransactions(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setShowForm(true);
  };

  const handleDelete = async (t) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(t.id);
      toast.success('Transaction deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <main className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-slate-500 dark:text-slate-400">All your income and expenses</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <PlusIcon size={16} />Add transaction
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search by note or amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
          </div>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
            Filters
            {showFilters ? <ChevronUpIcon size={15} /> : <ChevronDownIcon size={15} />}
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Type"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              <Select
                label="Category"
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Add your first transaction or adjust your filters"
              actionLabel="Add transaction"
              onAction={openCreate}
            />
          ) : (
            <div>
              {transactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeftIcon size={15} />
              Previous
            </Button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronRightIcon size={15} />
            </Button>
          </div>
        )}
      </main>

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => { setShowForm(false); load(); }}
        transaction={editing}
      />
    </>
  );
}
