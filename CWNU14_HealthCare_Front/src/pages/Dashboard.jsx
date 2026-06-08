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
        <p className="screen-heading-label">오늘</p>
        <h2 className="screen-heading-title">건강 요약</h2>
        <p className="app-summary">
          일간 및 주간 칼로리, 운동 시간, 목표 대비 균형을 한눈에 확인합니다.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">대시보드 날짜</p>
            <h3 className="section-title">{selectedDate}</h3>
          </div>
        </div>

        <label className="form-field">
          날짜
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
      {isLoading ? <p className="form-helper">대시보드를 불러오는 중...</p> : null}

      <section className="record-summary-grid">
        <article className="metric-card">
          <p className="summary-card-label">섭취</p>
          <p className="summary-card-value">{stats?.intakeCalories ?? 0} kcal</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">소모</p>
          <p className="summary-card-value">{stats?.burnedCalories ?? 0} kcal</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">운동</p>
          <p className="summary-card-value">{stats?.exerciseMinutes ?? 0}분</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">균형</p>
          <p className="summary-card-value">{stats?.calorieBalance ?? 0} kcal</p>
          <p className="form-helper">목표 {stats?.targetCalories ?? 0} kcal</p>
        </article>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">주간 요약</p>
            <h3 className="section-title">
              {weeklyDashboard?.startDate ?? weekStart} - {weeklyDashboard?.endDate ?? ''}
            </h3>
          </div>
        </div>

        <div className="record-summary-grid compact">
          <article className="metric-card subtle">
            <p className="summary-card-label">주간 섭취</p>
            <p className="summary-card-value">{weeklyStats?.intakeCalories ?? 0} kcal</p>
          </article>
          <article className="metric-card subtle">
            <p className="summary-card-label">주간 소모</p>
            <p className="summary-card-value">{weeklyStats?.burnedCalories ?? 0} kcal</p>
          </article>
        </div>

        <div className="activity-list">
          {(weeklyDashboard?.dailyStats ?? []).map((day) => (
            <article className="activity-item" key={day.date}>
              <div>
                <p className="activity-item-title">{day.date}</p>
                <p className="activity-item-meta">
                  섭취 {day.stats.intakeCalories} kcal · 소모 {day.stats.burnedCalories} kcal ·
                  운동 {day.stats.exerciseMinutes}분
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
