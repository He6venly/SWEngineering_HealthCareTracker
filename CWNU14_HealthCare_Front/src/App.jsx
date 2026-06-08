import { useEffect, useState } from 'react';
import { clearAccessToken, hasAccessToken } from './api/client.js';
import { getCurrentUser } from './api/auth.js';
import { getProfile } from './api/profile.js';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileRequired, setProfileRequired] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountState() {
      if (!isAuthenticated) {
        setCurrentUser(null);
        setCurrentProfile(null);
        setProfileRequired(false);
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setCurrentUser(user);
        setShowWelcome(true);

        try {
          const profile = await getProfile();

          if (!isMounted) {
            return;
          }

          setCurrentProfile(profile);
          setProfileRequired(false);
        } catch (error) {
          if (!isMounted) {
            return;
          }

          if (error.errorCode === 'ERR-P001') {
            setCurrentProfile(null);
            setProfileRequired(true);
            setActiveTab('profile');
          }
        }
      } catch {
        if (isMounted) {
          clearAccessToken();
          setCurrentUser(null);
          setCurrentProfile(null);
          setProfileRequired(false);
          setIsAuthenticated(false);
          setAuthView('login');
        }
      }
    }

    loadAccountState();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!showWelcome) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowWelcome(false);
    }, 2300);

    return () => window.clearTimeout(timer);
  }, [showWelcome]);

  const handleLogout = () => {
    clearAccessToken();
    setCurrentUser(null);
    setCurrentProfile(null);
    setProfileRequired(false);
    setIsAuthenticated(false);
    setActiveTab('home');
    setAuthView('login');
  };

  const handleProfileSaved = (profile) => {
    setCurrentProfile(profile);
    setProfileRequired(false);
    setActiveTab('home');
  };

  const handleTabChange = (tab) => {
    if (profileRequired && tab !== 'profile') {
      setActiveTab('profile');
      return;
    }

    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    if (activeTab === 'home') {
      return <Dashboard currentUser={currentUser} />;
    }

    if (activeTab === 'records') {
      return <ActivityForm />;
    }

    if (activeTab === 'advice') {
      return <AiAdvice />;
    }

    if (activeTab === 'profile') {
      return (
        <Profile
          currentUser={currentUser}
          initialProfile={currentProfile}
          isRequired={profileRequired}
          onProfileSaved={handleProfileSaved}
        />
      );
    }

    return <Dashboard currentUser={currentUser} />;
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
    <>
      {showWelcome && currentUser ? (
        <div className="welcome-overlay" aria-live="polite">
          <div className="welcome-panel">
            <p>환영합니다</p>
            <strong>{currentUser.nickname}님, 오늘도 건강한 하루를 시작해볼까요?</strong>
          </div>
        </div>
      ) : null}

      <AppLayout
        activeTab={activeTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onTabChange={handleTabChange}
      >
        {renderActiveTab()}
      </AppLayout>
    </>
  );
}

export default App;
