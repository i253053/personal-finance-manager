import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Tokens live in localStorage ("keep me signed in") or sessionStorage
// (cleared when the browser closes). Whichever store has a token wins on load.
let store = localStorage.getItem('accessToken')
  ? localStorage
  : sessionStorage.getItem('accessToken')
    ? sessionStorage
    : localStorage;

let accessToken = store.getItem('accessToken') || null;
let refreshToken = store.getItem('refreshToken') || null;
let onAuthFailure = null;

export function setTokenPersistence(remember) {
  const next = remember ? localStorage : sessionStorage;
  if (next !== store) {
    store.removeItem('accessToken');
    store.removeItem('refreshToken');
    store = next;
  }
}

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (access) store.setItem('accessToken', access);
  else store.removeItem('accessToken');
  if (refresh) store.setItem('refreshToken', refresh);
  else store.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  accessToken = null;
  refreshToken = null;
}

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        }
        const { data } = await refreshing;
        refreshing = null;
        setTokens(data.accessToken, refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        refreshing = null;
        clearTokens();
        onAuthFailure?.();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
