import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/profile.js';

const emptyForm = {
  height: '',
  weight: '',
  targetCalories: '',
  targetWeight: '',
};

function toForm(profile) {
  return {
    height: profile?.height?.toString() ?? '',
    weight: profile?.weight?.toString() ?? '',
    targetCalories: profile?.targetCalories?.toString() ?? '',
    targetWeight: profile?.targetWeight?.toString() ?? '',
  };
}

function Profile({ currentUser, initialProfile = null, isRequired = false, onProfileSaved }) {
  const [form, setForm] = useState(() => toForm(initialProfile));
  const [profile, setProfile] = useState(initialProfile);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    isRequired ? '처음 이용하려면 건강 프로필을 먼저 입력해 주세요.' : '',
  );
  const [isLoading, setIsLoading] = useState(!initialProfile && !isRequired);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nickname = currentUser?.nickname ?? '';

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setForm(toForm(initialProfile));
      setIsLoading(false);
    }
  }, [initialProfile]);

  useEffect(() => {
    if (initialProfile || isRequired) {
      return undefined;
    }

    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const loadedProfile = await getProfile();

        if (!isMounted) {
          return;
        }

        setProfile(loadedProfile);
        setForm(toForm(loadedProfile));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error.errorCode === 'ERR-P001') {
          setProfile(null);
          setForm(emptyForm);
          setSuccessMessage('건강 목표 관리를 시작하려면 프로필을 입력해 주세요.');
        } else {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [initialProfile, isRequired]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const savedProfile = await updateProfile({
        height: Number(form.height),
        weight: Number(form.weight),
        targetCalories: Number(form.targetCalories),
        targetWeight: Number(form.targetWeight),
      });

      setProfile(savedProfile);
      setForm(toForm(savedProfile));
      setSuccessMessage('프로필을 저장했습니다.');
      onProfileSaved?.(savedProfile);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="screen-heading">
        <p className="screen-heading-label">프로필</p>
        <h2 className="screen-heading-title">
          {nickname ? `${nickname}님의 건강 목표` : '건강 목표 관리'}
        </h2>
        <p className="app-summary">
          닉네임과 신체 정보를 확인하고, 목표 칼로리와 목표 몸무게를 설정해 맞춤 기록 기준으로
          사용합니다.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">건강 프로필</p>
            <h3 className="section-title">{profile ? '현재 목표' : '새 프로필 입력'}</h3>
          </div>
        </div>

        {isLoading ? (
          <p className="form-helper">프로필을 불러오는 중...</p>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                이름
                <input readOnly type="text" value={nickname || '회원가입 닉네임을 불러오는 중'} />
              </label>

              <label className="form-field">
                키 (cm)
                <input
                  inputMode="decimal"
                  min="1"
                  name="height"
                  onChange={handleChange}
                  placeholder="예) 175"
                  required
                  step="0.1"
                  type="number"
                  value={form.height}
                />
              </label>

              <label className="form-field">
                몸무게 (kg)
                <input
                  inputMode="decimal"
                  min="1"
                  name="weight"
                  onChange={handleChange}
                  placeholder="예) 70"
                  required
                  step="0.1"
                  type="number"
                  value={form.weight}
                />
              </label>

              <label className="form-field">
                목표 칼로리
                <input
                  inputMode="numeric"
                  min="1"
                  name="targetCalories"
                  onChange={handleChange}
                  placeholder="예) 2200"
                  required
                  step="1"
                  type="number"
                  value={form.targetCalories}
                />
              </label>

              <label className="form-field">
                목표 몸무게 (kg)
                <input
                  inputMode="decimal"
                  min="1"
                  name="targetWeight"
                  onChange={handleChange}
                  placeholder="예) 68"
                  required
                  step="0.1"
                  type="number"
                  value={form.targetWeight}
                />
              </label>
            </div>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
            {successMessage ? <p className="form-success">{successMessage}</p> : null}

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? '저장 중...' : '프로필 저장'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}

export default Profile;
