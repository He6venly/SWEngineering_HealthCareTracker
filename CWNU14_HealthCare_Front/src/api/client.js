const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);
const ACCESS_TOKEN_KEY = 'accessToken';

function formatErrorMessage(message) {
  if (!message) {
    return '요청 처리 중 오류가 발생했습니다.';
  }

  return message.replace(/(^|,\s*)[A-Za-z][A-Za-z0-9]*:\s*/g, '$1');
}

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
  const method = options.method?.toUpperCase() ?? 'GET';
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: method === 'GET' ? 'no-store' : options.cache,
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
    const error = new Error(formatErrorMessage(data?.message));
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
