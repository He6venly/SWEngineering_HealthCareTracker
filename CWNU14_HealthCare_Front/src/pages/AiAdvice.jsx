import { useEffect, useState } from 'react';
import { Bot, MessageSquarePlus, RotateCcw, Send, Sparkles } from 'lucide-react';
import { generateAiFeedback, getAiFeedbackHistory } from '../api/ai.js';

const CHAT_STORAGE_KEY = 'aiCoachMessages';
const DATE_STORAGE_KEY = 'aiCoachTargetDate';
const PROMPT_STORAGE_KEY = 'aiCoachDraft';

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
  '기록이 없을 때 식단을 어떻게 시작하면 좋을까?',
];

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '안녕하세요. 조언받을 날짜를 고르고 궁금한 내용을 입력해 주세요. 기록된 식단, 운동, 목표 정보를 바탕으로 답변해드릴게요. 기록이 없는 날이면 먼저 초보자용 기록 방법을 안내해드릴게요.',
  },
];

function readStoredJson(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function hasNoHealthData(feedback) {
  const text = `${feedback?.summary ?? ''} ${feedback?.feedbackText ?? ''}`;
  const zeroKcalCount = (text.match(/0\s*kcal/gi) ?? []).length;
  const hasZeroExercise = /0\s*(분|min)/i.test(text);

  return zeroKcalCount >= 2 && hasZeroExercise;
}

function buildEmptyDataGuide(targetDate) {
  return `${targetDate}에는 아직 식단이나 운동 기록이 없습니다.

맞춤 분석은 기록이 쌓인 뒤 더 정확해지지만, 처음 시작할 때는 이렇게 해보세요.

1. 식단은 한 끼마다 음식 이름과 대략적인 칼로리부터 기록하세요.
2. 접시 기준으로 단백질 1칸, 채소 2칸, 탄수화물 1칸처럼 나누면 시작하기 쉽습니다.
3. 운동은 걷기 20분처럼 부담 없는 활동부터 기록해도 충분합니다.
4. 하루 기록을 남긴 뒤 다시 질문하면 그 데이터를 기준으로 더 구체적으로 조언해드릴게요.`;
}

function AiAdvice() {
  const [targetDate, setTargetDate] = useState(() => window.localStorage.getItem(DATE_STORAGE_KEY) ?? today);
  const [messageText, setMessageText] = useState(
    () => window.localStorage.getItem(PROMPT_STORAGE_KEY) ?? defaultPrompt,
  );
  const [messages, setMessages] = useState(() => readStoredJson(CHAT_STORAGE_KEY, initialMessages));
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

  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    window.localStorage.setItem(DATE_STORAGE_KEY, targetDate);
  }, [targetDate]);

  useEffect(() => {
    window.localStorage.setItem(PROMPT_STORAGE_KEY, messageText);
  }, [messageText]);

  const handleNewChat = () => {
    setMessages(initialMessages);
    setMessageText(defaultPrompt);
    setErrorMessage('');
  };

  const handleLoadFeedback = (feedback) => {
    setTargetDate(feedback.targetDate);
    setMessages([
      ...initialMessages,
      {
        id: `loaded-user-${feedback.feedbackId}`,
        role: 'user',
        content: `${feedback.targetDate} 기록을 다시 보여줘.`,
        meta: feedback.targetDate,
      },
      {
        id: `loaded-assistant-${feedback.feedbackId}`,
        role: 'assistant',
        content: feedback.feedbackText,
        summary: feedback.summary,
        meta: feedback.targetDate,
      },
    ]);
  };

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
      const isEmptyData = hasNoHealthData(feedback);
      const assistantMessage = {
        id: `assistant-${feedback.feedbackId ?? Date.now()}`,
        role: 'assistant',
        content: isEmptyData ? buildEmptyDataGuide(feedback.targetDate) : feedback.feedbackText,
        summary: isEmptyData ? '기록된 건강 데이터가 없습니다.' : feedback.summary,
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
        <p className="screen-heading-label">AI 코치</p>
        <h2 className="screen-heading-title">오늘의 기록을 바탕으로 질문해보세요</h2>
        <p className="app-summary">
          채팅창에 궁금한 점을 입력하면 선택한 날짜의 식단, 운동, 목표 데이터를 기준으로 답변합니다.
        </p>
      </section>

      <section className="summary-card chat-card">
        <div className="chat-card-header">
          <div className="chat-avatar">
            <Bot size={22} />
          </div>
          <div>
            <p className="summary-card-label">CWNU 헬스케어 AI 코치</p>
            <h3 className="section-title">맞춤 건강 상담</h3>
          </div>
          <span className="chat-status">
            <Sparkles size={14} />
            기록 기반 답변
          </span>
        </div>

        <div className="chat-toolbar">
          <button className="secondary-button" onClick={handleNewChat} type="button">
            <MessageSquarePlus aria-hidden="true" size={16} />
            새 대화
          </button>
        </div>

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
              placeholder="예) 오늘 기록에서 부족한 점을 알려줘."
              rows="3"
              value={messageText}
            />
          </label>

          <button className="primary-button chat-send-button" disabled={isGenerating} type="submit">
            {isGenerating ? '답변 중...' : <><Send aria-hidden="true" size={16} /> 전송</>}
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
              <button className="secondary-button inline-action" onClick={() => handleLoadFeedback(feedback)} type="button">
                <RotateCcw aria-hidden="true" size={15} />
                이 조언 불러오기
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default AiAdvice;
