import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ initialMode, onClose }) {
  const { loginOrRegister } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    setError('');
    firstFieldRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { email, password };
      if (mode === 'register') payload.name = name;
      await loginOrRegister(mode, payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      id="auth-modal"
      onMouseDown={(e) => { if (e.target.id === 'auth-modal') onClose(); }}
    >
      <div className="auth-card modal-card" role="dialog" aria-modal="true" aria-label="Sign in or create an account">
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            role="tab"
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            role="tab"
            onClick={() => setMode('register')}
          >
            Create account
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field" id="field-name">
              <label htmlFor="auth-name">Name</label>
              <input
                ref={firstFieldRef}
                type="text"
                id="auth-name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              ref={mode === 'login' ? firstFieldRef : undefined}
              type="email"
              id="auth-email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              autoComplete="current-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="auth-note">Your data stays on this server. No tracking, no sharing.</p>
      </div>
    </div>
  );
}
