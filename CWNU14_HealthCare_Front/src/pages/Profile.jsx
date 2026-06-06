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

function Profile() {
  const [form, setForm] = useState(emptyForm);
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
          setSuccessMessage('Enter your health profile to start tracking goals.');
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
  }, []);

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
      setSuccessMessage('Profile saved.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="screen-heading">
        <p className="screen-heading-label">Profile</p>
        <h2 className="screen-heading-title">Manage your health goals</h2>
        <p className="app-summary">
          Set your body metrics and goals for activity tracking and dashboard summaries.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Health profile</p>
            <h3 className="section-title">{profile ? 'Current goals' : 'New profile'}</h3>
          </div>
        </div>

        {isLoading ? (
          <p className="form-helper">Loading profile...</p>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                Height (cm)
                <input
                  inputMode="decimal"
                  min="1"
                  name="height"
                  onChange={handleChange}
                  placeholder="175"
                  required
                  step="0.1"
                  type="number"
                  value={form.height}
                />
              </label>

              <label className="form-field">
                Weight (kg)
                <input
                  inputMode="decimal"
                  min="1"
                  name="weight"
                  onChange={handleChange}
                  placeholder="70"
                  required
                  step="0.1"
                  type="number"
                  value={form.weight}
                />
              </label>

              <label className="form-field">
                Target calories
                <input
                  inputMode="numeric"
                  min="1"
                  name="targetCalories"
                  onChange={handleChange}
                  placeholder="2200"
                  required
                  step="1"
                  type="number"
                  value={form.targetCalories}
                />
              </label>

              <label className="form-field">
                Target weight (kg)
                <input
                  inputMode="decimal"
                  min="1"
                  name="targetWeight"
                  onChange={handleChange}
                  placeholder="68"
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
              {isSubmitting ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}

export default Profile;
