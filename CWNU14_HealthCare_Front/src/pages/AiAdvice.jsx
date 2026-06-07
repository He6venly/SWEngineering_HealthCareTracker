import { useEffect, useState } from 'react';
import { generateAiFeedback, getAiFeedbackHistory } from '../api/ai.js';

const today = new Date().toISOString().slice(0, 10);

function AiAdvice() {
  const [targetDate, setTargetDate] = useState(today);
  const [history, setHistory] = useState([]);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadHistory() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const feedbackHistory = await getAiFeedbackHistory();
      setHistory(feedbackHistory ?? []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsGenerating(true);

    try {
      const feedback = await generateAiFeedback(targetDate);
      setLatestFeedback(feedback);
      setSuccessMessage('AI feedback generated.');
      await loadHistory();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <section className="screen-heading">
        <p className="screen-heading-label">AI Advice</p>
        <h2 className="screen-heading-title">Personalized guidance</h2>
        <p className="app-summary">
          Generate feedback from your daily dashboard data and review recent advice.
        </p>
      </section>

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">Feedback target</p>
            <h3 className="section-title">{targetDate}</h3>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleGenerate}>
          <label className="form-field">
            Target date
            <input
              name="targetDate"
              onChange={(event) => setTargetDate(event.target.value)}
              required
              type="date"
              value={targetDate}
            />
          </label>

          <button className="primary-button" disabled={isGenerating} type="submit">
            {isGenerating ? 'Generating...' : 'Generate feedback'}
          </button>
        </form>
      </section>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      {latestFeedback ? (
        <section className="summary-card">
          <div className="section-heading">
            <div>
              <p className="summary-card-label">Latest feedback</p>
              <h3 className="section-title">{latestFeedback.targetDate}</h3>
            </div>
          </div>

          <p className="feedback-summary">{latestFeedback.summary}</p>
          <p className="feedback-text">{latestFeedback.feedbackText}</p>
        </section>
      ) : null}

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">History</p>
            <h3 className="section-title">Recent feedback</h3>
          </div>
        </div>

        {isLoading ? <p className="form-helper">Loading feedback history...</p> : null}
        {!isLoading && history.length === 0 ? (
          <p className="form-helper">No AI feedback history yet.</p>
        ) : null}

        <div className="activity-list">
          {history.map((feedback) => (
            <article className="feedback-item" key={feedback.feedbackId}>
              <div className="feedback-item-header">
                <p className="activity-item-title">{feedback.targetDate}</p>
                <span>{feedback.createdAt?.slice(0, 10)}</span>
              </div>
              <p className="feedback-summary">{feedback.summary}</p>
              <p className="feedback-text">{feedback.feedbackText}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default AiAdvice;
