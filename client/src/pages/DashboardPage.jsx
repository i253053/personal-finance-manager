import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon } from '../components/ui/icons';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import GoalCard, { GoalsSummary } from '../components/goals/GoalCard';
import {
  getGoals,
  createGoal,
  updateGoal,
  contributeToGoal,
  deleteGoal,
} from '../api/goals';

const emptyForm = { name: '', targetAmount: '', currentAmount: '0', targetDate: '' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showContribute, setShowContribute] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [contribAmount, setContribAmount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.targetAmount) {
      toast.error('Name and target amount are required');
      return;
    }
    try {
      const payload = {
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        targetDate: form.targetDate || null,
      };
      if (editing) {
        await updateGoal(editing.id, payload);
        toast.success('Goal updated');
      } else {
        await createGoal(payload);
        toast.success('Goal created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    }
  };

  const handleContribute = async () => {
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await contributeToGoal(showContribute.id, amount);
      toast.success(`Added ${amount} to ${showContribute.name}`);
      setShowContribute(null);
      setContribAmount('');
      load();
    } catch {
      toast.error('Failed to contribute');
    }
  };

  const handleDelete = async (goal) => {
    if (!confirm(`Delete "${goal.name}"?`)) return;
    try {
      await deleteGoal(goal.id);
      toast.success('Goal deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <main className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Savings goals</h1>
            <p className="text-slate-500">Track progress toward your financial targets</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5"><PlusIcon size={16} />Add goal</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : goals.length === 0 ? (
          <EmptyState
            title="No savings goals yet"
            description="Set a target and track your progress"
            actionLabel="Create goal"
            onAction={openCreate}
          />
        ) : (
          <>
            <GoalsSummary goals={goals} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onContribute={(g) => setShowContribute(g)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Goal' : 'Add Goal'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Goal Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Emergency Fund"
          />
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
          />
          <Input
            label="Current Amount"
            type="number"
            step="0.01"
            min="0"
            value={form.currentAmount}
            onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
          />
          <Input
            label="Target Date (optional)"
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={!!showContribute}
        onClose={() => setShowContribute(null)}
        title={`Contribute to ${showContribute?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowContribute(null)}>Cancel</Button>
            <Button onClick={handleContribute}>Add contribution</Button>
          </>
        }
      >
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          value={contribAmount}
          onChange={(e) => setContribAmount(e.target.value)}
          placeholder="0.00"
        />
      </Modal>
    </>
  );
}
