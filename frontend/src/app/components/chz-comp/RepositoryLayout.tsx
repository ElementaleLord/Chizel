import { Link, useParams, useLocation } from 'react-router';
import { Star, GitFork, Eye, Code, GitPullRequest, FileText, BarChart3, Settings } from 'lucide-react';

import './RepositoryLayout.css';

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
    <div className="repo-layout-container">
      <div className="repo-header">
        <div className="repo-header-wrapper">
          <nav className="repo-tabs-nav">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`repo-tab-link ${isActive ? 'active' : ''}`}
                >
                  <tab.icon className="repo-tab-icon" />
                  {tab.label}
                  {tab.badge && (
                    <span className="repo-tab-badge">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="repo-actions">
            <button className="repo-action-btn">
              <Eye className="repo-action-icon" />
              Watch
              <span className="repo-action-count">12</span>
            </button>
            <button className="repo-action-btn">
              <Star className="repo-action-icon" />
              Star
              <span className="repo-action-count">248</span>
            </button>
            <button className="repo-action-btn">
              <GitFork className="repo-action-icon" />
              Fork
              <span className="repo-action-count">45</span>
            </button>
          </div>
        </div>
      </div>

      <div className="repo-content">
        {children}
      </div>
    </div>
  );
}