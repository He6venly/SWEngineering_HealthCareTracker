import { Bot, ChartNoAxesCombined, ClipboardList, UserRound } from 'lucide-react';

const tabs = [
  { id: 'home', label: '홈', icon: ChartNoAxesCombined },
  { id: 'records', label: '기록', icon: ClipboardList },
  { id: 'advice', label: 'AI 조언', icon: Bot },
  { id: 'profile', label: '프로필', icon: UserRound },
];

function AppLayout({ activeTab, children, onLogout, onTabChange }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">건강 관리</p>
          <h1 className="app-title">CWNU14 HealthCare</h1>
        </div>
        <button className="header-action" onClick={onLogout} type="button">
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
