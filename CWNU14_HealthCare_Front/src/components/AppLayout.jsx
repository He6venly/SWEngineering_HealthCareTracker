import { Bot, ChartNoAxesCombined, ClipboardList, UserRound } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: ChartNoAxesCombined },
  { id: 'records', label: 'Records', icon: ClipboardList },
  { id: 'advice', label: 'AI Advice', icon: Bot },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

function AppLayout({ activeTab, children, onLogout, onTabChange }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Health tracker</p>
          <h1 className="app-title">CWNU14 HealthCare</h1>
        </div>
        <button className="header-action" onClick={onLogout} type="button">
          Logout
        </button>
      </header>

      <main className="app-content">{children}</main>

      <nav className="bottom-navigation" aria-label="Primary navigation">
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
