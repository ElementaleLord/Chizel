import { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Star, GitFork, Search } from 'lucide-react';
import { Link } from 'react-router';
import { RepositoryStarButton } from '../components/repository/RepositoryStarButton';
import { useAppState } from '../components/state/AppStateContext';
import { formatStarCount, getLanguageColor, getRepositoriesByIds } from '../data/repositories';

export function Stars() {
  const { starredRepositories } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleRepositoryIds, setVisibleRepositoryIds] = useState<string[]>(() => starredRepositories);
  const starredRepos = useMemo(
    () =>
      getRepositoriesByIds(visibleRepositoryIds).filter((repository) =>
        repository.id.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, visibleRepositoryIds],
  );

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-[#fda410]" />
              <h1 className="text-foreground">Starred repositories</h1>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9d1d9]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search starred repositories..."
                className="w-full pl-9 pr-4 py-2 text-foreground placeholder:text-[#7d8590] bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-4">
            {starredRepos.map((repo) => (
              <div key={repo.id} className="p-5 bg-card border border-border rounded-lg hover:border-border/60 transition-colors">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/repository/${repo.owner}/${repo.name}`}
                      className="text-[#fda410] hover:underline font-medium"
                    >
                      {repo.owner}/{repo.name}
                    </Link>
                    <p className="mt-1 text-sm text-[#c9d1d9]">{repo.description}</p>
                  </div>
                  <RepositoryStarButton
                    isStarred={true}
                    compact
                    onToggle={() =>
                      setVisibleRepositoryIds((current) => current.filter((repositoryId) => repositoryId !== repo.id))
                    }
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#c9d1d9]">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                    <span>{repo.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{formatStarCount(repo.stars)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    <span>{formatStarCount(repo.forks)}</span>
                  </div>
                  <span className="ml-auto">Updated {repo.updated}</span>
                </div>
              </div>
            ))}
            {starredRepos.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
                No starred repositories are visible with the current search or temporary un-star actions.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
