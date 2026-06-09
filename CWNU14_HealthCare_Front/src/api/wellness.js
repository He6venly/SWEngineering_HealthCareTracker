import { apiRequest } from './client.js';

export async function updateHydrationTarget({ recordDate, targetMl }) {
  const response = await apiRequest('/api/v1/wellness/hydration/target', {
    method: 'PATCH',
    body: JSON.stringify({ recordDate, targetMl }),
  });

  return response.data.data;
}

export async function addHydrationIntake({ recordDate, amountMl }) {
  const response = await apiRequest('/api/v1/wellness/hydration/intake', {
    method: 'POST',
    body: JSON.stringify({ recordDate, amountMl }),
  });

  return response.data.data;
}

export async function saveSleepRecord({ recordDate, sleepStartTime, wakeTime }) {
  const response = await apiRequest('/api/v1/wellness/sleep', {
    method: 'PUT',
    body: JSON.stringify({ recordDate, sleepStartTime, wakeTime }),
  });

  return response.data.data;
}
