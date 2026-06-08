import { apiRequest } from './client.js';

export async function generateAiFeedback(targetDate, userPrompt) {
  const response = await apiRequest('/api/v1/ai/feedback', {
    method: 'POST',
    body: JSON.stringify({ targetDate, userPrompt }),
  });

  return response.data.data;
}

export async function getAiFeedbackHistory() {
  const response = await apiRequest('/api/v1/ai/feedback/history');

  return response.data.data;
}
