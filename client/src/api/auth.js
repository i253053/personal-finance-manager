import api, { setTokens, getRefreshToken } from './client.js';

export async function register(data) {
  const res = await api.post('/auth/register', data);
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data;
}

export async function login(data) {
  const res = await api.post('/auth/login', data);
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // ignore
  }
}

export async function getMe() {
  const res = await api.get('/users/me');
  return res.data;
}
