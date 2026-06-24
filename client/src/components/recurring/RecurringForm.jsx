import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { getCategories } from '../../api/categories';
import { createRecurring, updateRecurring } from '../../api/recurring';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function RecurringForm({ open, onClose, onSuccess, item = null }) {
  const isEdit = !!item;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          type: item.type,
          amount: String(item.amount),
          categoryId: item.categoryId,
          frequency: item.frequency,
          startDate: item.startDate,
          endDate: item.endDate || '',
          notes: item.notes || '',
          isActive: item.isActive,
        });
      } else {
        setForm({
          type: 'expense',
          amount: '',
          categoryId: '',
          frequency: 'monthly',
          startDate: new Date().toISOString().slice(0, 10),
          endDate: '',
          notes: '',
          isActive: true,
        });
      }
    }
  }, [open, item]);

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
        frequency: form.frequency,
        startDate: form.startDate,
        endDate: form.endDate || null,
        notes: form.notes || null,
      };
      if (isEdit) {
        await updateRecurring(item.id, { ...payload, isActive: form.isActive });
        toast.success('Recurring transaction updated');
      } else {
        await createRecurring(payload);
        toast.success('Recurring transaction created');
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
      title={isEdit ? 'Edit Recurring' : 'Add Recurring'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
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
              disabled={isEdit}
            />
            Expense
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={form.type === 'income'}
              onChange={() => setForm({ ...form, type: 'income', categoryId: '' })}
              disabled={isEdit}
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
        />
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
        <Select
          label="Frequency"
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </Select>
        <Input
          label="Start Date"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
        <Input
          label="End Date (optional)"
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
        <Input
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="e.g. Netflix subscription"
        />
        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        )}
      </form>
    </Modal>
  );
}
