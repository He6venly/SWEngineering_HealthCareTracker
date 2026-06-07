import { useEffect, useState } from 'react';
import { generateAiFeedback, getAiFeedbackHistory } from '../api/ai.js';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const today = formatLocalDate(new Date());
const defaultPrompt = '오늘 기록을 기준으로 식단과 운동 조언을 해줘.';

const suggestedPrompts = [
  '오늘 칼로리 균형을 쉽게 설명해줘.',
  '내 운동량이 충분한지 알려줘.',
  '내일 실천할 건강 목표를 추천해줘.',
];

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '안녕하세요. 조언받을 날짜를 고르고 궁금한 내용을 입력해 주세요. 기록된 식단, 운동, 목표 정보를 바탕으로 답변해드릴게요.',
  },
];

function AiAdvice() {
  const [targetDate, setTargetDate] = useState(today);
  const [messageText, setMessageText] = useState(defaultPrompt);
  const [messages, setMessages] = useState(initialMessages);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
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

    const prompt = messageText.trim() || defaultPrompt;
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      meta: targetDate,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessageText('');
    setErrorMessage('');
    setIsGenerating(true);

    try {
      const feedback = await generateAiFeedback(targetDate);
      const assistantMessage = {
        id: `assistant-${feedback.feedbackId ?? Date.now()}`,
        role: 'assistant',
        content: feedback.feedbackText,
        summary: feedback.summary,
        meta: feedback.targetDate,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      await loadHistory();
    } catch (error) {
      setErrorMessage(error.message);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `요청을 처리하지 못했습니다. ${error.message}`,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <section className="screen-heading">
        <p className="screen-heading-label">AI 조언</p>
        <h2 className="screen-heading-title">건강 코치와 대화하기</h2>
        <p className="app-summary">
          일반 LLM 채팅처럼 질문을 입력하면 선택한 날짜의 건강 기록을 기준으로 답변을 생성합니다.
        </p>
      </section>

      <section className="summary-card chat-card">
        <div className="chat-thread" aria-live="polite">
          {messages.map((message) => (
            <article className={`chat-message ${message.role}`} key={message.id}>
              <div className="chat-bubble">
                <p className="chat-meta">
                  {message.role === 'user' ? '나' : 'AI 코치'}
                  {message.meta ? <span>{message.meta}</span> : null}
                </p>
                {message.summary ? <p className="feedback-summary">{message.summary}</p> : null}
                <p className="feedback-text">{message.content}</p>
              </div>
            </article>
          ))}

          {isGenerating ? (
            <article className="chat-message assistant">
              <div className="chat-bubble">
                <p className="chat-meta">AI 코치</p>
                <p className="feedback-text">기록을 확인하고 답변을 작성하는 중...</p>
              </div>
            </article>
          ) : null}
        </div>

        <div className="prompt-suggestions" aria-label="추천 질문">
          {suggestedPrompts.map((prompt) => (
            <button
              className="prompt-chip"
              key={prompt}
              onClick={() => setMessageText(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form className="chat-composer" onSubmit={handleGenerate}>
          <label className="form-field chat-date-field">
            기준 날짜
            <input
              name="targetDate"
              onChange={(event) => setTargetDate(event.target.value)}
              required
              type="date"
              value={targetDate}
            />
          </label>

          <label className="chat-text-field">
            <span>질문 입력</span>
            <textarea
              name="messageText"
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="예: 오늘 기록에서 부족한 점을 알려줘."
              rows="3"
              value={messageText}
            />
          </label>

          <button className="primary-button chat-send-button" disabled={isGenerating} type="submit">
            {isGenerating ? '답변 중...' : '전송'}
          </button>
        </form>
      </section>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <section className="summary-card">
        <div className="section-heading">
          <div>
            <p className="summary-card-label">이전 대화</p>
            <h3 className="section-title">최근 AI 조언</h3>
          </div>
        </div>

        {isLoading ? <p className="form-helper">AI 조언 기록을 불러오는 중...</p> : null}
        {!isLoading && history.length === 0 ? (
          <p className="form-helper">아직 생성된 AI 조언이 없습니다.</p>
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
