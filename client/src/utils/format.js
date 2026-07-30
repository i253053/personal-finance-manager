export const DEFAULT_CURRENCY = 'PKR';

export function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact form for chart axes: Rs 5K, Rs 1.2M
export function formatCompactCurrency(amount, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMonthYear(month, year) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function budgetStatusColor(status) {
  if (status === 'over') return 'bg-rose-500';
  if (status === 'warning') return 'bg-amber-500';
  return 'bg-blue-500';
}

export function monthStartEnd(month, year) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}
