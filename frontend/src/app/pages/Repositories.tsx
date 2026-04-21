import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Star, GitFork, Search, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useMemo, useState } from 'react';
import { formatStarCount, getLanguageColor, getRepositoriesByIds, userRepositoryIds } from '../data/repositories';

export function Repositories() {
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const repositories = getRepositoriesByIds(userRepositoryIds);
  const languageOptions = useMemo(
    () => ['all', ...new Set(repositories.map((repository) => repository.language))],
    [repositories],
  );
  const filteredRepositories = repositories.filter((repository) => {
    const matchesVisibility =
      visibilityFilter === 'all' || repository.visibility.toLowerCase() === visibilityFilter;
    const matchesSearch = `${repository.owner}/${repository.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || repository.language === languageFilter;
    return matchesVisibility && matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-foreground">Repositories</h1>
            <button
              type="button"
              className="flex cursor-not-allowed items-center gap-2 rounded-md bg-[#fda410]/70 px-4 py-2 text-white"
              title="New repository flow is not wired up yet."
            >
              <Plus className="h-4 w-4" />
              New repository
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9d1d9]" />
              <input
                type="text"
                placeholder="Find a repository..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-9 pr-4 py-2 text-foreground placeholder:text-[#7d8590] bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVisibilityFilter('all')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  visibilityFilter === 'all'
                    ? 'bg-[#fda410] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setVisibilityFilter('public')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  visibilityFilter === 'public'
                    ? 'bg-[#fda410] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setVisibilityFilter('private')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  visibilityFilter === 'private'
                    ? 'bg-[#fda410] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Private
              </button>
              <select
                value={languageFilter}
                onChange={(event) => setLanguageFilter(event.target.value)}
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All languages' : option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRepositories.map((repo) => (
              <div key={repo.id} className="p-5 bg-card border border-border rounded-lg hover:border-border/60 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/repository/${repo.owner}/${repo.name}`}
                        className="text-[#fda410] hover:underline font-medium"
                      >
                        {repo.owner}/{repo.name}
                      </Link>
                      <span className="px-2 py-0.5 text-xs border border-border text-foreground rounded-full">
                        {repo.visibility}
                      </span>
                    </div>
                    <p className="text-sm text-[#c9d1d9]">{repo.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-[#c9d1d9]">
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
                    <span>{repo.forks}</span>
                  </div>
                  <span className="ml-auto">Updated {repo.updated}</span>
                </div>
              </div>
            ))}
            {filteredRepositories.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
                No repositories match the current filters.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
