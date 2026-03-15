import { createContext, useContext, useState } from "react";

const RepositoryContext = createContext(undefined);

export function RepositoryProvider({ children }) {
  const [starredRepos, setStarredRepos] = useState(new Set());
  const [watchedRepos, setWatchedRepos] = useState(new Set());

  const toggleStar = (repoId) => {
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

  const toggleWatch = (repoId) => {
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

  const isStarred = (repoId) => starredRepos.has(repoId);
  const isWatched = (repoId) => watchedRepos.has(repoId);

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
