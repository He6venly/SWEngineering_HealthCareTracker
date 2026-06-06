import { apiRequest } from './client.js';

export async function getProfile() {
  const response = await apiRequest('/api/v1/profile');

  return response.data.data;
}

export async function updateProfile({ height, weight, targetCalories, targetWeight }) {
  const response = await apiRequest('/api/v1/profile', {
    method: 'PUT',
    body: JSON.stringify({
      height,
      weight,
      targetCalories,
      targetWeight,
    }),
  });

  return response.data.data;
}
