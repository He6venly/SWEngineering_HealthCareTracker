import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquarePlus, RotateCcw, Send, Sparkles, Trash2 } from 'lucide-react';
import {
  createAiConversation,
  deleteAiConversation,
  getAiConversation,
  getAiConversations,
  sendAiConversationMessage,
} from '../api/ai.js';

const DATE_STORAGE_KEY = 'aiCoachTargetDate';
const PROMPT_STORAGE_KEY = 'aiCoachDraft';
const ACTIVE_CONVERSATION_KEY = 'aiCoachActiveConversationId';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const today = formatLocalDate(new Date());
const defaultPrompt = '';

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '안녕하세요. 궁금한 내용을 입력하면 선택한 날짜의 식단, 운동, 목표 정보를 기준으로 답변해드릴게요. 기록이 없는 날이면 처음 시작하는 방법부터 안내해드릴 수 있습니다.',
  },
];

function toChatMessages(apiMessages) {
  if (!apiMessages || apiMessages.length === 0) {
    return initialMessages;
  }

  return apiMessages.map((message) => ({
    id: message.messageId,
    role: message.role,
    content: message.content,
    meta: message.targetDate,
  }));
}

function AiAdvice() {
  const chatEndRef = useRef(null);
  const [targetDate, setTargetDate] = useState(() => window.localStorage.getItem(DATE_STORAGE_KEY) ?? today);
  const [messageText, setMessageText] = useState(
    () => window.localStorage.getItem(PROMPT_STORAGE_KEY) ?? defaultPrompt,
  );
  const [messages, setMessages] = useState(initialMessages);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(
    () => window.localStorage.getItem(ACTIVE_CONVERSATION_KEY) ?? '',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadConversations() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const conversationList = await getAiConversations();
      setConversations(conversationList ?? []);

      if (activeConversationId) {
        const exists = conversationList?.some((conversation) => (
          conversation.conversationId === activeConversationId
        ));

        if (!exists) {
          setActiveConversationId('');
          setMessages(initialMessages);
          return;
        }

        const detail = await getAiConversation(activeConversationId);
        setTargetDate(detail.conversation.targetDate ?? today);
        setMessages(toChatMessages(detail.messages));
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DATE_STORAGE_KEY, targetDate);
  }, [targetDate]);

  useEffect(() => {
    window.localStorage.setItem(PROMPT_STORAGE_KEY, messageText);
  }, [messageText]);

  useEffect(() => {
    if (activeConversationId) {
      window.localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId);
    } else {
      window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  }, [activeConversationId]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ block: 'end' });
    });
  }, [messages, isGenerating]);

  const handleNewChat = () => {
    setActiveConversationId('');
    setMessages(initialMessages);
    setMessageText('');
    setErrorMessage('');
  };

  const handleLoadConversation = async (conversationId) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const detail = await getAiConversation(conversationId);
      setActiveConversationId(detail.conversation.conversationId);
      setTargetDate(detail.conversation.targetDate ?? today);
      setMessages(toChatMessages(detail.messages));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    setErrorMessage('');

    try {
      await deleteAiConversation(conversationId);

      if (activeConversationId === conversationId) {
        handleNewChat();
      }

      await loadConversations();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const ensureConversation = async (prompt) => {
    if (activeConversationId) {
      return activeConversationId;
    }

    const detail = await createAiConversation({
      targetDate,
      title: prompt,
    });
    const conversationId = detail.conversation.conversationId;
    setActiveConversationId(conversationId);

    return conversationId;
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    const prompt = messageText.trim();

    if (!prompt) {
      setErrorMessage('질문 내용을 입력해주세요.');
      return;
    }

    const userMessage = {
      id: `pending-user-${Date.now()}`,
      role: 'user',
      content: prompt,
      meta: targetDate,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessageText('');
    setErrorMessage('');
    setIsGenerating(true);

    try {
      const conversationId = await ensureConversation(prompt);
      const reply = await sendAiConversationMessage(conversationId, {
        targetDate,
        message: prompt,
      });

      const assistantMessage = {
        id: reply.assistantMessage.messageId,
        role: reply.assistantMessage.role,
        content: reply.assistantMessage.content,
        meta: reply.assistantMessage.targetDate,
      };

      setMessages((currentMessages) => [
        ...currentMessages.filter((message) => message.id !== userMessage.id),
        {
          id: reply.userMessage.messageId,
          role: reply.userMessage.role,
          content: reply.userMessage.content,
          meta: reply.userMessage.targetDate,
        },
        assistantMessage,
      ]);
      await loadConversations();
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
          대화 내용을 서버에 저장해두고 다시 불러오거나 이어서 질문할 수 있습니다.
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
            대화 저장
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
                <p className="feedback-text">{message.content}</p>
              </div>
            </article>
          ))}

          {isGenerating ? (
            <article className="chat-message assistant">
              <div className="chat-bubble">
                <p className="chat-meta">AI 코치</p>
                <p className="feedback-text">기록과 이전 대화를 확인하고 답변을 작성하는 중...</p>
              </div>
            </article>
          ) : null}
          <div ref={chatEndRef} />
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
            <h3 className="section-title">최근 AI 상담</h3>
          </div>
        </div>

        {isLoading ? <p className="form-helper">AI 대화 목록을 불러오는 중...</p> : null}
        {!isLoading && conversations.length === 0 ? (
          <p className="form-helper">아직 저장된 AI 대화가 없습니다.</p>
        ) : null}

        <div className="activity-list">
          {conversations.map((conversation) => (
            <article className="feedback-item" key={conversation.conversationId}>
              <div className="feedback-item-header">
                <p className="activity-item-title">{conversation.title}</p>
                <span>{conversation.updatedAt?.slice(0, 10) ?? conversation.targetDate}</span>
              </div>
              <p className="feedback-summary">{conversation.lastMessagePreview}</p>
              <div className="conversation-actions">
                <button
                  className="secondary-button inline-action"
                  onClick={() => handleLoadConversation(conversation.conversationId)}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" size={15} />
                  대화 불러오기
                </button>
                <button
                  className="secondary-button inline-action danger-action"
                  onClick={() => handleDeleteConversation(conversation.conversationId)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={15} />
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default AiAdvice;
