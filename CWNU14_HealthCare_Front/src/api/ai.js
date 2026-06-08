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

export async function createAiConversation({ targetDate, title }) {
  const response = await apiRequest('/api/v1/ai/conversations', {
    method: 'POST',
    body: JSON.stringify({ targetDate, title }),
  });

  return response.data.data;
}

export async function getAiConversations() {
  const response = await apiRequest('/api/v1/ai/conversations');

  return response.data.data;
}

export async function getAiConversation(conversationId) {
  const response = await apiRequest(`/api/v1/ai/conversations/${conversationId}`);

  return response.data.data;
}

export async function sendAiConversationMessage(conversationId, { targetDate, message }) {
  const response = await apiRequest(`/api/v1/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ targetDate, message }),
  });

  return response.data.data;
}

export async function deleteAiConversation(conversationId) {
  const response = await apiRequest(`/api/v1/ai/conversations/${conversationId}`, {
    method: 'DELETE',
  });

  return response.data.data;
}
