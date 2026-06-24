import api from './client.js';

export async function getRecurring() {
  const res = await api.get('/recurring');
  return res.data.data;
}

export async function createRecurring(data) {
  const res = await api.post('/recurring', data);
  return res.data;
}

export async function updateRecurring(id, data) {
  const res = await api.patch(`/recurring/${id}`, data);
  return res.data;
}

export async function deleteRecurring(id) {
  await api.delete(`/recurring/${id}`);
}

export async function processRecurring() {
  const res = await api.post('/recurring/process');
  return res.data;
}
