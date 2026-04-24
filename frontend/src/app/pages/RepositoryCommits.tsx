import { Link, useParams } from 'react-router';
import { GitCommit, ChevronRight } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
// DATA
import { repositoryCommits } from '../data/commits';

import './RepositoryCommits.css';

export function RepositoryCommits() {
  const { owner, repo } = useParams();

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
            <h1 className="commits-title">Commit History</h1>
          </div>

          {/* Commits List */}
          <div className="commits-card">
            {repositoryCommits.map((commit, i) => (
              <div key={i} className="commits-item">
                <div className="commits-avatar">
                  {commit.avatar}
                </div>
                <div className="commits-content">
                  <p className="commits-message">{commit.message}</p>
                  <div className="commits-meta">
                    <span>{commit.author}</span>
                    <span className="commits-meta-separator">•</span>
                    <span>{commit.time}</span>
                  </div>
                </div>
                <div className="commits-actions">
                  <code className="commits-hash">
                    {commit.hash}
                  </code>
                  <button className="commits-button">
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