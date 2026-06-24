import api from './client.js';

export async function getBudgets(month, year) {
  const res = await api.get('/budgets', { params: { month, year } });
  return res.data.data;
}

export async function createBudget(data) {
  const res = await api.post('/budgets', data);
  return res.data;
}

export async function updateBudget(id, data) {
  const res = await api.patch(`/budgets/${id}`, data);
  return res.data;
}

export async function deleteBudget(id) {
  await api.delete(`/budgets/${id}`);
}

export async function copyBudgets(data) {
  const res = await api.post('/budgets/copy', data);
  return res.data.data;
}
