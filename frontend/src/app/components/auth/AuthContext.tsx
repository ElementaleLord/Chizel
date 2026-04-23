import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

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
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim();

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

export async function requestAuthSession(
    endpoint: 'signin' | 'signup',
    payload: { email: string; password: string; username?: string }
): Promise<AuthSession> {

    if(!payload.email.trim() || !payload.password.trim()){
        throw new Error("email and password are required.");
    }

    if(endpoint === 'signup'){
        if(!payload.username?.trim()){
            throw new Error("Username is required.");
        }

        if(payload.password.length < 8){
            throw new Error("Password needs to be at least 8 characters.");
        }
    }

    try{
        const response  = await axios.post(`${API_URL}/auth/${endpoint}`, payload);
        const data = response.data;

        if(!data.user || !data.token){
            throw new Error('Authentication succeeded but the server response was malformed');
        }

        return {
            user: {
                id: String(data.user.id),
                email: data.user.email,
                username: data.user.username,
            },
            token: data.token,
        };

    } catch(error: any) {

        if(error.response && error.response.data && error.response.data.message){
            throw new Error(error.response.data.message);
        }

        throw new Error('Authentication failed. Please check your connection and try again.');
    }
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
