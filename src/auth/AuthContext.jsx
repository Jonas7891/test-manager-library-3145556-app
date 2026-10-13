import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setOnUnauthorized, setToken } from '../api/client.js';

const AuthContext = createContext(null);
const KEY = 'manager-library-session';

function load() {
  try {
    const session = JSON.parse(sessionStorage.getItem(KEY));
    return session && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(load);
  setToken(session?.token ?? null);

  const logout = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setToken(null);
    setSession(null);
  }, []);

  useEffect(() => setOnUnauthorized(logout), [logout]);

  const login = useCallback(async (username, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { username, password } });
    const next = {
      token: data.access_token,
      role: data.role,
      username: username.trim().toLowerCase(),
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    sessionStorage.setItem(KEY, JSON.stringify(next));
    setToken(next.token);
    setSession(next);
  }, []);

  const value = useMemo(
    () => ({ session, login, logout, isAdmin: session?.role === 'admin' }),
    [session, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
