import { useState } from 'react';
import AppLayout from './components/AppLayout.jsx';

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
  const content = tabContent[activeTab];

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
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
