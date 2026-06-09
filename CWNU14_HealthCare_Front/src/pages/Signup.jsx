import { useState } from 'react';
import { checkEmailAvailability, signup } from '../api/auth.js';

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    dataConsentAgreed: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPasswordConfirmFilled = Boolean(form.passwordConfirm);
  const isPasswordMatched = isPasswordConfirmFilled && form.password === form.passwordConfirm;
  const isPasswordMismatched = isPasswordConfirmFilled && form.password !== form.passwordConfirm;

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrorMessage('');
    setSuccessMessage('');

    if (name === 'email') {
      setEmailCheckStatus('idle');
    }
  };

  const handleCheckEmail = async () => {
    if (!form.email.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      setEmailCheckStatus('duplicate');
      return;
    }

    setIsCheckingEmail(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await checkEmailAvailability(form.email.trim());

      if (result.available) {
        setEmailCheckStatus('available');
        setSuccessMessage('사용 가능한 이메일입니다.');
      } else {
        setEmailCheckStatus('duplicate');
        setErrorMessage('이미 가입된 이메일입니다.');
      }
    } catch (error) {
      setEmailCheckStatus('idle');
      setErrorMessage(error.message);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (emailCheckStatus !== 'available') {
      setErrorMessage('이메일 중복 확인을 먼저 진행해주세요.');
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(form);
      onSignupSuccess();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card" aria-labelledby="signup-title">
      <button className="text-button align-start" onClick={onSwitchToLogin} type="button">
        <span className="back-arrow" aria-hidden="true">←</span>
        돌아가기
      </button>

      <div className="auth-heading">
        <p className="app-eyebrow">건강 기록 시작하기</p>
        <h1 id="signup-title" className="app-title">
          회원가입
        </h1>
        <p className="app-summary">
          가입 후 프로필과 활동 기록을 연결해 건강 상태를 확인할 수 있습니다.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          이메일
          <div className="input-action-row">
            <input
              autoComplete="email"
              className={emailCheckStatus === 'duplicate' ? 'is-invalid' : emailCheckStatus === 'available' ? 'is-valid' : ''}
              name="email"
              onChange={handleChange}
              required
              type="email"
              value={form.email}
            />
            <button
              className="secondary-button input-action-button"
              disabled={isCheckingEmail}
              onClick={handleCheckEmail}
              type="button"
            >
              {isCheckingEmail ? '확인 중...' : '중복 확인'}
            </button>
          </div>
        </label>

        <label className="form-field">
          비밀번호
          <input
            autoComplete="new-password"
            className={isPasswordMismatched ? 'is-invalid' : isPasswordMatched ? 'is-valid' : ''}
            name="password"
            onChange={handleChange}
            required
            type="password"
            value={form.password}
          />
        </label>

        <label className="form-field">
          비밀번호 확인
          <input
            autoComplete="new-password"
            className={isPasswordMismatched ? 'is-invalid' : isPasswordMatched ? 'is-valid' : ''}
            name="passwordConfirm"
            onChange={handleChange}
            required
            type="password"
            value={form.passwordConfirm}
          />
        </label>

        <label className="form-field">
          닉네임
          <input
            autoComplete="nickname"
            name="nickname"
            onChange={handleChange}
            required
            type="text"
            value={form.nickname}
          />
        </label>

        <label className="checkbox-field">
          <input
            checked={form.dataConsentAgreed}
            name="dataConsentAgreed"
            onChange={handleChange}
            required
            type="checkbox"
          />
          <span>개인 건강 데이터 수집 및 이용에 동의합니다.</span>
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {successMessage ? <p className="form-success">{successMessage}</p> : null}

        <button className="primary-button" disabled={isSubmitting || emailCheckStatus !== 'available' || isPasswordMismatched} type="submit">
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <button className="text-button" onClick={onSwitchToLogin} type="button">
        이미 계정이 있습니다
      </button>
    </section>
  );
}

export default Signup;
