import { useParams, Link } from 'react-router';
import { CircleDot, MessageSquare, Check, Plus, Search, ChevronRight } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
// DATA
import { issues } from '../data/issues';

import './RepositoryIssues.css';

export function RepositoryIssues() {
  const { owner, repo } = useParams();

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <div className="issues-wrapper">
          <div className="issues-container">
            <div className="issues-header">
              <div className="issues-breadcrumb">
                <Link to={`/repository/${owner}/${repo}`} className="issues-breadcrumb-link">
                  {owner}/{repo}
                </Link>
                <ChevronRight className="issues-breadcrumb-icon" />
                <span className="issues-breadcrumb-text">Issues</span>
              </div>
              <div className="issues-title-section">
                <h1 className="issues-title">Issues</h1>
                <button className="issues-new-btn">
                  <Plus className="issues-new-btn-icon" />
                  New Issue
                </button>
              </div>
            </div>

            <div className="issues-search-section">
              <div className="issues-search-wrapper">
                <Search className="issues-search-icon" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="issues-search-input"
                />
              </div>
            </div>

            <div className="issues-filters">
              <button className="issues-filter-btn issues-filter-btn-active">
                Open (2)
              </button>
              <button className="issues-filter-btn issues-filter-btn-inactive">
                Closed (1)
              </button>
            </div>

            <div className="issues-list">
              {issues.map((issue, i) => (
                <div key={i} className="issues-item">
                  <div className="issues-status-icon">
                    <div className={`issues-status-icon-container ${issue.status === 'open' ? 'issues-status-open' : 'issues-status-closed'}`}>
                      {issue.status === 'open' ? (
                        <CircleDot className="issues-status-open-icon" />
                      ) : (
                        <Check className="issues-status-closed-icon" />
                      )}
                    </div>
                  </div>
                  <div className="issues-content">
                    <h3 className="issues-item-title">
                      {issue.title} <span className="issues-item-number">#{issue.number}</span>
                    </h3>
                    <div className="issues-item-meta">
                      <span>opened {issue.time} by {issue.author}</span>
                      {issue.comments > 0 && (
                        <>
                          <span>•</span>
                          <div className="issues-item-comment">
                            <MessageSquare className="issues-item-comment-icon" />
                            <span>{issue.comments}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="issues-item-labels">
                      {issue.labels.map((label) => (
                        <span key={label} className="issues-label">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RepositoryLayout>
    </>
  );
}