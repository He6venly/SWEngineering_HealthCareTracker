import { useEffect, useMemo, useState } from 'react';
import { addDiet, addExercise, getActivities, syncWearable } from '../api/activity.js';

const today = new Date().toISOString().slice(0, 10);

const emptyDietForm = {
  mealType: 'BREAKFAST',
  foodName: '',
  calories: '',
};

const emptyExerciseForm = {
  exerciseName: '',
  durationMinutes: '',
  caloriesBurned: '',
  source: 'MANUAL',
};

const emptyWearableForm = {
  stepCount: '',
  averageHeartRate: '',
  durationMinutes: '',
};

function ActivityForm() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [activities, setActivities] = useState([]);
  const [dietForm, setDietForm] = useState(emptyDietForm);
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm);
  const [wearableForm, setWearableForm] = useState(emptyWearableForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittingForm, setSubmittingForm] = useState('');

  const totals = useMemo(() => {
    return activities.reduce(
      (summary, activity) => {
        if (activity.type === 'DIET') {
          return {
            ...summary,
            intakeCalories: summary.intakeCalories + activity.calories,
            dietCount: summary.dietCount + 1,
          };
        }

        return {
          ...summary,
          burnedCalories: summary.burnedCalories + activity.calories,
          exerciseCount: summary.exerciseCount + 1,
        };
      },
      {
        intakeCalories: 0,
        burnedCalories: 0,
        dietCount: 0,
        exerciseCount: 0,
      },
    );
  }, [activities]);

  async function loadActivities(date = selectedDate) {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const loadedActivities = await getActivities(date);
      setActivities(loadedActivities ?? []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadActivities(selectedDate);
  }, [selectedDate]);

  const handleDietChange = (event) => {
    const { name, value } = event.target;

    setDietForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleExerciseChange = (event) => {
    const { name, value } = event.target;

    setExerciseForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleWearableChange = (event) => {
    const { name, value } = event.target;

    setWearableForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleDietSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmittingForm('diet');

    try {
      await addDiet({
        mealType: dietForm.mealType,
        foodName: dietForm.foodName,
        calories: Number(dietForm.calories),
        recordDate: selectedDate,
      });
      setDietForm(emptyDietForm);
      setSuccessMessage('Diet record saved.');
      await loadActivities(selectedDate);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmittingForm('');
    }
  };

  const handleExerciseSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmittingForm('exercise');

    try {
      await addExercise({
        exerciseName: exerciseForm.exerciseName,
        durationMinutes: Number(exerciseForm.durationMinutes),
        caloriesBurned: Number(exerciseForm.caloriesBurned),
        source: exerciseForm.source,
        recordDate: selectedDate,
      });
      setExerciseForm(emptyExerciseForm);
      setSuccessMessage('Exercise record saved.');
      await loadActivities(selectedDate);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmittingForm('');
    }
  };

  const handleWearableSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmittingForm('wearable');

    try {
      await syncWearable({
        stepCount: Number(wearableForm.stepCount),
        averageHeartRate: Number(wearableForm.averageHeartRate),
        durationMinutes: Number(wearableForm.durationMinutes),
        recordDate: selectedDate,
      });
      setWearableForm(emptyWearableForm);
      setSuccessMessage('Wearable data synced.');
      await loadActivities(selectedDate);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmittingForm('');
    }
  };

  return (
    <>
      <section className="screen-heading">
        <p className="screen-heading-label">Records</p>
        <h2 className="screen-heading-title">Track diet, exercise, and wearable data</h2>
        <p className="app-summary">
          Record daily intake and activity data for dashboard summaries and AI feedback.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Record date</p>
            <h3 className="section-title">{selectedDate}</h3>
          </div>
        </div>

        <label className="form-field">
          Date
          <input
            name="selectedDate"
            onChange={(event) => setSelectedDate(event.target.value)}
            required
            type="date"
            value={selectedDate}
          />
        </label>
      </section>

      <section className="record-summary-grid">
        <article className="metric-card">
          <p className="summary-card-label">Intake</p>
          <p className="summary-card-value">{totals.intakeCalories} kcal</p>
          <p className="form-helper">{totals.dietCount} diet records</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">Burned</p>
          <p className="summary-card-value">{totals.burnedCalories} kcal</p>
          <p className="form-helper">{totals.exerciseCount} exercise records</p>
        </article>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Diet</p>
            <h3 className="section-title">Add meal record</h3>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleDietSubmit}>
          <div className="form-grid">
            <label className="form-field">
              Meal type
              <select name="mealType" onChange={handleDietChange} value={dietForm.mealType}>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACK">Snack</option>
              </select>
            </label>

            <label className="form-field">
              Food name
              <input
                name="foodName"
                onChange={handleDietChange}
                placeholder="chicken salad"
                required
                type="text"
                value={dietForm.foodName}
              />
            </label>

            <label className="form-field">
              Calories
              <input
                inputMode="numeric"
                min="1"
                name="calories"
                onChange={handleDietChange}
                placeholder="520"
                required
                type="number"
                value={dietForm.calories}
              />
            </label>
          </div>

          <button className="primary-button" disabled={submittingForm === 'diet'} type="submit">
            {submittingForm === 'diet' ? 'Saving...' : 'Save diet'}
          </button>
        </form>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Exercise</p>
            <h3 className="section-title">Add workout record</h3>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleExerciseSubmit}>
          <div className="form-grid">
            <label className="form-field">
              Exercise name
              <input
                name="exerciseName"
                onChange={handleExerciseChange}
                placeholder="running"
                required
                type="text"
                value={exerciseForm.exerciseName}
              />
            </label>

            <label className="form-field">
              Duration (minutes)
              <input
                inputMode="numeric"
                min="1"
                name="durationMinutes"
                onChange={handleExerciseChange}
                placeholder="30"
                required
                type="number"
                value={exerciseForm.durationMinutes}
              />
            </label>

            <label className="form-field">
              Calories burned
              <input
                inputMode="numeric"
                min="1"
                name="caloriesBurned"
                onChange={handleExerciseChange}
                placeholder="250"
                required
                type="number"
                value={exerciseForm.caloriesBurned}
              />
            </label>

            <label className="form-field">
              Source
              <select name="source" onChange={handleExerciseChange} value={exerciseForm.source}>
                <option value="MANUAL">Manual</option>
                <option value="WEARABLE">Wearable</option>
              </select>
            </label>
          </div>

          <button className="primary-button" disabled={submittingForm === 'exercise'} type="submit">
            {submittingForm === 'exercise' ? 'Saving...' : 'Save exercise'}
          </button>
        </form>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Wearable</p>
            <h3 className="section-title">Sync simulated wearable data</h3>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleWearableSubmit}>
          <div className="form-grid">
            <label className="form-field">
              Step count
              <input
                inputMode="numeric"
                min="0"
                name="stepCount"
                onChange={handleWearableChange}
                placeholder="8500"
                required
                type="number"
                value={wearableForm.stepCount}
              />
            </label>

            <label className="form-field">
              Average heart rate
              <input
                inputMode="numeric"
                min="1"
                name="averageHeartRate"
                onChange={handleWearableChange}
                placeholder="115"
                required
                type="number"
                value={wearableForm.averageHeartRate}
              />
            </label>

            <label className="form-field">
              Duration (minutes)
              <input
                inputMode="numeric"
                min="1"
                name="durationMinutes"
                onChange={handleWearableChange}
                placeholder="45"
                required
                type="number"
                value={wearableForm.durationMinutes}
              />
            </label>
          </div>

          <button className="primary-button" disabled={submittingForm === 'wearable'} type="submit">
            {submittingForm === 'wearable' ? 'Syncing...' : 'Sync wearable'}
          </button>
        </form>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Daily records</p>
            <h3 className="section-title">Activity history</h3>
          </div>
        </div>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {successMessage ? <p className="form-success">{successMessage}</p> : null}

        {isLoading ? <p className="form-helper">Loading records...</p> : null}

        {!isLoading && activities.length === 0 ? (
          <p className="form-helper">No records for this date.</p>
        ) : null}

        <div className="activity-list">
          {activities.map((activity) => (
            <article className="activity-item" key={activity.recordId}>
              <div>
                <p className="activity-item-title">{activity.name}</p>
                <p className="activity-item-meta">
                  {activity.type}
                  {activity.mealType ? ` · ${activity.mealType}` : ''}
                  {activity.source ? ` · ${activity.source}` : ''}
                  {activity.durationMinutes ? ` · ${activity.durationMinutes} min` : ''}
                </p>
              </div>
              <strong>{activity.calories} kcal</strong>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default ActivityForm;
