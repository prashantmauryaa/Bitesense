import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import AppShell from './pages/AppShell.jsx';
import AuthModal from './components/AuthModal.jsx';

export default function App() {
  const { user } = useAuth();
  const [authModalMode, setAuthModalMode] = useState(null); // null | 'login' | 'register'

  return (
    <>
      {user ? (
        <AppShell />
      ) : (
        <Landing onOpenAuth={(mode) => setAuthModalMode(mode)} />
      )}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
        />
      )}
    </>
  );
}
