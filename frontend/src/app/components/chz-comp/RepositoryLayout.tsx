import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router';
import { Star, GitFork, Eye, Code, GitPullRequest, FileText, BarChart3, Settings } from 'lucide-react';
import { ensureRepoReady, fetchRepoMeta, toggleRepoStar, toggleRepoWatch, type RepoMeta } from '../../lib/repoApi';

import './RepositoryLayout.css';

export function RepositoryLayout({ children }: { children: React.ReactNode }) {
  const { owner = 'sarahdev', repo = 'web-app' } = useParams();
  const location = useLocation();
  const [repoMeta, setRepoMeta] = useState<RepoMeta | null>(null);
  const [isUpdatingStar, setIsUpdatingStar] = useState(false);
  const [isUpdatingWatch, setIsUpdatingWatch] = useState(false);
  const issuesCount = repoMeta?.stats?.issues ?? 0;
  const pullRequestsCount = repoMeta?.stats?.pullRequests ?? 0;

  const tabs = [
    { id: 'code', label: 'Code', icon: Code, path: `/repository/${owner}/${repo}` },
    { id: 'issues', label: 'Issues', icon: FileText, path: `/repository/${owner}/${repo}/issues`, badge: issuesCount > 0 ? issuesCount : null },
    { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, path: `/repository/${owner}/${repo}/pulls`, badge: pullRequestsCount > 0 ? pullRequestsCount : null },
    { id: 'insights', label: 'Insights', icon: BarChart3, path: `/repository/${owner}/${repo}/insights` },
    { id: 'settings', label: 'Settings', icon: Settings, path: `/repository/${owner}/${repo}/settings` },
  ];

  useEffect(() => {
    let isCancelled = false;

    async function loadRepoMeta() {
      try {
        const repoId = await ensureRepoReady(owner, repo);
        const meta = await fetchRepoMeta(repoId);

        if (!isCancelled) {
          setRepoMeta(meta);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadRepoMeta();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo, location.pathname]);

  const handleToggleStar = async () => {
    if (!repoMeta || isUpdatingStar) {
      return;
    }

    try {
      setIsUpdatingStar(true);
      const stats = await toggleRepoStar(repoMeta.repoId);
      setRepoMeta({ ...repoMeta, stats });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStar(false);
    }
  };

  const handleToggleWatch = async () => {
    if (!repoMeta || isUpdatingWatch) {
      return;
    }

    try {
      setIsUpdatingWatch(true);
      const stats = await toggleRepoWatch(repoMeta.repoId);
      setRepoMeta({ ...repoMeta, stats });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingWatch(false);
    }
  };

  const isCodeRoute =
    location.pathname === `/repository/${owner}/${repo}` ||
    location.pathname.includes('/blob/') ||
    location.pathname.includes('/tree/') ||
    location.pathname.endsWith('/branches') ||
    location.pathname.endsWith('/commits');

  return (
    <div className="repo-layout-container">
      <div className="repo-header">
        <div className="repo-header-wrapper">
          <nav className="repo-tabs-nav">
            {tabs.map((tab) => {
              const isActive = tab.id === 'code'
                ? isCodeRoute
                : location.pathname === tab.path;
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
            <button
              className={`repo-action-btn ${repoMeta?.stats?.viewerIsWatching ? 'is-active' : ''}`}
              onClick={handleToggleWatch}
              disabled={isUpdatingWatch}
              type="button"
            >
              <Eye className="repo-action-icon" />
              {repoMeta?.stats?.viewerIsWatching ? 'Watching' : 'Watch'}
              <span className="repo-action-count">{repoMeta?.stats?.watchers ?? 0}</span>
            </button>
            <button
              className={`repo-action-btn ${repoMeta?.stats?.viewerHasStarred ? 'is-active' : ''}`}
              onClick={handleToggleStar}
              disabled={isUpdatingStar}
              type="button"
            >
              <Star className="repo-action-icon" />
              {repoMeta?.stats?.viewerHasStarred ? 'Starred' : 'Star'}
              <span className="repo-action-count">{repoMeta?.stats?.stars ?? 0}</span>
            </button>
            <button className="repo-action-btn" type="button" disabled>
              <GitFork className="repo-action-icon" />
              Fork
              <span className="repo-action-count">{repoMeta?.stats?.forks ?? 0}</span>
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
