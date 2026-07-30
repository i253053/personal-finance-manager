import { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { SummaryCards } from '../components/budgets/BudgetProgressBar';
import BudgetProgressBar from '../components/budgets/BudgetProgressBar';
import { TransactionListCompact } from '../components/transactions/TransactionRow';
import { MiniTrendChart } from '../components/reports/Charts';
import GoalCard from '../components/goals/GoalCard';
import TransactionForm from '../components/transactions/TransactionForm';
import { Link } from 'react-router-dom';
import { getSummary, getTrends } from '../api/reports';
import { getRecentTransactions } from '../api/transactions';
import { getBudgets } from '../api/budgets';
import { getGoals } from '../api/goals';
import { processRecurring } from '../api/recurring';
import { getCurrentMonthYear, formatMonthYear } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CheckCircleIcon, ArrowRightIcon } from '../components/ui/icons';

export default function DashboardPage() {
  const { user } = useAuth();
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [trends, setTrends] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await processRecurring();
      const [summaryData, recentData, budgetData, trendData, goalsData] = await Promise.all([
        getSummary(month, year),
        getRecentTransactions(8),
        getBudgets(month, year),
        getTrends(6),
        getGoals(),
      ]);
      setSummary(summaryData);
      setRecent(recentData);
      setBudgets(budgetData);
      setTrends(trendData.data);
      setGoals(goalsData.filter((g) => !g.isComplete).slice(0, 3));
    } catch {
      // errors handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const alertBudgets = budgets.filter((b) => b.status !== 'ok');

  return (
    <>
      <Header
        month={month}
        year={year}
        onMonthChange={(m, y) => setMonthYear({ month: m, year: y })}
        showMonthPicker
      />
      <main className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Here’s your overview for {formatMonthYear(month, year)}</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-1.5"><PlusIcon size={16} />Add transaction</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {summary && <SummaryCards summary={summary} currency={user?.currency} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card>
              <h3 className="font-semibold mb-4">Recent activity</h3>
              <TransactionListCompact transactions={recent} />
            </Card>

            {goals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Savings goals</h3>
                  <Link to="/goals" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    View all
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} onSuccess={load} />
    </>
  );
}
