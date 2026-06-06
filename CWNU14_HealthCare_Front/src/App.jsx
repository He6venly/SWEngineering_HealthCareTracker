import { useState } from 'react';
import { clearAccessToken, hasAccessToken } from './api/client.js';
import AppLayout from './components/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

const tabContent = {
  home: {
    label: 'Today',
    value: 'Your health summary',
  },
  records: {
    label: 'Records',
    value: 'Track your daily activity',
  },
  advice: {
    label: 'AI Advice',
    value: 'Personalized guidance',
  },
  profile: {
    label: 'Profile',
    value: 'Manage your health goals',
  },
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [authView, setAuthView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAccessToken());
  const content = tabContent[activeTab];

  const handleLogout = () => {
    clearAccessToken();
    setIsAuthenticated(false);
    setActiveTab('home');
    setAuthView('login');
  };

  if (!isAuthenticated) {
    return (
      <main className="auth-shell">
        {authView === 'login' ? (
          <Login
            onLoginSuccess={() => setIsAuthenticated(true)}
            onSwitchToSignup={() => setAuthView('signup')}
          />
        ) : (
          <Signup
            onSignupSuccess={() => setAuthView('login')}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </main>
    );
  }

  return (
    <AppLayout activeTab={activeTab} onLogout={handleLogout} onTabChange={setActiveTab}>
      <section className="screen-heading">
        <p className="screen-heading-label">{content.label}</p>
        <h2 className="screen-heading-title">{content.value}</h2>
        <p className="app-summary">
          This area is ready for the next feature.
        </p>
      </section>

      <section className="summary-card">
        <p className="summary-card-label">Frontend status</p>
        <p className="summary-card-value">App layout applied</p>
      </section>
    </AppLayout>
  );
}

export default App;
