import { useEffect, useMemo, useState } from 'react';
import { Activity, AlarmClock, Bed, Droplets, Flame, Footprints, Gauge, Sparkles, Target } from 'lucide-react';
import { createAiConversation, sendAiConversationMessage } from '../api/ai.js';
import { getDailyDashboard, getWeeklyDashboard } from '../api/dashboard.js';
import { addHydrationIntake, saveSleepRecord, updateHydrationTarget } from '../api/wellness.js';

const AI_DATE_STORAGE_KEY = 'aiCoachTargetDate';
const AI_PROMPT_STORAGE_KEY = 'aiCoachDraft';
const AI_ACTIVE_CONVERSATION_KEY = 'aiCoachActiveConversationId';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const today = formatLocalDate(new Date());
const defaultSleepStartMinutes = 23 * 60;
const defaultWakeMinutes = 7 * 60;

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

function parseTimeToMinutes(timeValue, fallbackMinutes) {
  if (!timeValue) {
    return fallbackMinutes;
  }

  const [hour, minute] = timeValue.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return fallbackMinutes;
  }

  return hour * 60 + minute;
}

function minutesToTimeValue(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour = String(Math.floor(normalized / 60)).padStart(2, '0');
  const minute = String(normalized % 60).padStart(2, '0');

  return `${hour}:${minute}`;
}

