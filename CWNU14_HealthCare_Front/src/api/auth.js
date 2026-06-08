import { apiRequest, setAccessToken } from './client.js';

export async function signup({ email, password, nickname, dataConsentAgreed }) {
  const response = await apiRequest('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      nickname,
      dataConsentAgreed,
    }),
  });

  return response.data.data;
}

export async function login({ email, password }) {
  const response = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const authData = response.data.data;

  if (authData?.accessToken) {
    setAccessToken(authData.accessToken);
  }

  return authData;
}

export async function getCurrentUser() {
  const response = await apiRequest('/api/v1/users/me');

  return response.data.data;
}

export async function updateCurrentUser({ nickname }) {
  const response = await apiRequest('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });

  return response.data.data;
}
