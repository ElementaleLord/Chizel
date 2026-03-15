import { createContext, useContext, useState, ReactNode } from "react";

interface RepositoryContextType {
  starredRepos: Set<string>;
  watchedRepos: Set<string>;
  toggleStar: (repoId: string) => void;
  toggleWatch: (repoId: string) => void;
  isStarred: (repoId: string) => boolean;
  isWatched: (repoId: string) => boolean;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined
);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [starredRepos, setStarredRepos] = useState<Set<string>>(new Set());
  const [watchedRepos, setWatchedRepos] = useState<Set<string>>(new Set());

  const toggleStar = (repoId: string) => {
    setStarredRepos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  };

  const toggleWatch = (repoId: string) => {
    setWatchedRepos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  };

  const isStarred = (repoId: string) => starredRepos.has(repoId);
  const isWatched = (repoId: string) => watchedRepos.has(repoId);

  return (
    <RepositoryContext.Provider
      value={{
        starredRepos,
        watchedRepos,
        toggleStar,
        toggleWatch,
        isStarred,
        isWatched,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error("useRepository must be used within RepositoryProvider");
  }
  return context;
}
