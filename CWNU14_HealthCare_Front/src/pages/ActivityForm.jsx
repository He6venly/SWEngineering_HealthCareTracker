import { useEffect, useMemo, useState } from 'react';
import { addDiet, addExercise, getActivities, syncWearable } from '../api/activity.js';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const today = formatLocalDate(new Date());

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

const activityTypeLabels = {
  DIET: '식단',
  EXERCISE: '운동',
};

const mealTypeLabels = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
  SNACK: '간식',
};

const sourceLabels = {
  MANUAL: '직접 입력',
  WEARABLE: '웨어러블',
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createWearableSample() {
  return {
    stepCount: String(randomInt(6000, 12000)),
    averageHeartRate: String(randomInt(95, 145)),
    durationMinutes: String(randomInt(25, 70)),
  };
}

function estimateWearableCalories({ stepCount, averageHeartRate, durationMinutes }) {
  const steps = Number(stepCount);
  const heartRate = Number(averageHeartRate);
  const minutes = Number(durationMinutes);

  if (!steps || !heartRate || !minutes) {
    return 0;
  }

  const heartRateIntensity = Math.min(8, Math.max(0, Math.floor((heartRate - 90) / 10)));

  return Math.max(1, Math.round(steps / 50 + minutes * (3 + heartRateIntensity)));
}

function ActivityForm() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [activities, setActivities] = useState([]);
  const [dietForm, setDietForm] = useState(emptyDietForm);
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm);
  const [wearableForm, setWearableForm] = useState(emptyWearableForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastWearableSync, setLastWearableSync] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingForm, setSubmittingForm] = useState('');

  const estimatedWearableCalories = estimateWearableCalories(wearableForm);
  const hasWearableData = Boolean(
    wearableForm.stepCount && wearableForm.averageHeartRate && wearableForm.durationMinutes,
  );

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

  const handleGenerateWearableSample = () => {
    setWearableForm(createWearableSample());
    setLastWearableSync(null);
    setSuccessMessage('');
    setErrorMessage('');
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
      setSuccessMessage('식단 기록을 저장했습니다.');
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
      setSuccessMessage('운동 기록을 저장했습니다.');
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

    if (!hasWearableData) {
      setErrorMessage('먼저 기기 데이터 불러오기를 눌러 웨어러블 데이터를 가져와 주세요.');
      return;
    }

    setSubmittingForm('wearable');

    try {
      const syncResult = await syncWearable({
        stepCount: Number(wearableForm.stepCount),
        averageHeartRate: Number(wearableForm.averageHeartRate),
        durationMinutes: Number(wearableForm.durationMinutes),
        recordDate: selectedDate,
      });
      setWearableForm(emptyWearableForm);
      setLastWearableSync(syncResult);
      setSuccessMessage(`웨어러블 원시 데이터를 운동 기록으로 변환했습니다. 소모 칼로리 ${syncResult.processedCaloriesBurned} kcal`);
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
        <p className="screen-heading-label">기록</p>
        <h2 className="screen-heading-title">식단, 운동, 웨어러블 기록</h2>
        <p className="app-summary">
          하루 식단과 활동 데이터를 기록해 대시보드와 AI 조언에 활용합니다.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">기록 날짜</p>
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

      <section className="record-summary-grid">
        <article className="metric-card">
          <p className="summary-card-label">섭취</p>
          <p className="summary-card-value">{totals.intakeCalories} kcal</p>
          <p className="form-helper">식단 기록 {totals.dietCount}개</p>
        </article>
        <article className="metric-card">
          <p className="summary-card-label">소모</p>
          <p className="summary-card-value">{totals.burnedCalories} kcal</p>
          <p className="form-helper">운동 기록 {totals.exerciseCount}개</p>
        </article>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">식단</p>
            <h3 className="section-title">식사 기록 추가</h3>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleDietSubmit}>
          <div className="form-grid">
            <label className="form-field">
              식사 유형
              <select name="mealType" onChange={handleDietChange} value={dietForm.mealType}>
                <option value="BREAKFAST">아침</option>
                <option value="LUNCH">점심</option>
                <option value="DINNER">저녁</option>
                <option value="SNACK">간식</option>
              </select>
            </label>

            <label className="form-field">
              음식 이름
              <input
                name="foodName"
                onChange={handleDietChange}
                placeholder="닭가슴살 샐러드"
                required
                type="text"
                value={dietForm.foodName}
              />
            </label>

            <label className="form-field">
              칼로리
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
            {submittingForm === 'diet' ? '저장 중...' : '식단 저장'}
          </button>
        </form>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">운동</p>
            <h3 className="section-title">운동 기록 추가</h3>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleExerciseSubmit}>
          <div className="form-grid">
            <label className="form-field">
              운동 이름
              <input
                name="exerciseName"
                onChange={handleExerciseChange}
                placeholder="러닝"
                required
                type="text"
                value={exerciseForm.exerciseName}
              />
            </label>

            <label className="form-field">
              운동 시간 (분)
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
              소모 칼로리
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
              출처
              <select name="source" onChange={handleExerciseChange} value={exerciseForm.source}>
                <option value="MANUAL">직접 입력</option>
                <option value="WEARABLE">웨어러블</option>
              </select>
            </label>
          </div>

          <button className="primary-button" disabled={submittingForm === 'exercise'} type="submit">
            {submittingForm === 'exercise' ? '저장 중...' : '운동 저장'}
          </button>
        </form>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">웨어러블</p>
            <h3 className="section-title">웨어러블 데이터 동기화</h3>
          </div>
          <button className="secondary-button" onClick={handleGenerateWearableSample} type="button">
            기기 데이터 불러오기
          </button>
        </div>

        <p className="form-helper">
          기기에서 수집된 걸음 수/심박수/시간을 불러오고, 서버가 소모 칼로리를 계산해 운동 기록으로 변환합니다.
        </p>

        <form className="profile-form" onSubmit={handleWearableSubmit}>
          <div className="form-grid">
            <label className="form-field">
              걸음 수
              <input
                inputMode="numeric"
                min="0"
                name="stepCount"
                placeholder="기기 데이터 불러오기"
                readOnly
                required
                type="number"
                value={wearableForm.stepCount}
              />
            </label>

            <label className="form-field">
              평균 심박수
              <input
                inputMode="numeric"
                min="1"
                name="averageHeartRate"
                placeholder="기기 데이터 불러오기"
                readOnly
                required
                type="number"
                value={wearableForm.averageHeartRate}
              />
            </label>

            <label className="form-field">
              운동 시간 (분)
              <input
                inputMode="numeric"
                min="1"
                name="durationMinutes"
                placeholder="기기 데이터 불러오기"
                readOnly
                required
                type="number"
                value={wearableForm.durationMinutes}
              />
            </label>
          </div>

          <div className="wearable-preview">
            <p className="summary-card-label">서버 변환 미리보기</p>
            <p className="activity-item-meta">
              원시 데이터 저장 → 소모 칼로리 약 {estimatedWearableCalories} kcal 계산 → 출처 WEARABLE 운동 기록 생성
            </p>
          </div>

          <button className="primary-button" disabled={submittingForm === 'wearable' || !hasWearableData} type="submit">
            {submittingForm === 'wearable' ? '동기화 중...' : '웨어러블 동기화'}
          </button>
        </form>

        {lastWearableSync ? (
          <div className="wearable-preview">
            <p className="summary-card-label">마지막 동기화 결과</p>
            <p className="activity-item-meta">
              {lastWearableSync.recordDate} · {lastWearableSync.durationMinutes}분 · {lastWearableSync.processedCaloriesBurned} kcal · 운동 기록 ID {lastWearableSync.exerciseRecordId}
            </p>
          </div>
        ) : null}
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">일일 기록</p>
            <h3 className="section-title">활동 기록</h3>
          </div>
        </div>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {successMessage ? <p className="form-success">{successMessage}</p> : null}

        {isLoading ? <p className="form-helper">기록을 불러오는 중...</p> : null}

        {!isLoading && activities.length === 0 ? (
          <p className="form-helper">선택한 날짜의 기록이 없습니다.</p>
        ) : null}

        <div className="activity-list">
          {activities.map((activity) => (
            <article className="activity-item" key={activity.recordId}>
              <div>
                <p className="activity-item-title">{activity.name}</p>
                <p className="activity-item-meta">
                  {activityTypeLabels[activity.type] ?? activity.type}
                  {activity.mealType ? ` · ${mealTypeLabels[activity.mealType] ?? activity.mealType}` : ''}
                  {activity.source ? ` · ${sourceLabels[activity.source] ?? activity.source}` : ''}
                  {activity.durationMinutes ? ` · ${activity.durationMinutes}분` : ''}
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
