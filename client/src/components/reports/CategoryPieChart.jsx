import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';

export default function CategoryPieChart({ data, grandTotal }) {
  if (!data?.length) {
    return (
      <Card>
        <p className="text-sm text-slate-500 text-center py-8">No expense data for this period</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-slate-500 mt-2">
        Total: {formatCurrency(grandTotal)}
      </p>
    </Card>
  );
}

export function TopCategoriesList({ data }) {
  return (
    <Card>
      <h3 className="font-semibold mb-4">Top Categories</h3>
      <div className="space-y-3">
        {data.map((cat, i) => (
          <div key={cat.categoryId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 w-5">{i + 1}.</span>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
              <span className="text-xs text-slate-400 ml-2">{cat.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
