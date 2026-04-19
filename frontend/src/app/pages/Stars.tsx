import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Star, GitFork, Search } from 'lucide-react';
import { Link } from 'react-router';

const starredRepos = [
  {
    name: 'react',
    owner: 'facebook',
    description: 'A declarative, efficient, and flexible JavaScript library for building UIs',
    language: 'JavaScript',
    stars: '220k',
    forks: '45k',
    updated: '1 hour ago',
  },
  {
    name: 'next.js',
    owner: 'vercel',
    description: 'The React Framework for Production',
    language: 'JavaScript',
    stars: '118k',
    forks: '25k',
    updated: '3 hours ago',
  },
  {
    name: 'vscode',
    owner: 'microsoft',
    description: 'Visual Studio Code',
    language: 'TypeScript',
    stars: '156k',
    forks: '28k',
    updated: '5 hours ago',
  },
  {
    name: 'tailwindcss',
    owner: 'tailwindlabs',
    description: 'A utility-first CSS framework',
    language: 'CSS',
    stars: '78k',
    forks: '3.9k',
    updated: '1 day ago',
  },
];

const getLanguageColor = (language: string) => {
  switch (language) {
    case 'TypeScript':
      return 'bg-blue-500';
    case 'JavaScript':
      return 'bg-yellow-500';
    case 'CSS':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export function Stars() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
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
                placeholder="Search starred repositories..."
                className="w-full pl-9 pr-4 py-2 text-foreground placeholder:text-[#7d8590] bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-4">
            {starredRepos.map((repo, i) => (
              <div key={i} className="p-5 bg-card border border-border rounded-lg hover:border-border/60 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Link
                      to={`/repository/${repo.owner}/${repo.name}`}
                      className="text-[#fda410] hover:underline font-medium"
                    >
                      {repo.owner}/{repo.name}
                    </Link>
                    <p className="text-sm text-[#c9d1d9] mt-1">{repo.description}</p>
                  </div>
                  <button className="text-[#fda410] hover:text-[#e38c05]">
                    <Star className="h-5 w-5 fill-current" />
                  </button>
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
