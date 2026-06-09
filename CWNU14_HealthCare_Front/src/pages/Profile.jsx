import { useEffect, useState } from 'react';
import { deleteCurrentUser, updateCurrentUser } from '../api/auth.js';
import { getProfile, updateProfile } from '../api/profile.js';

const emptyForm = {
  height: '',
  weight: '',
  targetCalories: '',
  targetWeight: '',
};

function toForm(profile, user) {
  return {
    height: profile?.height?.toString() ?? '',
    weight: profile?.weight?.toString() ?? '',
    targetCalories: profile?.targetCalories?.toString() ?? '',
    targetWeight: profile?.targetWeight?.toString() ?? '',
  };
}

function Profile({
  currentUser,
  initialProfile = null,
  isRequired = false,
  onProfileSaved,
  onUserUpdated,
  onAccountDeleted,
}) {
  const [form, setForm] = useState(() => toForm(initialProfile, currentUser));
  const [nicknameInput, setNicknameInput] = useState(currentUser?.nickname ?? '');
  const [profile, setProfile] = useState(initialProfile);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    isRequired ? '처음 이용하려면 건강 프로필을 먼저 입력해 주세요.' : '',
  );
  const [isLoading, setIsLoading] = useState(!initialProfile && !isRequired);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const nickname = currentUser?.nickname ?? '';

  useEffect(() => {
    setNicknameInput(nickname);
  }, [nickname]);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setForm(toForm(initialProfile, currentUser));
      setIsLoading(false);
    }
  }, [currentUser, initialProfile]);

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
        setForm(toForm(loadedProfile, currentUser));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error.errorCode === 'ERR-P001') {
          setProfile(null);
          setForm(toForm(null, currentUser));
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
  }, [currentUser, initialProfile, isRequired]);

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
      const savedData = await updateProfile({
        height: Number(form.height),
        weight: Number(form.weight),
        targetCalories: Number(form.targetCalories),
        targetWeight: Number(form.targetWeight),
      });
      const updatedUser = savedData.user;
      const savedProfile = savedData.profile;

      onUserUpdated?.(updatedUser);
      setProfile(savedProfile);
      setForm(toForm(savedProfile, updatedUser));
      setSuccessMessage('프로필을 저장했습니다.');
      onProfileSaved?.(savedProfile);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNickname = async () => {
    const nextNickname = nicknameInput.trim();

    if (!nextNickname) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    setIsSavingNickname(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedUser = await updateCurrentUser({ nickname: nextNickname });
      onUserUpdated?.(updatedUser);
      setNicknameInput(updatedUser.nickname);
      setIsNicknameModalOpen(false);
      setSuccessMessage('닉네임을 변경했습니다.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteCurrentUser();
      onAccountDeleted?.();
    } catch (error) {
      setErrorMessage(error.message);
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
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

      <section className="summary-card profile-account-card">
        <div>
          <p className="summary-card-label">계정 닉네임</p>
          <h3 className="section-title">{nickname || '닉네임 없음'}</h3>
        </div>
        <div className="profile-account-actions">
          <button
            className="secondary-button"
            onClick={() => {
              setNicknameInput(nickname);
              setIsNicknameModalOpen(true);
            }}
            type="button"
          >
            닉네임 변경
          </button>
          <button
            className="danger-button"
            onClick={() => setIsDeleteModalOpen(true)}
            type="button"
          >
            회원 탈퇴
          </button>
        </div>
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

      {isNicknameModalOpen ? (
        <div className="sleep-modal-backdrop" role="presentation">
          <section className="sleep-modal profile-modal" aria-label="닉네임 변경">
            <div>
              <p className="summary-card-label">닉네임 변경</p>
              <h3 className="section-title">앱에서 표시될 이름을 설정합니다</h3>
            </div>
            <label className="form-field">
              닉네임
              <input
                maxLength={30}
                onChange={(event) => setNicknameInput(event.target.value)}
                placeholder="예) 선호"
                type="text"
                value={nicknameInput}
              />
            </label>
            <div className="sleep-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setIsNicknameModalOpen(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="primary-button"
                disabled={isSavingNickname}
                onClick={handleSaveNickname}
                type="button"
              >
                저장
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div className="sleep-modal-backdrop" role="presentation">
          <section className="sleep-modal profile-modal" aria-label="회원 탈퇴 확인">
            <div>
              <p className="summary-card-label danger-text">회원 탈퇴</p>
              <h3 className="section-title">정말 탈퇴하시겠습니까?</h3>
              <p className="form-helper">
                탈퇴하면 계정, 프로필, 식단, 운동, 물, 수면, AI 대화 기록이 DB에서 삭제됩니다.
              </p>
            </div>
            <div className="sleep-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setIsDeleteModalOpen(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="danger-button filled"
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
                type="button"
              >
                {isDeletingAccount ? '탈퇴 처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default Profile;
