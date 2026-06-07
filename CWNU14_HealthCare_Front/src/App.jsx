import { useState } from 'react';
import { clearAccessToken, hasAccessToken } from './api/client.js';
import AppLayout from './components/AppLayout.jsx';
import ActivityForm from './pages/ActivityForm.jsx';
import AiAdvice from './pages/AiAdvice.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Signup from './pages/Signup.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [authView, setAuthView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAccessToken());

  const handleLogout = () => {
    clearAccessToken();
    setIsAuthenticated(false);
    setActiveTab('home');
    setAuthView('login');
  };

  const renderActiveTab = () => {
    if (activeTab === 'home') {
      return <Dashboard />;
    }

    if (activeTab === 'records') {
      return <ActivityForm />;
    }

    if (activeTab === 'advice') {
      return <AiAdvice />;
    }

    if (activeTab === 'profile') {
      return <Profile />;
    }

    return <Dashboard />;
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
      {renderActiveTab()}
    </AppLayout>
  );
}

export default App;