function formatKoreanTime(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${period} ${displayHour}:${String(minute).padStart(2, '0')}`;
}

function calculateSleepMinutes(startMinutes, wakeMinutes) {
  const diff = wakeMinutes - startMinutes;

  return diff > 0 ? diff : diff + 1440;
}

function formatDuration(minutes) {
  if (!minutes) {
    return '-- 시간 -- 분';
  }

  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}

function getDialPoint(minutes, radius = 80) {
  const angle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;

  return {
    x: 100 + Math.cos(angle) * radius,
    y: 100 + Math.sin(angle) * radius,
  };
}

function getSleepArcPath(startMinutes, wakeMinutes, radius = 80) {
  const start = getDialPoint(startMinutes, radius);
  const end = getDialPoint(wakeMinutes, radius);
  const duration = calculateSleepMinutes(startMinutes, wakeMinutes);
  const largeArcFlag = duration > 720 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function SleepDial({
  activeControl,
  sleepStartMinutes,
  wakeMinutes,
  onActiveControlChange,
  onChangeSleepStart,
  onChangeWake,
}) {
  const updateTimeFromPointer = (event, shouldPickTarget) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const rawMinutes = Math.round((normalized / (Math.PI * 2)) * 1440 / 15) * 15;
    const nextMinutes = rawMinutes % 1440;
    const sleepPoint = getDialPoint(sleepStartMinutes);
    const wakePoint = getDialPoint(wakeMinutes);
    const distanceToSleep = Math.hypot(event.clientX - (rect.left + (sleepPoint.x / 200) * rect.width), event.clientY - (rect.top + (sleepPoint.y / 200) * rect.height));
    const distanceToWake = Math.hypot(event.clientX - (rect.left + (wakePoint.x / 200) * rect.width), event.clientY - (rect.top + (wakePoint.y / 200) * rect.height));
    const nextControl = shouldPickTarget || !activeControl
      ? distanceToSleep <= distanceToWake ? 'start' : 'wake'
      : activeControl;

    onActiveControlChange(nextControl);

    if (nextControl === 'start') {
      onChangeSleepStart(nextMinutes);
    } else {
      onChangeWake(nextMinutes);
    }
  };
  const sleepPoint = getDialPoint(sleepStartMinutes);
  const wakePoint = getDialPoint(wakeMinutes);
  const arcPath = getSleepArcPath(sleepStartMinutes, wakeMinutes);
  const isStartActive = activeControl === 'start';
  const activeTime = isStartActive ? sleepStartMinutes : wakeMinutes;
  const ActiveIcon = isStartActive ? Bed : AlarmClock;
  const isEditing = activeControl === 'start' || activeControl === 'wake';

  return (
    <button
      className="sleep-dial"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        updateTimeFromPointer(event, true);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          updateTimeFromPointer(event, false);
        }
      }}
      onPointerUp={() => onActiveControlChange('')}
      onPointerCancel={() => onActiveControlChange('')}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 200 200">
        <circle className="sleep-dial-track" cx="100" cy="100" r="80" />
        <path className="sleep-dial-arc" d={arcPath} />
        {[0, 6, 12, 18].map((hour) => {
          const labelPoint = getDialPoint(hour * 60, 62);
          return (
            <text className="sleep-dial-label" key={hour} x={labelPoint.x} y={labelPoint.y}>
              {hour}
            </text>
          );
        })}
      </svg>
      <span
        className={`sleep-dial-marker start${isStartActive ? ' is-active' : ''}`}
        style={{ left: `${sleepPoint.x / 2}%`, top: `${sleepPoint.y / 2}%` }}
      >
        <Bed aria-hidden="true" size={13} />
      </span>
      <span
        className={`sleep-dial-marker wake${!isStartActive ? ' is-active' : ''}`}
        style={{ left: `${wakePoint.x / 2}%`, top: `${wakePoint.y / 2}%` }}
      >
        <AlarmClock aria-hidden="true" size={13} />
      </span>
      <span className="sleep-dial-center">
        {isEditing ? (
          <span className="sleep-dial-time-row active">
            <ActiveIcon aria-hidden="true" size={14} />
            <strong>{formatKoreanTime(activeTime)}</strong>
          </span>
        ) : (
          <>
            <span className="sleep-dial-time-row">
              <Bed aria-hidden="true" size={14} />
              <strong>{formatKoreanTime(sleepStartMinutes)}</strong>
            </span>
            <span className="sleep-dial-time-row">
              <AlarmClock aria-hidden="true" size={14} />
              <strong>{formatKoreanTime(wakeMinutes)}</strong>
            </span>
          </>
        )}
      </span>
    </button>
  );
}

function Dashboard({ currentUser, onOpenAiAdvice }) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [dailyDashboard, setDailyDashboard] = useState(null);
  const [weeklyDashboard, setWeeklyDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [wellnessMessage, setWellnessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingAiReview, setIsRequestingAiReview] = useState(false);
  const [isSavingHydration, setIsSavingHydration] = useState(false);
  const [isSavingSleep, setIsSavingSleep] = useState(false);
  const [hydrationTargetInput, setHydrationTargetInput] = useState('2000');
  const [hydrationAmountInput, setHydrationAmountInput] = useState('250');
  const [isHydrationSettingsOpen, setIsHydrationSettingsOpen] = useState(false);
  const [sleepStartMinutes, setSleepStartMinutes] = useState(defaultSleepStartMinutes);
  const [wakeMinutes, setWakeMinutes] = useState(defaultWakeMinutes);
  const [activeSleepControl, setActiveSleepControl] = useState('');
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

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
  const waterIntakeMl = stats?.waterIntakeMl ?? 0;
  const hydrationTargetMl = stats?.hydrationTargetMl ?? 2000;
  const hydrationRatio = hydrationTargetMl > 0 ? Math.min(1, waterIntakeMl / hydrationTargetMl) : 0;
  const hasSleepRecord = Boolean(stats?.sleepMinutes);
  const sleepDurationMinutes = hasSleepRecord ? stats.sleepMinutes : calculateSleepMinutes(sleepStartMinutes, wakeMinutes);

  function mergeHydrationStats(hydration) {
    setDailyDashboard((currentDashboard) => {
      if (!currentDashboard) {
        return currentDashboard;
      }

      return {
        ...currentDashboard,
        stats: {
          ...currentDashboard.stats,
          hydrationTargetMl: hydration.targetMl,
          waterIntakeMl: hydration.intakeMl,
        },
      };
    });
    setHydrationTargetInput(String(hydration.targetMl));
  }

  function mergeSleepStats(sleep) {
    setDailyDashboard((currentDashboard) => {
      if (!currentDashboard) {
        return currentDashboard;
      }

      return {
        ...currentDashboard,
        stats: {
          ...currentDashboard.stats,
          sleepStartTime: sleep.sleepStartTime,
          wakeTime: sleep.wakeTime,
          sleepMinutes: sleep.durationMinutes,
        },
      };
    });
  }

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
        setHydrationTargetInput(String(daily.stats?.hydrationTargetMl ?? 2000));
        setSleepStartMinutes(parseTimeToMinutes(daily.stats?.sleepStartTime, defaultSleepStartMinutes));
        setWakeMinutes(parseTimeToMinutes(daily.stats?.wakeTime, defaultWakeMinutes));
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

  const handleSaveHydrationTarget = async () => {
    const targetMl = Number(hydrationTargetInput);

    if (!targetMl || targetMl <= 0) {
      setErrorMessage('물 섭취 목표는 0보다 크게 입력해주세요.');
      return;
    }

    setIsSavingHydration(true);
    setErrorMessage('');
    setWellnessMessage('');

    try {
      const hydration = await updateHydrationTarget({ recordDate: selectedDate, targetMl });
      mergeHydrationStats(hydration);
      setIsHydrationSettingsOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingHydration(false);
    }
  };

  const handleAddHydration = async () => {
    const amountMl = Number(hydrationAmountInput);

    if (!amountMl || amountMl <= 0) {
      setErrorMessage('추가할 물 섭취량은 0보다 크게 입력해주세요.');
      return;
    }

    setIsSavingHydration(true);
    setErrorMessage('');
    setWellnessMessage('');

    try {
      const hydration = await addHydrationIntake({ recordDate: selectedDate, amountMl });
      mergeHydrationStats(hydration);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingHydration(false);
    }
  };

  const handleSaveSleep = async () => {
    setIsSavingSleep(true);
    setErrorMessage('');
    setWellnessMessage('');

    try {
      const sleep = await saveSleepRecord({
        recordDate: selectedDate,
        sleepStartTime: minutesToTimeValue(sleepStartMinutes),
        wakeTime: minutesToTimeValue(wakeMinutes),
      });
      mergeSleepStats(sleep);
      setIsSleepModalOpen(false);
      setActiveSleepControl('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingSleep(false);
    }
  };

  const handleRequestAiReview = async () => {
    const prompt = `${selectedDate} 기록을 바탕으로 식단, 운동, 물 섭취, 수면을 종합 평가해줘. 현재 상황에서 부족한 점과 오늘 바로 할 행동을 짧게 알려줘.`;

    setIsRequestingAiReview(true);
    setErrorMessage('');
    setWellnessMessage('');

    try {
      const detail = await createAiConversation({
        targetDate: selectedDate,
        title: `${selectedDate} 종합 건강 평가`,
      });
      const conversationId = detail.conversation.conversationId;

      await sendAiConversationMessage(conversationId, {
        targetDate: selectedDate,
        message: prompt,
      });

      window.localStorage.setItem(AI_ACTIVE_CONVERSATION_KEY, conversationId);
      window.localStorage.setItem(AI_DATE_STORAGE_KEY, selectedDate);
      window.localStorage.removeItem(AI_PROMPT_STORAGE_KEY);
      onOpenAiAdvice?.();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsRequestingAiReview(false);
    }
  };

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
          <button
            className="secondary-button ai-review-button"
            disabled={isRequestingAiReview}
            onClick={handleRequestAiReview}
            type="button"
          >
            <Sparkles aria-hidden="true" size={15} />
            {isRequestingAiReview ? '종합 평가 생성 중...' : '종합 AI 평가 받기'}
          </button>
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
      {wellnessMessage ? <p className="form-success">{wellnessMessage}</p> : null}
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

      <section className="wellness-grid">
        <article className="summary-card hydration-card">
          <div className="sleep-card-header">
            <span className="metric-icon burned">
              <Droplets size={20} />
            </span>
            <div>
              <p className="summary-card-label">물 마시기</p>
              <h3 className="section-title">
                {waterIntakeMl.toLocaleString()} / {hydrationTargetMl.toLocaleString()} ml
              </h3>
            </div>
          </div>

          <div className="hydration-body">
            <div className="hydration-main">
              <button
                className="primary-button hydration-add-button"
                disabled={isSavingHydration}
                onClick={handleAddHydration}
                type="button"
              >
                + {Number(hydrationAmountInput || 0).toLocaleString()} ml
              </button>
              <button
                className="hydration-settings-toggle"
                onClick={() => setIsHydrationSettingsOpen(true)}
                type="button"
              >
                목표 수정하기
              </button>
            </div>

            <div className="water-cup" aria-label={`물 섭취율 ${Math.round(hydrationRatio * 100)}%`}>
              <div className="water-cup-fill" style={{ height: `${Math.max(5, hydrationRatio * 100)}%` }} />
            </div>
          </div>

        </article>

        <article className="summary-card sleep-card">
          <div className="sleep-card-header">
            <span className="metric-icon target">
              <Bed size={20} />
            </span>
            <div>
              <p className="summary-card-label">수면</p>
              <h3 className="section-title">{hasSleepRecord ? formatDuration(sleepDurationMinutes) : '미입력'}</h3>
            </div>
          </div>

          <div className="sleep-home-body">
            <button className="primary-button sleep-input-button" onClick={() => setIsSleepModalOpen(true)} type="button">
              입력
            </button>

            <div className={`sleep-mini-graph${hasSleepRecord ? '' : ' is-empty'}`} aria-label={hasSleepRecord ? `수면 시간 ${formatDuration(sleepDurationMinutes)}` : '수면 시간 미입력'}>
              <span className="sleep-mini-icon">
                <Bed aria-hidden="true" size={18} />
              </span>
              <div className="sleep-mini-track">
                <span
                  className="sleep-mini-fill"
                  style={{ width: hasSleepRecord ? `${Math.min(100, Math.max(8, (sleepDurationMinutes / 600) * 100))}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>

      {isHydrationSettingsOpen ? (
        <div className="sleep-modal-backdrop" role="presentation">
          <section className="sleep-modal hydration-modal" aria-label="물 마시기 설정">
            <div className="section-heading">
              <div>
                <p className="summary-card-label">물 마시기 설정</p>
                <h3 className="section-title">목표와 1회 섭취량</h3>
              </div>
            </div>

            <div className="hydration-settings-panel">
              <label className="form-field compact-water-field">
                목표 ml
                <input
                  inputMode="numeric"
                  min="250"
                  onChange={(event) => setHydrationTargetInput(event.target.value)}
                  step="250"
                  type="number"
                  value={hydrationTargetInput}
                />
              </label>
              <label className="form-field compact-water-field">
                1회 ml
                <input
                  inputMode="numeric"
                  min="50"
                  onChange={(event) => setHydrationAmountInput(event.target.value)}
                  step="50"
                  type="number"
                  value={hydrationAmountInput}
                />
              </label>
            </div>

            <div className="sleep-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setIsHydrationSettingsOpen(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="primary-button"
                disabled={isSavingHydration}
                onClick={handleSaveHydrationTarget}
                type="button"
              >
                설정 저장
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isSleepModalOpen ? (
        <div className="sleep-modal-backdrop" role="presentation">
          <section className="sleep-modal" aria-label="수면 시간 입력">
            <div className="section-heading">
              <div>
                <p className="summary-card-label">수면 입력</p>
                <h3 className="section-title">{formatDuration(sleepDurationMinutes)}</h3>
              </div>
            </div>

            <SleepDial
              activeControl={activeSleepControl}
              sleepStartMinutes={sleepStartMinutes}
              wakeMinutes={wakeMinutes}
              onActiveControlChange={setActiveSleepControl}
              onChangeSleepStart={setSleepStartMinutes}
              onChangeWake={setWakeMinutes}
            />

            <div className="sleep-summary">
              <span>
                <Bed aria-hidden="true" size={16} />
                {formatKoreanTime(sleepStartMinutes)}
              </span>
              <span>
                <AlarmClock aria-hidden="true" size={16} />
                {formatKoreanTime(wakeMinutes)}
              </span>
            </div>

            <div className="sleep-modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setIsSleepModalOpen(false);
                  setActiveSleepControl('');
                }}
                type="button"
              >
                취소
              </button>
              <button
                className="primary-button"
                disabled={isSavingSleep}
                onClick={handleSaveSleep}
                type="button"
              >
                저장
              </button>
            </div>
          </section>
        </div>
      ) : null}

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
