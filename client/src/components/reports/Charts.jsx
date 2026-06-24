import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';

export default function IncomeExpenseChart({ data }) {
  if (!data?.length) {
    return (
      <Card>
        <p className="text-sm text-slate-500 text-center py-8">Not enough data to chart</p>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: d.month,
    Income: d.income,
    Expenses: d.expenses,
  }));

  return (
    <Card>
      <h3 className="font-semibold mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
          <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function MiniTrendChart({ data }) {
  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    name: d.month.slice(5),
    Expenses: d.expenses,
  }));

  return (
    <Card>
      <h3 className="font-semibold mb-4">Spending Trend (6 mo)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Bar dataKey="Expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
