import { useEffect, useMemo, useState } from 'react';
import { Activity, Flame, Footprints, Gauge, Target } from 'lucide-react';
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

function getCalorieStatus(intakeCalories, targetCalories) {
  if (!targetCalories) {
    return 'neutral';
  }

  if (intakeCalories > targetCalories) {
    return 'over';
  }

  if (targetCalories - intakeCalories <= 200) {
    return 'close';
  }

  return 'balanced';
}

function Dashboard({ currentUser }) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [dailyDashboard, setDailyDashboard] = useState(null);
  const [weeklyDashboard, setWeeklyDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const stats = dailyDashboard?.stats;
  const weeklyStats = weeklyDashboard?.stats;
  const dailyStats = weeklyDashboard?.dailyStats ?? [];
  const targetCalories = stats?.targetCalories ?? weeklyStats?.targetCalories ?? 0;
  const intakeCalories = stats?.intakeCalories ?? 0;
  const targetOverage = Math.max(0, (stats?.intakeCalories ?? 0) - targetCalories);
  const targetRemaining = Math.max(0, targetCalories - (stats?.intakeCalories ?? 0));
  const calorieStatus = getCalorieStatus(intakeCalories, targetCalories);
  const maxWeeklyCalories = Math.max(
    1,
    ...dailyStats.map((day) =>
      Math.max(
        day.stats.intakeCalories,
        day.stats.burnedCalories,
        Math.max(0, day.stats.intakeCalories - (day.stats.targetCalories ?? targetCalories)),
      ),
    ),
  );
  const nickname = currentUser?.nickname;

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
      <section className="dashboard-hero">
        <div>
          <p className="screen-heading-label">오늘의 헬스 리포트</p>
          <h2 className="screen-heading-title">
            {nickname ? `${nickname}님 맞춤 건강 요약` : '나의 건강 요약'}
          </h2>
          <p className="app-summary">
            하루 섭취, 소모, 운동량을 확인하고 이번 주 흐름까지 함께 살펴보세요.
          </p>
        </div>
        <div className={`hero-visual ${calorieStatus}`} aria-hidden="true">
          <Gauge size={34} strokeWidth={2.2} />
          <strong>{stats?.calorieBalance ?? 0}</strong>
          <span>kcal 균형</span>
        </div>
      </section>

      <section className="summary-card date-card">
        <div>
          <p className="summary-card-label">조회 날짜</p>
          <h3 className="section-title">{selectedDate}</h3>
        </div>

        <label className="form-field compact-field">
          날짜 변경
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
        <article className="metric-card accent-card">
          <span className="metric-icon intake">
            <Flame size={20} />
          </span>
          <p className="summary-card-label">섭취 칼로리</p>
          <p className="summary-card-value">{stats?.intakeCalories ?? 0} kcal</p>
        </article>
        <article className="metric-card accent-card">
          <span className="metric-icon burned">
            <Footprints size={20} />
          </span>
          <p className="summary-card-label">소모 칼로리</p>
          <p className="summary-card-value">{stats?.burnedCalories ?? 0} kcal</p>
        </article>
        <article className="metric-card accent-card">
          <span className="metric-icon exercise">
            <Activity size={20} />
          </span>
          <p className="summary-card-label">운동 시간</p>
          <p className="summary-card-value">{stats?.exerciseMinutes ?? 0}분</p>
        </article>
        <article className="metric-card accent-card">
          <span className="metric-icon target">
            <Target size={20} />
          </span>
          <p className="summary-card-label">목표 대비</p>
          <p className="summary-card-value">
            {targetOverage > 0 ? `+${targetOverage}` : targetRemaining} kcal
          </p>
          <p className="form-helper">
            {targetOverage > 0
              ? `목표보다 ${targetOverage} kcal 초과`
              : `목표까지 ${targetRemaining} kcal 남음`}
          </p>
        </article>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">1주 기록 그래프</p>
            <h3 className="section-title">
              {weeklyDashboard?.startDate ?? weekStart} - {weeklyDashboard?.endDate ?? ''}
            </h3>
          </div>
        </div>

        <div className="weekly-chart" aria-label="1주 섭취, 소모, 목표 초과 칼로리 그래프">
          {dailyStats.length === 0 ? (
            <p className="form-helper">아직 표시할 주간 기록이 없습니다.</p>
          ) : (
            dailyStats.map((day) => {
              const dayTarget = day.stats.targetCalories ?? targetCalories;
              const overage = Math.max(0, day.stats.intakeCalories - dayTarget);
              const intakeHeight = `${Math.max(6, (day.stats.intakeCalories / maxWeeklyCalories) * 100)}%`;
              const burnedHeight = `${Math.max(6, (day.stats.burnedCalories / maxWeeklyCalories) * 100)}%`;
              const overageHeight = overage > 0
                ? `${Math.max(6, (overage / maxWeeklyCalories) * 100)}%`
                : '0%';

              return (
                <div className="chart-day" key={day.date}>
                  <div className="chart-bars">
                    <span className="chart-bar intake" style={{ height: intakeHeight }} />
                    <span className="chart-bar burned" style={{ height: burnedHeight }} />
                    <span
                      className={`chart-bar overage${overage > 0 ? '' : ' is-empty'}`}
                      title={overage > 0 ? `목표 초과 ${overage} kcal` : '목표 범위 안'}
                      style={{ height: overageHeight }}
                    />
                  </div>
                  <strong>{day.date.slice(5)}</strong>
                </div>
              );
            })
          )}
        </div>

        <div className="chart-legend">
          <span className="legend-dot intake" /> 섭취
          <span className="legend-dot burned" /> 소모
          <span className="legend-dot overage" /> 목표 초과
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
      </section>
    </>
  );
}

export default Dashboard;
