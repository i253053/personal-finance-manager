import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/ui/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const COLORS = ['#3B82F6', '#F97316', '#22C55E', '#EC4899', '#8B5CF6', '#EAB308', '#06B6D4', '#EF4444'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', color: COLORS[0], icon: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', type: 'expense', color: COLORS[0], icon: '' });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    if (cat.isDefault) {
      toast.error('Default categories cannot be edited');
      return;
    }
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload = { ...form, icon: form.icon || null };
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.success('Category updated');
      } else {
        await createCategory(payload);
        toast.success('Category created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    }
  };

  const handleDelete = async (cat) => {
    if (cat.isDefault) {
      toast.error('Default categories cannot be deleted');
      return;
    }
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      const msg = err.response?.data?.error?.message;
      if (err.response?.data?.error?.code === 'HAS_TRANSACTIONS') {
        toast.error('Category has transactions. Reassign them first.');
      } else {
        toast.error(msg || 'Failed to delete');
      }
    }
  };

  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');

  const CategoryGroup = ({ title, items }) => (
    <Card className="mb-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {items.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.icon}</span>
              <span className="font-medium">{cat.name}</span>
              {cat.isDefault && <Badge variant="default">Default</Badge>}
            </div>
            <div className="flex gap-2">
              {!cat.isDefault && (
                <>
                  <button
                    onClick={() => openEdit(cat)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    title="Edit category"
                    aria-label="Edit category"
                  >
                    <PencilIcon size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                    title="Delete category"
                    aria-label="Delete category"
                  >
                    <TrashIcon size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <>
      <Header />
      <main className="p-4 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Button onClick={openCreate} className="gap-1.5"><PlusIcon size={16} />Add category</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <>
            <CategoryGroup title="Expense categories" items={expenseCats} />
            <CategoryGroup title="Income categories" items={incomeCats} />
          </>
        )}
      </main>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
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
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          )}
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Icon (emoji)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="e.g. ☕"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    form.color === c ? 'border-slate-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
