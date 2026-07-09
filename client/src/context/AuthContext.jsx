import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { request } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bs_token'));
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  // Authenticated fetch wrapper — always uses the latest token.
  const api = useCallback(
    (path, opts = {}) => request(path, { ...opts, token: tokenRef.current }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setBooted(true);
        return;
      }
      try {
        const data = await api('/api/auth/me');
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem('bs_token');
        }
      } finally {
        if (!cancelled) setBooted(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loginOrRegister = useCallback(async (mode, payload) => {
    const data = await request(`/api/auth/${mode}`, { method: 'POST', body: payload });
    localStorage.setItem('bs_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bs_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, booted, api, loginOrRegister, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
