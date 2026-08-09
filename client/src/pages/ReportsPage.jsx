import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import IncomeExpenseChart from '../components/reports/Charts';
import CategoryPieChart, { TopCategoriesList } from '../components/reports/CategoryPieChart';
import { getTrends, getCategoryReport, exportCsv } from '../api/reports';
import { getCurrentMonthYear, monthStartEnd } from '../utils/format';

export default function ReportsPage() {
  const { month, year } = getCurrentMonthYear();
  const defaultRange = monthStartEnd(month, year);

  const [months, setMonths] = useState(6);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [trends, setTrends] = useState([]);
  const [categoryData, setCategoryData] = useState({ data: [], grandTotal: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [trendRes, catRes] = await Promise.all([
        getTrends(months),
        getCategoryReport(startDate, endDate),
      ]);
      setTrends(trendRes.data);
      setCategoryData(catRes);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [months, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    try {
      const blob = await exportCsv(startDate, endDate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${startDate}-${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const setPreset = (m) => {
    setMonths(m);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  };

  return (
    <>
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <Button variant="secondary" onClick={handleExport}>Export CSV</Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={months} onChange={(e) => setPreset(parseInt(e.target.value, 10))}>
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </Select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button variant="secondary" onClick={load}>Apply</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="space-y-6">
            <IncomeExpenseChart data={trends} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart data={categoryData.data} grandTotal={categoryData.grandTotal} />
              <TopCategoriesList data={categoryData.data} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
