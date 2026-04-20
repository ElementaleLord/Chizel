import { Link, useParams, useLocation } from 'react-router';
import { Star, GitFork, Eye, Code, GitPullRequest, FileText, BarChart3, Settings } from 'lucide-react';

export function RepositoryLayout({ children }: { children: React.ReactNode }) {
  const { owner = 'sarahdev', repo = 'web-app' } = useParams();
  const location = useLocation();

  const tabs = [
    { id: 'code', label: 'Code', icon: Code, path: `/repository/${owner}/${repo}` },
    { id: 'issues', label: 'Issues', icon: FileText, path: `/repository/${owner}/${repo}/issues`, badge: 12 },
    { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: `/repository/${owner}/${repo}/pulls`, badge: 3 },
    { id: 'insights', label: 'Insights', icon: BarChart3, path: `/repository/${owner}/${repo}/insights` },
    { id: 'settings', label: 'Settings', icon: Settings, path: `/repository/${owner}/${repo}/settings` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-ring hover:underline">
                {owner}
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-foreground">{repo}</h1>
              <span className="px-2 py-0.5 text-xs border border-border text-foreground rounded-full">
                Public
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground border border-border rounded-md hover:bg-secondary transition-colors">
                <Eye className="h-4 w-4" />
                Watch
                <span className="px-1.5 py-0.5 bg-secondary rounded-full text-xs text-foreground">12</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground border border-border rounded-md hover:bg-secondary transition-colors">
                <Star className="h-4 w-4" />
                Star
                <span className="px-1.5 py-0.5 bg-secondary rounded-full text-xs text-foreground">248</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground border border-border rounded-md hover:bg-secondary transition-colors">
                <GitFork className="h-4 w-4" />
                Fork
                <span className="px-1.5 py-0.5 bg-secondary rounded-full text-xs text-foreground">45</span>
              </button>
            </div>
          </div>

          <nav className="flex gap-4 text-sm">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center gap-2 px-1 py-2 border-b-2 transition-colors ${
                    isActive
                      ? 'border-orange text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 bg-secondary text-foreground rounded-full text-xs">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
