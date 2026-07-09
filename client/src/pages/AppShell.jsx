import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Scan from './Scan.jsx';
import Results from './Results.jsx';
import Saved from './Saved.jsx';
import Profile from './Profile.jsx';

const TABS = [
  { key: 'scan', label: 'Scan menu' },
  { key: 'results', label: 'Results' },
  { key: 'saved', label: 'Saved meals' },
  { key: 'profile', label: 'Profile' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTabState] = useState(user.profile ? 'scan' : 'profile');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  function setActiveTab(tab) {
    setActiveTabState(tab);
    window.scrollTo({ top: 0 });
  }

  function goToResults(analysis) {
    setCurrentAnalysis(analysis);
    setActiveTab('results');
  }

  return (
    <div id="view-app" className="view">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand-mark small">Bite Sense</span>
          <nav className="nav" id="main-nav">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`nav-link${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="topbar-user">
            <span id="user-chip" className="user-chip">{user ? `Hi, ${user.name.split(' ')[0]}` : ''}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="main">
        <section id="tab-scan" className="tab" hidden={activeTab !== 'scan'}>
          <Scan onAnalyzed={goToResults} onGoToProfile={() => setActiveTab('profile')} />
        </section>

        <section id="tab-results" className="tab" hidden={activeTab !== 'results'}>
          <Results analysis={currentAnalysis} onGoToScan={() => setActiveTab('scan')} />
        </section>

        <section id="tab-saved" className="tab" hidden={activeTab !== 'saved'}>
          <Saved />
        </section>

        <section id="tab-profile" className="tab" hidden={activeTab !== 'profile'}>
          <Profile />
        </section>
      </main>

      <footer className="footer">
        <p>Bite Sense estimates nutrition with AI — figures are informed guesses, not lab measurements. Always confirm allergens with the restaurant. Not medical advice.</p>
      </footer>
    </div>
  );
}
