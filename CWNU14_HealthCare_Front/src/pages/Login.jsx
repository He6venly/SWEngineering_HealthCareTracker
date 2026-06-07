import { useState } from 'react';
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
    <section className="auth-card" aria-labelledby="login-title">
      <div className="auth-heading">
        <p className="app-eyebrow">다시 만나서 반가워요</p>
        <h1 id="login-title" className="app-title">
          CWNU14 HealthCare 로그인
        </h1>
        <p className="app-summary">
          계정으로 로그인하면 프로필, 활동 기록, 대시보드, AI 조언을 이어서 사용할 수 있습니다.
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
            autoComplete="current-password"
            name="password"
            onChange={handleChange}
            placeholder="password"
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
        새 계정 만들기
      </button>
    </section>
  );
}

export default Login;
