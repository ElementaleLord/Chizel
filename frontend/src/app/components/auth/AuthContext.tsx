import { createContext, useContext, useEffect, useState } from 'react';

interface AuthSession {
  user: User;
  token?: string | null;
}

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'chizel_auth_session';
const LEGACY_USER_STORAGE_KEY = 'chizel_user';
const API_URL = import.meta.env.VITE_API_URL?.trim();

function readStoredSession(): AuthSession | null {
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedSession) {
    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  const legacyUser = localStorage.getItem(LEGACY_USER_STORAGE_KEY);
  if (legacyUser) {
    try {
      const user = JSON.parse(legacyUser) as User;
      return { user, token: null };
    } catch {
      localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    }
  }

  return null;
}

function persistSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_USER_STORAGE_KEY, JSON.stringify(session.user));
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
}

function createMockSession(email: string, username?: string): AuthSession {
  return {
    user: {
      id: `mock-${username ?? email}`,
      email,
      username: username ?? email.split('@')[0],
    },
    token: 'mock-session-token',
  };
}

async function requestAuthSession(
  endpoint: 'signin' | 'signup',
  payload: { email: string; password: string; username?: string },
): Promise<AuthSession> {
  if (API_URL) {
    const response = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(responseBody?.message ?? 'Authentication failed.');
    }

    const user = responseBody.user ?? responseBody.account ?? responseBody.data?.user;
    const token = responseBody.token ?? responseBody.accessToken ?? responseBody.jwt ?? null;

    if (!user?.email || !user?.username) {
      throw new Error('Authentication succeeded, but the user payload was incomplete.');
    }

    return {
      user: {
        id: String(user.id ?? user._id ?? user.username ?? user.email),
        email: user.email,
        username: user.username,
      },
      token,
    };
  }

  if (!payload.email.trim() || !payload.password.trim()) {
    throw new Error('Email and password are required.');
  }

  if (endpoint === 'signup') {
    if (!payload.username?.trim()) {
      throw new Error('Username is required.');
    }
    if (payload.password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
  }

  return createMockSession(payload.email, payload.username);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = readStoredSession();
    if (session?.user) {
      setUser(session.user);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const session = await requestAuthSession('signin', { email, password });
    setUser(session.user);
    persistSession(session);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const session = await requestAuthSession('signup', { email, password, username });
    setUser(session.user);
    persistSession(session);
  };

  const signOut = () => {
    setUser(null);
    clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
