import { useParams, Link } from 'react-router';
import { CircleDot, MessageSquare, Check, Plus, Search, ChevronRight } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
//DATA
import { pullRequests } from '../data/pullRequests';

import './RepositoryPullRequests.css';

export function RepositoryPullRequests() {
  const { owner, repo } = useParams();

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <div className="pullreq-wrapper">
          <div className="pullreq-container">
            <div className="pullreq-header">
              <div className="pullreq-breadcrumb">
                <Link to={`/repository/${owner}/${repo}`} className="pullreq-breadcrumb-link">
                  {owner}/{repo}
                </Link>
                <ChevronRight className="pullreq-breadcrumb-icon" />
                <span className="pullreq-breadcrumb-text">Pull Requests</span>
              </div>
              <div className="pullreq-title-section">
                <h1 className="pullreq-title">Pull Requests</h1>
                <button className="pullreq-new-btn">
                  <Plus className="pullreq-new-btn-icon" />
                  New Pull Request
                </button>
              </div>
            </div>

            <div className="pullreq-search-section">
              <div className="pullreq-search-wrapper">
                <Search className="pullreq-search-icon" />
                <input
                  type="text"
                  placeholder="Search Pull Requests..."
                  className="pullreq-search-input"
                />
              </div>
            </div>

            <div className="pullreq-filters">
              <button className="pullreq-filter-btn pullreq-filter-btn-active">
                Open (2)
              </button>
              <button className="pullreq-filter-btn pullreq-filter-btn-inactive">
                Closed (1)
              </button>
            </div>

            <div className="pullreq-list">
              {pullRequests.map((request, i) => (
                <div key={i} className="pullreq-item">
                  <div className="pullreq-status-icon">
                    <div className={`pullreq-status-icon-container ${request.status === 'open' ? 'pullreq-status-open' : 'pullreq-status-closed'}`}>
                      {request.status === 'open' ? (
                        <CircleDot className="pullreq-status-open-icon" />
                      ) : (
                        <Check className="pullreq-status-closed-icon" />
                      )}
                    </div>
                  </div>
                  <div className="pullreq-content">
                    <h3 className="pullreq-item-title">
                      {request.title} <span className="pullreq-item-number">#{request.number}</span>
                    </h3>
                    <div className="pullreq-item-meta">
                      <span>opened {request.time} by {request.author}</span>
                      {request.comments > 0 && (
                        <>
                          <span>•</span>
                          <div className="pullreq-item-comment">
                            <MessageSquare className="pullreq-item-comment-icon" />
                            <span>{request.comments}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="pullreq-item-labels">
                      {request.labels.map((label) => (
                        <span key={label} className="pullreq-label">
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