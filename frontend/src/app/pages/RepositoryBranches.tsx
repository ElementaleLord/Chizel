import { Link, useParams } from 'react-router';
import { GitBranch, ChevronRight, Clock } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
// DATA
import { repositoryBranches } from '../data/branches';

import './RepositoryBranches.css';

export function RepositoryBranches() {
  const { owner, repo } = useParams();

  return (
    <div className="branches-container">
      <ChzHeader pageTitle={`${owner} / ${repo}`} />

      <main className="branches-main">
        <div className="branches-wrapper">
          {/* Header */}
          <div className="branches-header">
            <div className="branches-breadcrumb">
              <Link to={`/repository/${owner}/${repo}`} className="branches-breadcrumb-link">
                {owner}/{repo}
              </Link>
              <ChevronRight className="branches-breadcrumb-icon" />
              <span className="branches-breadcrumb-text">Branches</span>
            </div>
            <h1 className="branches-title">Branches</h1>
          </div>

          {/* Branches List */}
          <div className="branches-card">
            {repositoryBranches.map((branch, i) => (
              <div key={i} className="branches-item">
                <div className="branches-item-left">
                  <GitBranch className="branches-icon" />
                  <div className="branches-item-content">
                    <div className="branches-item-name-row">
                      <span className="branches-item-name">{branch.name}</span>
                      {branch.isDefault && (
                        <span className="branches-default-badge">
                          default
                        </span>
                      )}
                    </div>
                    <div className="branches-item-meta">
                      <Clock className="branches-meta-icon" />
                      <span>Updated {branch.updated}</span>
                    </div>
                  </div>
                </div>
                <div className="branches-item-right">
                  {!branch.isDefault && (
                    <div className="branches-stats">
                      {branch.ahead > 0 && (
                        <span className="branches-stat-ahead">{branch.ahead} ahead</span>
                      )}
                      {branch.ahead > 0 && branch.behind > 0 && (
                        <span className="branches-stat-separator">•</span>
                      )}
                      {branch.behind > 0 && (
                        <span className="branches-stat-behind">{branch.behind} behind</span>
                      )}
                    </div>
                  )}
                  <button className="branches-view-btn">
                    View
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