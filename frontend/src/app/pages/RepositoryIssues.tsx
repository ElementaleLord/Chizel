import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CircleDot, Check, Plus, Search, ChevronRight, X, Trash2 } from 'lucide-react';
import { useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
import { useAuth } from '../components/auth/AuthContext';
import { ensureRepoReady } from '../lib/repoApi';
import { createRepoIssue, deleteRepoIssue, fetchRepoIssues, updateRepoIssue, type RepoIssueItem, } from '../lib/repoWorkApi';
import { formatRelativeTime } from '../lib/time';
// DATA
import { type issuesSummary} from '../data/issues';

import './RepositoryWorkItems.css';

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

export function RepositoryIssues() {
  const { owner = '', repo = '' } = useParams();
  const { user } = useAuth();
  const [repoId, setRepoId] = useState<string | null>(null);
  const [items, setItems] = useState<RepoIssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'open' | 'closed'>('open');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadIssues() {
      try {
        setIsLoading(true);
        setError(null);

        const resolvedRepoId = await ensureRepoReady(owner, repo);
        const loadedItems = await fetchRepoIssues(resolvedRepoId);

        if (isCancelled) {
          return;
        }

        setRepoId(resolvedRepoId);
        setItems(loadedItems);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        setError(getErrorMessage(loadError, 'Unable to load issues.'));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadIssues();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo]);

  const openCount = items.filter((item) => item.i_open).length;
  const closedCount = items.length - openCount;

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      if (filter === 'open' && !item.i_open) {
        return false;
      }

      if (filter === 'closed' && item.i_open) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [item.i_name, item.i_msg ?? '', item.author_username]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [filter, items, search]);

  function resetComposer() {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setIsComposerOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setIsComposerOpen(true);
    setError(null);
  }

  function startEdit(item: RepoIssueItem) {
    setEditingId(item.i_id);
    setTitle(item.i_name);
    setMessage(item.i_msg ?? '');
    setIsComposerOpen(true);
    setError(null);
  }

  async function handleSubmitASYNC(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!repoId) {
      return;
    }

    if (!title.trim()) {
      setError('An issue title is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingId) {
        const updated = await updateRepoIssue(repoId, editingId, {
          title: title.trim(),
          message: message.trim(),
        });
        setItems((current) => current.map((item) => (item.i_id === updated.i_id ? updated : item)));
      } else {
        const created = await createRepoIssue(repoId, {
          title: title.trim(),
          message: message.trim(),
        });
        setItems((current) => [created, ...current]);
      }

      resetComposer();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to save issue.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStateChange(item: RepoIssueItem, isOpen: boolean) {
    if (!repoId) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const updated = await updateRepoIssue(repoId, item.i_id, {
        title: item.i_name,
        message: item.i_msg ?? '',
        isOpen,
      });
      setItems((current) => current.map((entry) => (entry.i_id === updated.i_id ? updated : entry)));
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update issue.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: RepoIssueItem) {
    if (!repoId || !window.confirm(`Delete issue #${item.i_id}?`)) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await deleteRepoIssue(repoId, item.i_id);
      setItems((current) => current.filter((entry) => entry.i_id !== item.i_id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete issue.'));
    } finally {
      setIsSaving(false);
    }
  }

  const [showNewForm, setshowNewForm] = useState(false);
  const defIssData : issuesSummary = {
    number: -1,
    title: '',
    author: '',
    status: '',
    comments: 0,
    time: 'Recently',
    labels: [],
  }
  const {register, handleSubmit} = useForm<issuesSummary>({ defaultValues : defIssData});
  const onSubmit = (data : issuesSummary) =>{ 
    console.log(data)
  };

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <div className="repo-work-wrapper">
          <div className="repo-work-container">
            <div className="repo-work-header">
              <div className="repo-work-breadcrumb">
                <Link to={`/repository/${owner}/${repo}`} className="repo-work-breadcrumb-link">
                  {owner}/{repo}
                </Link>
                <ChevronRight className="repo-work-breadcrumb-icon" />
                <span className="repo-work-breadcrumb-text">Issues</span>
              </div>
              <div className="repo-work-title-row">
                <div>
                  <h1 className="repo-work-title">Issues</h1>
                  <p className="repo-work-subtitle">
                    Track reported work, update issue state, and remove stale entries directly from the repository view.
                  </p>
                </div>
                <button type="button" className="repo-work-primary-btn" onClick={startCreate}>
                  <Plus className="repo-work-btn-icon" />
                </button>
              </div>
            </div>

            <div className="repo-work-metrics">
              <div className="repo-work-metric-card">
                <span className="repo-work-metric-label">Open</span>
                <strong>{openCount}</strong>
              </div>
              <div className="repo-work-metric-card">
                <span className="repo-work-metric-label">Closed</span>
                <strong>{closedCount}</strong>
              </div>
              <div className="repo-work-metric-card">
                <span className="repo-work-metric-label">Total</span>
                <strong>{items.length}</strong>
              </div>
              {showNewForm &&
              <>
                <div className='issues-new-backdrop' onClick={() => setshowNewForm(false)} />
                <div className='issues-new-container'>
                  <button  className='issues-new-close-btn'  onClick={() => setshowNewForm(false)}>
                    <X  className='issues-new-close-icon'/>
                  </button>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <input {...register('title')} placeholder="Issue Title" />
                    <button className='issues-new-create-btn' >Create Issue</button>
                  </form>
                </div>
              </>
              }
            </div>

            {isComposerOpen && (
              <form className="repo-work-composer" onSubmit={handleSubmitASYNC}>
                <div className="repo-work-composer-header">
                  <h2>{editingId ? `Edit Issue #${editingId}` : 'Open a new issue'}</h2>
                  <button type="button" className="repo-work-secondary-btn" onClick={resetComposer}>
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Title"
                  className="repo-work-input"
                  maxLength={255}
                />
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe the bug, task, or request"
                  className="repo-work-textarea"
                  rows={5}
                />
                <div className="repo-work-composer-actions">
                  <button type="submit" className="repo-work-primary-btn" disabled={isSaving}>
                    {editingId ? 'Save Changes' : 'Create Issue'}
                  </button>
                </div>
              </form>
            )}

            <div className="repo-work-toolbar">
              <div className="repo-work-search-wrapper">
                <Search className="repo-work-search-icon" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="repo-work-search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="repo-work-filters">
                <button
                  type="button"
                  className={`repo-work-filter-btn ${filter === 'open' ? 'repo-work-filter-btn-active' : ''}`}
                  onClick={() => setFilter('open')}
                >
                  Open ({openCount})
                </button>
                <button
                  type="button"
                  className={`repo-work-filter-btn ${filter === 'closed' ? 'repo-work-filter-btn-active' : ''}`}
                  onClick={() => setFilter('closed')}
                >
                  Closed ({closedCount})
                </button>
              </div>
            </div>

            {error && <div className="repo-work-alert">{error}</div>}

            <div className="repo-work-list">
              {isLoading ? (
                <div className="repo-work-empty">Loading issues...</div>
              ) : filteredItems.length === 0 ? (
                <div className="repo-work-empty">
                  {filter === 'open' ? 'No open issues match your search.' : 'No closed issues match your search.'}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isAuthor = user?.username === item.author_username;

                  return (
                    <article key={item.i_id} className="repo-work-item">
                      <div className="repo-work-status-icon">
                        <div className={`repo-work-status-badge ${item.i_open ? 'repo-work-status-open' : 'repo-work-status-closed'}`}>
                          {item.i_open ? <CircleDot className="repo-work-status-svg" /> : <Check className="repo-work-status-svg" />}
                        </div>
                      </div>
                      <div className="repo-work-item-body">
                        <div className="repo-work-item-header">
                          <h3 className="repo-work-item-title">
                            {item.i_name} <span className="repo-work-item-number">#{item.i_id}</span>
                          </h3>
                          <span className={`repo-work-pill ${item.i_open ? 'repo-work-pill-open' : 'repo-work-pill-closed'}`}>
                            {item.i_open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="repo-work-item-meta">
                          opened {formatRelativeTime(item.i_creationdate)} by {item.author_username}
                          {!item.i_open && item.i_resolvedate ? ` • resolved ${formatRelativeTime(item.i_resolvedate)}` : ''}
                        </p>
                        {item.i_msg && <p className="repo-work-item-message">{item.i_msg}</p>}
                        <div className="repo-work-action-row">
                          <button type="button" className="repo-work-secondary-btn" onClick={() => startEdit(item)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="repo-work-secondary-btn"
                            onClick={() => void handleStateChange(item, !item.i_open)}
                            disabled={isSaving}
                          >
                            {item.i_open ? 'Close' : 'Reopen'}
                          </button>
                          <button
                            type="button"
                            className="repo-work-danger-btn"
                            onClick={() => void handleDelete(item)}
                            disabled={isSaving}
                          >
                            <Trash2 className="repo-work-inline-icon" />
                            Delete
                          </button>
                          {!isAuthor && (
                            <span className="repo-work-helper-text">
                              Owner permissions are still checked by the backend.
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </RepositoryLayout>
    </>
  );
}
