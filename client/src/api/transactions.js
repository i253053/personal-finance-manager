import api from './client.js';

export async function getTransactions(params) {
  const res = await api.get('/transactions', { params });
  return res.data;
}

export async function getRecentTransactions(limit = 10) {
  const res = await api.get('/transactions/recent', { params: { limit } });
  return res.data;
}

export async function createTransaction(data) {
  const res = await api.post('/transactions', data);
  return res.data;
}

export async function updateTransaction(id, data) {
  const res = await api.patch(`/transactions/${id}`, data);
  return res.data;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`);
}
