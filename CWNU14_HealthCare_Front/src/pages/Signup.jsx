import { useState } from 'react';
import { signup } from '../api/auth.js';

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
      <div className="auth-heading">
        <p className="app-eyebrow">Start tracking</p>
        <h1 id="signup-title" className="app-title">
          Create your account
        </h1>
        <p className="app-summary">
          Profile and activity data will be connected after sign in.
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
          Nickname
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
          <span>I agree to data collection and use.</span>
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <button className="text-button" onClick={onSwitchToLogin} type="button">
        Already have an account
      </button>
    </section>
  );
}

export default Signup;
