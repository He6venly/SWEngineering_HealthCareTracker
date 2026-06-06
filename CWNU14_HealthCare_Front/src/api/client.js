const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);
const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  const apiStatus = data?.status;
  const isApiSuccess = typeof apiStatus === 'number' && apiStatus >= 200 && apiStatus < 300;

  if (!response.ok || !isApiSuccess) {
    const error = new Error(data?.message || 'API request failed.');
    error.httpStatus = response.status;
    error.apiStatus = apiStatus;
    error.errorCode = data?.errorCode;
    error.response = { status: response.status, data };
    throw error;
  }

  return {
    status: response.status,
    data,
  };
}
