import api from './client.js';

export async function getGoals() {
  const res = await api.get('/goals');
  return res.data.data;
}

export async function createGoal(data) {
  const res = await api.post('/goals', data);
  return res.data;
}

export async function updateGoal(id, data) {
  const res = await api.patch(`/goals/${id}`, data);
  return res.data;
}

export async function contributeToGoal(id, amount) {
  const res = await api.post(`/goals/${id}/contribute`, { amount });
  return res.data;
}

export async function deleteGoal(id) {
  await api.delete(`/goals/${id}`);
}
