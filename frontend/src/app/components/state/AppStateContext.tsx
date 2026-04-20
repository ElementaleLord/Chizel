import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CLOCK_FORMAT_STORAGE_KEY = 'chizel_clock_use_24_hour';
const STARRED_REPOSITORIES_STORAGE_KEY = 'chizel_starred_repositories';
const DEFAULT_STARRED_REPOSITORIES = [
  'facebook/react',
  'vercel/next.js',
  'microsoft/vscode',
  'tailwindlabs/tailwindcss',
];

interface AppStateContextType {
  starredRepositories: string[];
  toggleStarredRepository: (repositoryId: string) => void;
  isRepositoryStarred: (repositoryId: string) => boolean;
  use24HourTime: boolean;
  setUse24HourTime: (nextValue: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

function readStoredStarredRepositories() {
  const storedValue = localStorage.getItem(STARRED_REPOSITORIES_STORAGE_KEY);
  if (!storedValue) {
    return DEFAULT_STARRED_REPOSITORIES;
  }

  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : DEFAULT_STARRED_REPOSITORIES;
  } catch {
    return DEFAULT_STARRED_REPOSITORIES;
  }
}

function readStoredClockPreference() {
  return localStorage.getItem(CLOCK_FORMAT_STORAGE_KEY) === 'true';
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [starredRepositories, setStarredRepositories] = useState<string[]>(DEFAULT_STARRED_REPOSITORIES);
  const [use24HourTime, setUse24HourTime] = useState(false);

  useEffect(() => {
    setStarredRepositories(readStoredStarredRepositories());
    setUse24HourTime(readStoredClockPreference());
  }, []);

  useEffect(() => {
    localStorage.setItem(STARRED_REPOSITORIES_STORAGE_KEY, JSON.stringify(starredRepositories));
  }, [starredRepositories]);

  useEffect(() => {
    localStorage.setItem(CLOCK_FORMAT_STORAGE_KEY, String(use24HourTime));
  }, [use24HourTime]);

  const value = useMemo<AppStateContextType>(() => ({
    starredRepositories,
    toggleStarredRepository: (repositoryId: string) => {
      setStarredRepositories((current) =>
        current.includes(repositoryId)
          ? current.filter((item) => item !== repositoryId)
          : [...current, repositoryId],
      );
    },
    isRepositoryStarred: (repositoryId: string) => starredRepositories.includes(repositoryId),
    use24HourTime,
    setUse24HourTime,
  }), [starredRepositories, use24HourTime]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
