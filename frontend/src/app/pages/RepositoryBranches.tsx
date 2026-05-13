import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { GitBranch, ChevronRight, Clock, Tag } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { checkoutRepoRef, ensureRepoReady, fetchRepoMeta, type RepoMeta, type RepoRef } from '../lib/repoApi';
import { formatRelativeTime } from '../lib/time';

import './RepositoryBranches.css';

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

interface RefSectionProps {
  title: string;
  refs: RepoRef[];
  actionLabel: string;
  onCheckout: (refName: string) => Promise<void>;
}

function RefSection({ title, refs, actionLabel, onCheckout }: RefSectionProps) {
  return (
    <section className="branches-section">
      <div className="branches-section-header">
        <h2 className="branches-section-title">{title}</h2>
        <span className="branches-section-count">{refs.length}</span>
      </div>

      <div className="branches-card">
        {refs.length === 0 ? (
          <div className="branches-empty">No {title.toLowerCase()} found in this repository.</div>
        ) : (
          refs.map((refItem) => (
            <div key={refItem.id} className="branches-item">
              <div className="branches-item-left">
                {refItem.type === 'branch' ? (
                  <GitBranch className="branches-icon" />
                ) : (
                  <Tag className="branches-icon" />
                )}
                <div className="branches-item-content">
                  <div className="branches-item-name-row">
                    <span className="branches-item-name">{refItem.name}</span>
                    {refItem.isCurrent && (
                      <span className="branches-default-badge">
                        current
                      </span>
                    )}
                  </div>
                  <div className="branches-item-meta">
                    <Clock className="branches-meta-icon" />
                    <span>{formatRelativeTime(refItem.lastModified)}</span>
                  </div>
                </div>
              </div>
              <div className="branches-item-right">
                <button
                  className="branches-view-btn"
                  onClick={() => void onCheckout(refItem.name)}
                  disabled={refItem.isCurrent}
                  type="button"
                >
                  {refItem.isCurrent ? 'Current' : actionLabel}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function RepositoryBranches() {
  const { owner = '', repo = '' } = useParams();
  const navigate = useNavigate();
  const [repoMeta, setRepoMeta] = useState<RepoMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadRepoRefs() {
      try {
        setIsLoading(true);
        setError(null);

        const repoId = await ensureRepoReady(owner, repo);
        const meta = await fetchRepoMeta(repoId);

        if (!isCancelled) {
          setRepoMeta(meta);
        }
      } catch (loadError) {
        if (!isCancelled) {
          console.error(loadError);
          setError(getErrorMessage(loadError, 'Unable to load repository refs.'));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRepoRefs();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo]);

  const handleCheckout = async (refName: string) => {
    if (!repoMeta) {
      return;
    }

    try {
      await checkoutRepoRef(repoMeta.repoId, refName);
      navigate(`/repository/${owner}/${repo}`);
    } catch (checkoutError) {
      console.error(checkoutError);
      setError(getErrorMessage(checkoutError, 'Unable to switch reference.'));
    }
  };

  return (
    <div className="branches-container">
      <ChzHeader pageTitle={`${owner} / ${repo}`} />

      <main className="branches-main">
        <div className="branches-wrapper">
          <div className="branches-header">
            <div className="branches-breadcrumb">
              <Link to={`/repository/${owner}/${repo}`} className="branches-breadcrumb-link">
                {owner}/{repo}
              </Link>
              <ChevronRight className="branches-breadcrumb-icon" />
              <span className="branches-breadcrumb-text">Branches & tags</span>
            </div>
            <h1 className="branches-title">Branches & tags</h1>
          </div>

          {isLoading && <div className="branches-empty">Loading refs...</div>}
          {!isLoading && error && <div className="branches-empty">{error}</div>}

          {!isLoading && !error && repoMeta && (
            <div className="branches-sections">
              <RefSection
                title="Branches"
                refs={repoMeta.branches}
                actionLabel="Switch"
                onCheckout={handleCheckout}
              />
              <RefSection
                title="Tags"
                refs={repoMeta.tags}
                actionLabel="Browse"
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
