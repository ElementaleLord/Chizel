import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GitBranch, Star, GitFork, Search, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

const repositories = [
  {
    name: 'web-app',
    description: 'A modern web application built with React and TypeScript',
    language: 'TypeScript',
    stars: 248,
    forks: 45,
    updated: '2 hours ago',
    visibility: 'Public',
  },
  {
    name: 'api-server',
    description: 'RESTful API server with Node.js and Express',
    language: 'JavaScript',
    stars: 156,
    forks: 32,
    updated: '1 day ago',
    visibility: 'Public',
  },
  {
    name: 'design-system',
    description: 'Component library for building consistent UIs',
    language: 'TypeScript',
    stars: 892,
    forks: 124,
    updated: '3 days ago',
    visibility: 'Public',
  },
  {
    name: 'mobile-app',
    description: 'Cross-platform mobile app with React Native',
    language: 'TypeScript',
    stars: 421,
    forks: 78,
    updated: '5 days ago',
    visibility: 'Private',
  },
];

const getLanguageColor = (language: string) => {
  switch (language) {
    case 'TypeScript':
      return 'bg-blue-500';
    case 'JavaScript':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export function Repositories() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-foreground">Repositories</h1>
            <Link
              to="/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New repository
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9d1d9]" />
              <input
                type="text"
                placeholder="Find a repository..."
                className="w-full pl-9 pr-4 py-2 text-foreground placeholder:text-[#7d8590] bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-[#ff8c42] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('public')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  filter === 'public'
                    ? 'bg-[#ff8c42] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setFilter('private')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  filter === 'private'
                    ? 'bg-[#ff8c42] text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Private
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {repositories.map((repo, i) => (
              <div key={i} className="p-5 bg-card border border-border rounded-lg hover:border-border/60 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/repository/sarahdev/${repo.name}`}
                        className="text-[#ff8c42] hover:underline font-medium"
                      >
                        {repo.name}
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
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    <span>{repo.forks}</span>
                  </div>
                  <span className="ml-auto">Updated {repo.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
