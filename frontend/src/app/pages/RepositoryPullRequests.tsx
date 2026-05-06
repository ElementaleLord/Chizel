import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { Check, ChevronRight, CircleDot, GitMerge, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
import { useAuth } from '../components/auth/AuthContext';
import { ensureRepoReady } from '../lib/repoApi';
import {
  createRepoPullRequest,
  deleteRepoPullRequest,
  fetchRepoPullRequests,
  updateRepoPullRequest,
  type PullRequestStatus,
  type RepoPullRequestItem,
} from '../lib/repoWorkApi';
import { formatRelativeTime } from '../lib/time';
import { useParams, Link } from 'react-router';
import { useState } from 'react';
import { CircleDot, MessageSquare, Check, Plus, Search, ChevronRight, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
//DATA
import { pullRequests, type pullRequestsSummary } from '../data/pullRequests';

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

export function RepositoryPullRequests() {
  const { owner = '', repo = '' } = useParams();
  const { user } = useAuth();
  const [repoId, setRepoId] = useState<string | null>(null);
  const [items, setItems] = useState<RepoPullRequestItem[]>([]);
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

    async function loadPullRequests() {
      try {
        setIsLoading(true);
        setError(null);

        const resolvedRepoId = await ensureRepoReady(owner, repo);
        const loadedItems = await fetchRepoPullRequests(resolvedRepoId);

        if (isCancelled) {
          return;
        }

        setRepoId(resolvedRepoId);
        setItems(loadedItems);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        setError(getErrorMessage(loadError, 'Unable to load pull requests.'));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPullRequests();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo]);

  const openCount = items.filter((item) => item.pr_isopen).length;
  const closedCount = items.length - openCount;
  const mergedCount = items.filter((item) => item.pr_status === 'Merged').length;

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      if (filter === 'open' && !item.pr_isopen) {
        return false;
      }

      if (filter === 'closed' && item.pr_isopen) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        item.pr_name,
        item.pr_msg ?? '',
        item.author_username,
        item.pr_status,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
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

  function startEdit(item: RepoPullRequestItem) {
    setEditingId(item.pr_id);
    setTitle(item.pr_name);
    setMessage(item.pr_msg ?? '');
    setIsComposerOpen(true);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!repoId) {
      return;
    }

    if (!title.trim()) {
      setError('A pull request title is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingId) {
        const updated = await updateRepoPullRequest(repoId, editingId, {
          title: title.trim(),
          message: message.trim(),
        });
        setItems((current) => current.map((item) => (item.pr_id === updated.pr_id ? updated : item)));
      } else {
        const created = await createRepoPullRequest(repoId, {
          title: title.trim(),
          message: message.trim(),
        });
        setItems((current) => [created, ...current]);
      }

      resetComposer();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to save pull request.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStateChange(item: RepoPullRequestItem, isOpen: boolean, status: PullRequestStatus) {
    if (!repoId) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const updated = await updateRepoPullRequest(repoId, item.pr_id, {
        title: item.pr_name,
        message: item.pr_msg ?? '',
        isOpen,
        status,
      });
      setItems((current) => current.map((entry) => (entry.pr_id === updated.pr_id ? updated : entry)));
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update pull request.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: RepoPullRequestItem) {
    if (!repoId || !window.confirm(`Delete pull request #${item.pr_id}?`)) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await deleteRepoPullRequest(repoId, item.pr_id);
      setItems((current) => current.filter((entry) => entry.pr_id !== item.pr_id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete pull request.'));
    } finally {
      setIsSaving(false);
    }
  }

  const [showNewForm, setshowNewForm] = useState(false);
  const defReqData : pullRequestsSummary = {
    number: -1,
    title: '',
    author: '',
    status: '',
    comments: 0,
    time: 'Recently',
    labels: [],
  }
  const {register, handleSubmit} = useForm<pullRequestsSummary>({ defaultValues : defReqData});
  const onSubmit = (data : pullRequestsSummary) =>{ 
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
                <span className="repo-work-breadcrumb-text">Pull Requests</span>
              </div>
              <div className="repo-work-title-row">
                <div>
                  <h1 className="repo-work-title">Pull Requests</h1>
                  <p className="repo-work-subtitle">
                    Create, review, close, merge, and delete repository pull requests from one place.
                  </p>
                </div>
                <button type="button" className="repo-work-primary-btn" onClick={startCreate}>
                  <Plus className="repo-work-btn-icon" />
              <div className="pullreq-title-section">
                <h1 className="pullreq-title">Pull Requests</h1>
                <button className="pullreq-new-btn" onClick={() => setshowNewForm(true)}>
                  <Plus className="pullreq-new-btn-icon" />
                  New Pull Request
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
                <span className="repo-work-metric-label">Merged</span>
                <strong>{mergedCount}</strong>
            {showNewForm &&
            <>
              <div className='pullreq-new-backdrop' onClick={() => setshowNewForm(false)} />
              <div className='pullreq-new-container'>
                <button  className='pullreq-new-close-btn'  onClick={() => setshowNewForm(false)}>
                  <X  className='pullreq-new-close-icon'/>
                </button>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <input {...register('title')} placeholder="Pull Request Title" />
                  <button className='pullreq-new-create-btn' >Create Pull Request</button>
                </form>
              </div>
            </>
            }
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

            {isComposerOpen && (
              <form className="repo-work-composer" onSubmit={handleSubmit}>
                <div className="repo-work-composer-header">
                  <h2>{editingId ? `Edit Pull Request #${editingId}` : 'Open a new pull request'}</h2>
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
                  placeholder="Describe what this pull request changes"
                  className="repo-work-textarea"
                  rows={5}
                />
                <div className="repo-work-composer-actions">
                  <button type="submit" className="repo-work-primary-btn" disabled={isSaving}>
                    {editingId ? 'Save Changes' : 'Create Pull Request'}
                  </button>
                </div>
              </form>
            )}

            <div className="repo-work-toolbar">
              <div className="repo-work-search-wrapper">
                <Search className="repo-work-search-icon" />
                <input
                  type="text"
                  placeholder="Search pull requests..."
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
                <div className="repo-work-empty">Loading pull requests...</div>
              ) : filteredItems.length === 0 ? (
                <div className="repo-work-empty">
                  {filter === 'open' ? 'No open pull requests match your search.' : 'No closed pull requests match your search.'}
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
                      {(request.comments || -1) > 0 && (
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
                      {request.labels?.map((label) => (
                        <span key={label} className="pullreq-label">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isOpen = item.pr_isopen;
                  const isAuthor = user?.username === item.author_username;

                  return (
                    <article key={item.pr_id} className="repo-work-item">
                      <div className="repo-work-status-icon">
                        <div className={`repo-work-status-badge ${isOpen ? 'repo-work-status-open' : 'repo-work-status-closed'}`}>
                          {isOpen ? <CircleDot className="repo-work-status-svg" /> : <Check className="repo-work-status-svg" />}
                        </div>
                      </div>
                      <div className="repo-work-item-body">
                        <div className="repo-work-item-header">
                          <h3 className="repo-work-item-title">
                            {item.pr_name} <span className="repo-work-item-number">#{item.pr_id}</span>
                          </h3>
                          <span className={`repo-work-pill ${isOpen ? 'repo-work-pill-open' : 'repo-work-pill-closed'}`}>
                            {isOpen ? 'Open' : item.pr_status}
                          </span>
                        </div>
                        <p className="repo-work-item-meta">
                          opened {formatRelativeTime(item.pr_creation_date)} by {item.author_username}
                          {!isOpen && item.pr_resolve_date ? ` • resolved ${formatRelativeTime(item.pr_resolve_date)}` : ''}
                        </p>
                        {item.pr_msg && <p className="repo-work-item-message">{item.pr_msg}</p>}
                        <div className="repo-work-action-row">
                          <button type="button" className="repo-work-secondary-btn" onClick={() => startEdit(item)}>
                            Edit
                          </button>
                          {isOpen ? (
                            <>
                              <button
                                type="button"
                                className="repo-work-secondary-btn"
                                onClick={() => void handleStateChange(item, false, 'Merged')}
                                disabled={isSaving}
                              >
                                <GitMerge className="repo-work-inline-icon" />
                                Merge
                              </button>
                              <button
                                type="button"
                                className="repo-work-secondary-btn"
                                onClick={() => void handleStateChange(item, false, 'Accepted')}
                                disabled={isSaving}
                              >
                                <Check className="repo-work-inline-icon" />
                                Accept
                              </button>
                              <button
                                type="button"
                                className="repo-work-secondary-btn"
                                onClick={() => void handleStateChange(item, false, 'Rejected')}
                                disabled={isSaving}
                              >
                                <XCircle className="repo-work-inline-icon" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="repo-work-secondary-btn"
                              onClick={() => void handleStateChange(item, true, 'Null')}
                              disabled={isSaving}
                            >
                              Reopen
                            </button>
                          )}
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
                              Owner actions are enforced by the backend if this isn’t yours.
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
