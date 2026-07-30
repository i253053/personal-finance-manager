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
import { formatCurrency, formatCompactCurrency } from '../../utils/format';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.25)',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
  fontSize: 13,
};

export default function IncomeExpenseChart({ data }) {
  if (!data?.length) {
    return (
      <Card>
        <p className="text-sm text-slate-500 text-center py-8">Not enough data to chart yet</p>
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
      <h3 className="font-semibold mb-4">Income vs expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatCompactCurrency(v)}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
          <Legend iconType="circle" iconSize={9} />
          <Bar dataKey="Income" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={36} />
          <Bar dataKey="Expenses" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={36} />
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
      <h3 className="font-semibold mb-4">Spending trend <span className="font-normal text-sm text-slate-400">· last 6 months</span></h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => formatCompactCurrency(v)}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
          <Bar dataKey="Expenses" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
