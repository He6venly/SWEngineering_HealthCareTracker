import { apiRequest } from './client.js';

export async function getDailyDashboard(date) {
  const response = await apiRequest(`/api/v1/dashboard/daily?date=${date}`);

  return response.data.data;
}

export async function getWeeklyDashboard(startDate) {
  const response = await apiRequest(`/api/v1/dashboard/weekly?startDate=${startDate}`);

  return response.data.data;
}
