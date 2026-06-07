import { useEffect, useMemo, useState } from 'react';
import { getDailyDashboard, getWeeklyDashboard } from '../api/dashboard.js';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const today = formatLocalDate(new Date());

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diff);

  return formatLocalDate(date);
}

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [dailyDashboard, setDailyDashboard] = useState(null);
  const [weeklyDashboard, setWeeklyDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const stats = dailyDashboard?.stats;
  const weeklyStats = weeklyDashboard?.stats;

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [daily, weekly] = await Promise.all([
          getDailyDashboard(selectedDate),
          getWeeklyDashboard(weekStart),
        ]);

        if (!isMounted) {
          return;
        }

        setDailyDashboard(daily);
        setWeeklyDashboard(weekly);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, weekStart]);

  return (
    <>
      <section className="screen-heading">
        <p className="screen-heading-label">Today</p>
        <h2 className="screen-heading-title">Your health summary</h2>
        <p className="app-summary">
          Review daily and weekly calories, exercise minutes, and target balance.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Dashboard date</p>
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

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {isLoading ? <p className="form-helper">Loading dashboard...</p> : null}

      <section className="record-summary-grid">
        <article className="metric-card">
          <p className="summary-card-label">Intake</p>
          <p className="summary-card-value">{stats?.intakeCalories ?? 0} kcal</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">Burned</p>
          <p className="summary-card-value">{stats?.burnedCalories ?? 0} kcal</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">Exercise</p>
          <p className="summary-card-value">{stats?.exerciseMinutes ?? 0} min</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">Balance</p>
          <p className="summary-card-value">{stats?.calorieBalance ?? 0} kcal</p>
          <p className="form-helper">Target {stats?.targetCalories ?? 0} kcal</p>
        </article>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Weekly summary</p>
            <h3 className="section-title">
              {weeklyDashboard?.startDate ?? weekStart} - {weeklyDashboard?.endDate ?? ''}
            </h3>
          </div>
        </div>

        <div className="record-summary-grid compact">
          <article className="metric-card subtle">
            <p className="summary-card-label">Weekly intake</p>
            <p className="summary-card-value">{weeklyStats?.intakeCalories ?? 0} kcal</p>
          </article>
          <article className="metric-card subtle">
            <p className="summary-card-label">Weekly burned</p>
            <p className="summary-card-value">{weeklyStats?.burnedCalories ?? 0} kcal</p>
          </article>
        </div>

        <div className="activity-list">
          {(weeklyDashboard?.dailyStats ?? []).map((day) => (
            <article className="activity-item" key={day.date}>
              <div>
                <p className="activity-item-title">{day.date}</p>
                <p className="activity-item-meta">
                  Intake {day.stats.intakeCalories} kcal · Burned {day.stats.burnedCalories} kcal ·
                  Exercise {day.stats.exerciseMinutes} min
                </p>
              </div>
              <strong>{day.stats.calorieBalance} kcal</strong>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Dashboard;
