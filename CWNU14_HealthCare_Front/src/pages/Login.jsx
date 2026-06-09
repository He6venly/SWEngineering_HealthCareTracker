import { useState } from 'react';
import { HeartPulse, ShieldCheck } from 'lucide-react';
import { login } from '../api/auth.js';
import cwnuLogo from '../assets/cwnu-logo.png';
import healthcareLogo from '../assets/healthcare-logo.png';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [invalidFields, setInvalidFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setInvalidFields({});
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const email = form.email.trim();
    const nextInvalidFields = {};

    if (!email) {
      nextInvalidFields.email = true;
      setErrorMessage('이메일을 입력해주세요.');
    } else if (!EMAIL_PATTERN.test(email)) {
      nextInvalidFields.email = true;
      setErrorMessage('이메일 형식이 올바르지 않습니다.');
    } else if (!form.password) {
      nextInvalidFields.password = true;
      setErrorMessage('비밀번호를 입력해주세요.');
    }

    if (Object.keys(nextInvalidFields).length > 0) {
      setInvalidFields(nextInvalidFields);
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password: form.password });
      onLoginSuccess();
    } catch (error) {
      setErrorMessage(error.message);
      setInvalidFields({
        email: true,
        password: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card auth-card-hero" aria-labelledby="login-title">
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-header">
          <HeartPulse size={24} strokeWidth={2.4} />
          <span>오늘의 건강 체크</span>
        </div>
        <div className="auth-wellness-visual">
          <div className="auth-brand-row">
            <img alt="국립창원대학교" className="auth-brand-cwnu" src={cwnuLogo} />
            <span className="auth-brand-divider" />
            <img alt="헬스케어" className="auth-brand-healthcare" src={healthcareLogo} />
          </div>
        </div>
        <div className="auth-visual-grid single">
          <span>
            <ShieldCheck size={16} />
            AI 코치
          </span>
        </div>
      </div>

      <div className="auth-heading">
        <p className="app-eyebrow">환영합니다</p>
        <h1 id="login-title" className="app-title auth-title">
          CWNU 헬스케어에 로그인하세요
        </h1>
        <p className="app-summary">
          식단, 운동, 목표 변화를 한곳에서 기록하고 AI 코치에게 맞춤 조언을 받아보세요.
        </p>
      </div>

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <label className="form-field">
          이메일
          <input
            autoComplete="email"
            className={invalidFields.email ? 'is-invalid' : ''}
            name="email"
            onChange={handleChange}
            placeholder="예) sunho@example.com"
            type="email"
            value={form.email}
          />
        </label>

        <label className="form-field">
          비밀번호
          <input
            autoComplete="current-password"
            className={invalidFields.password ? 'is-invalid' : ''}
            name="password"
            onChange={handleChange}
            type="password"
            value={form.password}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <button className="text-button" onClick={onSwitchToSignup} type="button">
        <span>처음 오셨나요?</span>
        <strong>회원가입하기</strong>
      </button>
    </section>
  );
}

export default Login;
