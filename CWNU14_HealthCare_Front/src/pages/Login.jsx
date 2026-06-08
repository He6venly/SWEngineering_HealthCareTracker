import { useState } from 'react';
import { HeartPulse, ShieldCheck } from 'lucide-react';
import { login } from '../api/auth.js';

function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      await login(form);
      onLoginSuccess();
    } catch (error) {
      setErrorMessage(error.message);
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
        <div className="mini-chart">
          <span style={{ height: '42%' }} />
          <span style={{ height: '68%' }} />
          <span style={{ height: '54%' }} />
          <span style={{ height: '82%' }} />
          <span style={{ height: '60%' }} />
          <span style={{ height: '74%' }} />
          <span style={{ height: '88%' }} />
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

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          이메일
          <input
            autoComplete="email"
            name="email"
            onChange={handleChange}
            placeholder="예) sunho@example.com"
            required
            type="email"
            value={form.email}
          />
        </label>

        <label className="form-field">
          비밀번호
          <input
            autoComplete="current-password"
            name="password"
            onChange={handleChange}
            placeholder="예) password123"
            required
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
        처음 오셨나요? 새 계정 만들기
      </button>
    </section>
  );
}

export default Login;
