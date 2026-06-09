import { useState } from 'react';
import { signup } from '../api/auth.js';
import cwnuLogo from '../assets/cwnu-logo.png';

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nickname: '',
    dataConsentAgreed: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
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
        로그인으로 돌아가기
      </button>

      <div className="auth-heading">
        <div className="auth-logo-strip compact">
          <img alt="국립창원대학교" src={cwnuLogo} />
        </div>
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
          <input
            autoComplete="email"
            name="email"
            onChange={handleChange}
            placeholder="tester@example.com"
            required
            type="email"
            value={form.email}
          />
        </label>

        <label className="form-field">
          비밀번호
          <input
            autoComplete="new-password"
            name="password"
            onChange={handleChange}
            placeholder="password"
            required
            type="password"
            value={form.password}
          />
        </label>

        <label className="form-field">
          닉네임
          <input
            autoComplete="nickname"
            name="nickname"
            onChange={handleChange}
            placeholder="tester"
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

        <button className="primary-button" disabled={isSubmitting} type="submit">
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
