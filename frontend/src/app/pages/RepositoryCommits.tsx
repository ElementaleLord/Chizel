import { Link, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { GitCommit, ChevronRight } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import {
  ensureRepoReady,
  fetchRepoCommits,
  type RepoCommit,
} from '../lib/repoApi';
import { formatRelativeTime } from '../lib/time';

import './RepositoryCommits.css';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function RepositoryCommits() {
  const { owner, repo } = useParams();
  const [commits, setCommits] = useState<RepoCommit[]>([]);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCommits() {
      try {
        setIsLoading(true);
        setError(null);

        const repoId = await ensureRepoReady(owner || '', repo || '');
        const history = await fetchRepoCommits(repoId);

        if (isCancelled) {
          return;
        }

        setActiveBranch(history.branch);
        setCommits(history.commits);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        console.error(loadError);
        setError(getErrorMessage(loadError, 'Unable to load commit history.'));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCommits();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo]);

  return (
    <div className="commits-container">
      <ChzHeader pageTitle={`${owner} / ${repo}`} />

      <main className="commits-main">
        <div className="commits-wrapper">
          {/* Header */}
          <div className="commits-header">
            <div className="commits-breadcrumb">
              <Link to={`/repository/${owner}/${repo}`} className="commits-breadcrumb-link">
                {owner}/{repo}
              </Link>
              <ChevronRight className="commits-breadcrumb-icon" />
              <span className="commits-breadcrumb-text">Commits</span>
            </div>
            <h1 className="commits-title">
              Commit History{activeBranch ? ` for ${activeBranch}` : ''}
            </h1>
          </div>

          <div className="commits-card">
            {isLoading && (
              <div className="commits-item">
                <div className="commits-content">
                  <p className="commits-message">Loading commit history...</p>
                </div>
              </div>
            )}

            {!isLoading && error && (
              <div className="commits-item">
                <div className="commits-content">
                  <p className="commits-message">{error}</p>
                </div>
              </div>
            )}

            {!isLoading && !error && commits.length === 0 && (
              <div className="commits-item">
                <div className="commits-content">
                  <p className="commits-message">
                    No commits were found for {activeBranch || 'this branch'}.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !error && commits.map((commit) => (
              <div key={commit.id} className="commits-item">
                <div className="commits-avatar">
                  {commit.avatar}
                </div>
                <div className="commits-content">
                  <p className="commits-message">{commit.message}</p>
                  <div className="commits-meta">
                    <span>{commit.author}</span>
                    <span className="commits-meta-separator">•</span>
                    <span>{formatRelativeTime(commit.timestamp)}</span>
                  </div>
                </div>
                <div className="commits-actions">
                  <code className="commits-hash">
                    {commit.shortHash}
                  </code>
                  <button className="commits-button" type="button" disabled>
                    <GitCommit className="commits-button-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
