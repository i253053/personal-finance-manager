import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import TransactionRow from '../components/transactions/TransactionRow';
import TransactionForm from '../components/transactions/TransactionForm';
import { getTransactions, deleteTransaction } from '../api/transactions';
import { getCategories } from '../api/categories';
import { useDebounce } from '../hooks/useDebounce';

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ data: [], pagination: {} });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    categoryId: searchParams.get('categoryId') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 20,
        sort: 'date_desc',
        ...(filters.type && { type: filters.type }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const result = await getTransactions(params);
      setData(result);

      const sp = new URLSearchParams();
      Object.entries({ ...filters, search: debouncedSearch }).forEach(([k, v]) => {
        if (v) sp.set(k, String(v));
      });
      setSearchParams(sp, { replace: true });
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, setSearchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleDelete = async (txn) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(txn.id);
      toast.success('Transaction deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <Header />
      <main className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Transaction</Button>
        </div>

        <Card className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search notes or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              Filters {showFilters ? '▲' : '▼'}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              <Select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </Select>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              />
            </div>
          )}
        </Card>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : data.data.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Add a transaction or adjust your filters"
              actionLabel="Add Transaction"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <>
              {data.data.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  onEdit={(txn) => { setEditing(txn); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              ))}
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-500 self-center">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page >= data.pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Card>
      </main>

      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSuccess={load}
        transaction={editing}
      />
    </>
  );
}
