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
        <p className="app-eyebrow">Welcome back</p>
        <h1 id="login-title" className="app-title">
          Sign in to CWNU14 HealthCare
        </h1>
        <p className="app-summary">
          Use your account to sync profile, activity records, dashboard stats,
          and AI feedback.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          Email
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
          Password
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
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <button className="text-button" onClick={onSwitchToSignup} type="button">
        Create a new account
      </button>
    </section>
  );
}

export default Login;
