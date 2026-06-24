import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { getCategories } from '../../api/categories';
import { createTransaction, updateTransaction } from '../../api/transactions';

export default function TransactionForm({ open, onClose, onSuccess, transaction = null }) {
  const isEdit = !!transaction;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  useEffect(() => {
    if (open) {
      if (transaction) {
        setForm({
          type: transaction.type,
          amount: String(transaction.amount),
          categoryId: transaction.categoryId,
          transactionDate: transaction.transactionDate,
          notes: transaction.notes || '',
        });
      } else {
        setForm({
          type: 'expense',
          amount: '',
          categoryId: '',
          transactionDate: new Date().toISOString().slice(0, 10),
          notes: '',
        });
      }
    }
  }, [open, transaction]);

  useEffect(() => {
    if (open) {
      getCategories(form.type).then(setCategories).catch(() => toast.error('Failed to load categories'));
    }
  }, [open, form.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.categoryId) {
      toast.error('Amount and category are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId,
        transactionDate: form.transactionDate,
        notes: form.notes || null,
      };
      if (isEdit) {
        await updateTransaction(transaction.id, payload);
        toast.success('Transaction updated');
      } else {
        await createTransaction(payload);
        toast.success('Transaction added');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Transaction' : 'Add Transaction'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={form.type === 'expense'}
              onChange={() => setForm({ ...form, type: 'expense', categoryId: '' })}
            />
            Expense
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={form.type === 'income'}
              onChange={() => setForm({ ...form, type: 'income', categoryId: '' })}
            />
            Income
          </label>
        </div>
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="0.00"
        />
        <Select
          label="Category"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Date"
          type="date"
          value={form.transactionDate}
          onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
        />
        <Input
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional description"
        />
      </form>
    </Modal>
  );
}
