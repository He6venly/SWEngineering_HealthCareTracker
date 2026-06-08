import {
  Bot,
  ChartNoAxesCombined,
  ClipboardList,
  HeartPulse,
  LogOut,
  UserRound,
} from 'lucide-react';

const tabs = [
  { id: 'home', label: '홈', icon: ChartNoAxesCombined },
  { id: 'records', label: '기록', icon: ClipboardList },
  { id: 'advice', label: 'AI 코치', icon: Bot },
  { id: 'profile', label: '프로필', icon: UserRound },
];

function AppLayout({ activeTab, children, currentUser, onLogout, onTabChange }) {
  const nickname = currentUser?.nickname;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <HeartPulse size={22} strokeWidth={2.4} />
          </div>
          <div>
            <p className="app-eyebrow">CWNU 헬스케어</p>
            <h1 className="app-title">
              {nickname ? `${nickname}님, 반갑습니다` : '건강 루틴을 시작해볼까요?'}
            </h1>
          </div>
        </div>
        <button className="header-action" onClick={onLogout} type="button">
          <LogOut aria-hidden="true" size={15} />
          로그아웃
        </button>
      </header>

      <main className="app-content">{children}</main>

      <nav className="bottom-navigation" aria-label="주요 화면">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            className={`bottom-navigation-item${activeTab === id ? ' is-active' : ''}`}
            key={id}
            onClick={() => onTabChange(id)}
            type="button"
          >
            <Icon aria-hidden="true" size={21} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default AppLayout;
