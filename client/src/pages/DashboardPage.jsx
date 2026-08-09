import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusIcon, CheckCircleIcon, ArrowRightIcon } from '../components/ui/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import BudgetProgressBar, { SummaryCards } from '../components/budgets/BudgetProgressBar';
import { TransactionListCompact } from '../components/transactions/TransactionRow';
import { MiniTrendChart } from '../components/reports/Charts';
import TransactionForm from '../components/transactions/TransactionForm';
import { formatCurrency, formatMonthYear, getCurrentMonthYear } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { getSummary, getTrends } from '../api/reports';
import { getBudgets } from '../api/budgets';
import { getGoals } from '../api/goals';
import { getRecentTransactions } from '../api/transactions';

export default function DashboardPage() {
  const { user } = useAuth();
  const { month, year } = getCurrentMonthYear();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, trendsData, budgetsData, goalsData, recentData] = await Promise.all([
        getSummary(month, year),
        getTrends(6),
        getBudgets(month, year),
        getGoals(),
        getRecentTransactions(5),
      ]);
      setSummary(summaryData);
      setTrends(trendsData.data || trendsData);
      setBudgets(budgetsData);
      setGoals(goalsData);
      setRecent(recentData);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const alertBudgets = budgets.filter((b) => b.status !== 'ok');
  const activeGoals = goals.filter((g) => !g.isComplete).slice(0, 2);

  if (loading) {
    return (
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="flex justify-center py-20"><Spinner className="h-10 w-10" /></div>
      </main>
    );
  }

  return (
    <>
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Here’s your overview for {formatMonthYear(month, year)}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-1.5">
            <PlusIcon size={16} />Add transaction
          </Button>
        </div>

        {summary && <SummaryCards summary={summary} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <MiniTrendChart data={trends} />

          <Card>
            <h3 className="font-semibold mb-4">Budget alerts</h3>
            {alertBudgets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircleIcon size={26} className="text-emerald-500" />
                <p className="text-sm text-slate-500">All budgets are on track this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertBudgets.map((b) => (
                  <BudgetProgressBar key={b.id} budget={b} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-4">
          <h3 className="font-semibold mb-4">Recent activity</h3>
          <TransactionListCompact transactions={recent} />
        </Card>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Savings goals</h3>
            <Link
              to="/goals"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
              <ArrowRightIcon size={14} />
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500 text-center py-4">No active goals yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeGoals.map((g) => (
                <Card key={g.id}>
                  <p className="font-medium">{g.name}</p>
                  {g.targetDate && (
                    <p className="text-xs text-slate-400 mb-2">Target: {g.targetDate}</p>
                  )}
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="tabular-nums text-slate-500 dark:text-slate-400">
                      {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {g.percentComplete}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(g.percentComplete, 100)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => { setShowForm(false); load(); }}
      />
    </>
  );
}
