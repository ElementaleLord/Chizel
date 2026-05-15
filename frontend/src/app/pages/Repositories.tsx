import { Star, GitFork, Search, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepoSideBar } from '../components/chz-comp/RepoSideBar';
// DATA
import { formatStarCount, getLanguageColor, type RepositorySummary } from '../data/repositories';
import { TopRepos } from '../data/topRepos.ts';
import { fetchMyProfile } from '../lib/profileApi';
import { createRepository } from '../lib/repoApi';
import { formatRelativeTime } from '../lib/time';

import './Repositories.css';

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

export function Repositories() {
  const navigate = useNavigate();
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const languageOptions = useMemo(
    () => ['all', ...new Set(repositories.map((repository) => repository.language))],
    [repositories],
  );
  const filteredRepositories = repositories.filter((repository) => {
    const matchesVisibility =
      visibilityFilter === 'all' || repository.visibility.toLowerCase() === visibilityFilter;
    const matchesSearch = `${repository.owner}/${repository.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || repository.language === languageFilter;
    return matchesVisibility && matchesSearch && matchesLanguage;
  });
  
  const [showNewForm, setShowNewForm] = useState(false);
  const defRepoData: RepositorySummary = {
    id: '',
    owner: '',
    name: '',
    description: '',
    language: 'CHZ',
    stars: 0,
    forks: 0,
    updated: 'recently',
    visibility: 'Private',
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RepositorySummary>({ defaultValues: defRepoData });

  useEffect(() => {
    let cancelled = false;

    async function loadRepositories() {
      try {
        setIsLoading(true);
        setPageError(null);
        const response = await fetchMyProfile();

        if (cancelled) {
          return;
        }

        setRepositories(
          response.repositories.map((repository) => ({
            id: repository.id,
            owner: repository.owner,
            name: repository.name,
            description: repository.description ?? 'No repository description provided.',
            language: repository.language,
            stars: repository.stars,
            forks: repository.forks,
            updated: formatRelativeTime(repository.updatedAt),
            visibility: repository.visibility,
          })),
        );
      } catch (error) {
        if (!cancelled) {
          setPageError(getErrorMessage(error, 'Unable to load repositories.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRepositories();

    return () => {
      cancelled = true;
    };
  }, []);

  const closeNewRepositoryForm = () => {
    setShowNewForm(false);
    setCreateError(null);
    reset(defRepoData);
  };

  const onSubmit = async (data: RepositorySummary) => {
    try {
      setIsCreating(true);
      setCreateError(null);
      const created = await createRepository({
        name: data.name,
        description: data.description,
        visibility: data.visibility,
      });

      setShowNewForm(false);
      reset(defRepoData);
      void navigate(created.route);
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Unable to create repository.'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="repos-container">
      <ChzHeader pageTitle="Repositories" />
      <div className="repos-layout">
        <RepoSideBar topRepos={TopRepos} />
        <main className="repos-main">
          <div className="repos-wrapper">
            {/* Header */}
            <div className="repos-header">
              <h1 className="repos-title">Your Repositories</h1>
              <button
                type="button"
                className="repos-new-btn"
                title="Create a new repository"
                onClick={() => setShowNewForm(true)}
              >
                <Plus className="repos-new-btn-icon" />
                New repository
              </button>
            </div>
            {showNewForm &&
            <>
              <button
                type="button"
                aria-label="Close new repository form"
                className="repos-new-backdrop"
                onClick={closeNewRepositoryForm}
              />
              <div
                className="repos-new-container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="repos-new-title"
              >
                <button
                  type="button"
                  className="repos-new-close-btn"
                  onClick={closeNewRepositoryForm}
                >
                  <X className="repos-new-close-icon" />
                </button>
                <div className="repos-new-header">
                  <p className="repos-new-eyebrow">Create repository</p>
                  <h2 id="repos-new-title" className="repos-new-title">Add New Repository</h2>
                  <p className="repos-new-subtitle">
                    Start a new project with the same repository settings and styling used across the app.
                  </p>
                </div>
                <form className="repos-new-form" onSubmit={handleSubmit(onSubmit)}>
                  <div className="repos-new-form-group">
                    <label htmlFor="repos-new-name" className="repos-new-label">Repository name</label>
                    <input
                      id="repos-new-name"
                      className="repos-new-input"
                      placeholder="my-awesome-project"
                      autoComplete="off"
                      {...register('name', {
                        required: 'Repository name is required.',
                        validate: (value) =>
                          value.trim().length > 0 || 'Repository name is required.',
                      })}
                    />
                    {errors.name ? <p className="repos-new-error">{errors.name.message}</p> : null}
                  </div>
                  <div className="repos-new-form-group">
                    <label htmlFor="repos-new-description" className="repos-new-label">
                      Description
                    </label>
                    <textarea
                      id="repos-new-description"
                      rows={4}
                      className="repos-new-textarea"
                      placeholder="Tell people what this repository is for"
                      {...register('description')}
                    />
                  </div>
                  <div className="repos-new-form-group">
                    <label htmlFor="repos-new-visibility" className="repos-new-label">Visibility</label>
                    <select
                      id="repos-new-visibility"
                      className="repos-new-select"
                      {...register('visibility')}
                    >
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                  {createError ? <p className="repos-new-error">{createError}</p> : null}
                  <div className="repos-new-actions">
                    <button
                      type="button"
                      className="repos-new-cancel-btn"
                      onClick={closeNewRepositoryForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="repos-new-create-btn"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Repository'}
                    </button>
                  </div>
                </form>
              </div>
            </>
            }
            {/* Search and Filters */}
            <div className="repos-controls">
              <div className="repos-search-container">
                <Search className="repos-search-icon" />
                <input
                  type="text"
                  placeholder="Find a repository..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="repos-search-input"
                />
              </div>
              <div className="repos-filter-buttons">
                <button
                  onClick={() => setVisibilityFilter('all')}
                  className={`repos-filter-btn ${
                    visibilityFilter === 'all'
                      ? 'repos-filter-btn-active'
                      : 'repos-filter-btn-inactive'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setVisibilityFilter('public')}
                  className={`repos-filter-btn ${
                    visibilityFilter === 'public'
                      ? 'repos-filter-btn-active'
                      : 'repos-filter-btn-inactive'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setVisibilityFilter('private')}
                  className={`repos-filter-btn ${
                    visibilityFilter === 'private'
                      ? 'repos-filter-btn-active'
                      : 'repos-filter-btn-inactive'
                  }`}
                >
                  Private
                </button>
                <select
                  value={languageFilter}
                  onChange={(event) => setLanguageFilter(event.target.value)}
                  className="repos-language-select"
                >
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All languages' : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Repository List */}
            <div className="repos-list">
              {isLoading ? (
                <div className="repos-empty">Loading repositories...</div>
              ) : pageError ? (
                <div className="repos-empty">{pageError}</div>
              ) : filteredRepositories.map((repo) => (
                <div key={repo.id} className="repos-item">
                  <div className="repos-item-header">
                    <div className="repos-item-title-section">
                      <div className="repos-item-title-row">
                        <Link
                          to={`/repository/${repo.owner}/${repo.name}`}
                          className="repos-item-name"
                        >
                          {repo.owner}/{repo.name}
                        </Link>
                        <span className="repos-visibility-badge">
                          {repo.visibility}
                        </span>
                      </div>
                      <p className="repos-item-description">{repo.description}</p>
                    </div>
                  </div>
                  <div className="repos-item-meta">
                    <div className="repos-item-meta-item">
                      <div className={`repos-language-dot ${getLanguageColor(repo.language)}`}></div>
                      <span>{repo.language}</span>
                    </div>
                    <div className="repos-item-meta-item">
                      <Star className="repos-meta-icon" />
                      <span>{formatStarCount(repo.stars)}</span>
                    </div>
                    <div className="repos-item-meta-item">
                      <GitFork className="repos-meta-icon" />
                      <span>{repo.forks}</span>
                    </div>
                    <span className="repos-updated">Updated {repo.updated}</span>
                  </div>
                </div>
              ))}
              {!isLoading && !pageError && filteredRepositories.length === 0 && (
                <div className="repos-empty">
                  No repositories match the current filters.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
