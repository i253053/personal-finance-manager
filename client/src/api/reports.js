import api from './client.js';

export async function getSummary(month, year) {
  const res = await api.get('/reports/summary', { params: { month, year } });
  return res.data;
}

export async function getTrends(months = 6) {
  const res = await api.get('/reports/trends', { params: { months } });
  return res.data;
}

export async function getCategoryReport(startDate, endDate) {
  const res = await api.get('/reports/categories', { params: { startDate, endDate } });
  return res.data;
}

export async function exportCsv(startDate, endDate) {
  const res = await api.get('/reports/export', {
    params: { startDate, endDate },
    responseType: 'blob',
  });
  return res.data;
}
