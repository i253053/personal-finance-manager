import api from './client.js';

export async function getCategories(type) {
  const res = await api.get('/categories', { params: type ? { type } : {} });
  return res.data;
}

export async function createCategory(data) {
  const res = await api.post('/categories', data);
  return res.data;
}

export async function updateCategory(id, data) {
  const res = await api.patch(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id, reassignTo) {
  await api.delete(`/categories/${id}`, { params: reassignTo ? { reassignTo } : {} });
}
