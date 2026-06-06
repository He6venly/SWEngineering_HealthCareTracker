import { apiRequest } from './client.js';

export async function getActivities(date) {
  const response = await apiRequest(`/api/v1/activities?date=${date}`);

  return response.data.data;
}

export async function addDiet({ mealType, foodName, calories, recordDate }) {
  const response = await apiRequest('/api/v1/activities/diets', {
    method: 'POST',
    body: JSON.stringify({
      mealType,
      foodName,
      calories,
      recordDate,
    }),
  });

  return response.data.data;
}

export async function addExercise({
  exerciseName,
  durationMinutes,
  caloriesBurned,
  source,
  recordDate,
}) {
  const response = await apiRequest('/api/v1/activities/exercises', {
    method: 'POST',
    body: JSON.stringify({
      exerciseName,
      durationMinutes,
      caloriesBurned,
      source,
      recordDate,
    }),
  });

  return response.data.data;
}

export async function syncWearable({
  stepCount,
  averageHeartRate,
  durationMinutes,
  recordDate,
}) {
  const response = await apiRequest('/api/v1/simulation/wearable', {
    method: 'POST',
    body: JSON.stringify({
      stepCount,
      averageHeartRate,
      durationMinutes,
      recordDate,
    }),
  });

  return response.data.data;
}
