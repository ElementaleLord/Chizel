import { Star, GitFork, Search, Plus, X } from 'lucide-react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepoSideBar } from '../components/chz-comp/RepoSideBar';
// DATA
import { formatStarCount, getLanguageColor, getRepositoriesByIds, userRepositoryIds, type RepositorySummary } from '../data/repositories';
import { TopRepos } from '../data/topRepos.ts';

import './Repositories.css';

export function Repositories() {
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const repositories = getRepositoriesByIds(userRepositoryIds);
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
  
  const [showNewForm, setshowNewForm] = useState(false);
  const defRepoData : RepositorySummary = {
    id: '',// not sure how youll get this one
    owner: '',// gonna have to figure out a way to let the pages access user info for this
    name: '',// input
    description: '',// input
    language: '',// input ? maybe blank
    stars: 0,// as is
    forks: 0,// as is
    updated: '0',// as is ? not sure what this value is for
    visibility: 'Private',// default is private ig
  }
  const {register, handleSubmit} = useForm<RepositorySummary>({ defaultValues : defRepoData});
  const onSubmit = (data : RepositorySummary) =>{ 
    console.log(data)
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
                title="New repository flow is not wired up yet."
                onClick={() => setshowNewForm(true)}
              >
                <Plus className="repos-new-btn-icon" />
                New repository
              </button>
            </div>
            {showNewForm &&
            <>
              <div className='repos-new-backdrop' onClick={() => setshowNewForm(false)} />
              <div className='repos-new-container'>
                <button  className='repos-new-close-btn'  onClick={() => setshowNewForm(false)}>
                  <X  className='repos-new-close-icon'/>
                </button>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <input {...register('name')} placeholder="Repository Name" />
                  <input {...register('description')} placeholder="Description" />
                  <button className='repos-new-create-btn' >Create Repository</button>
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
              {filteredRepositories.map((repo) => (
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
              {filteredRepositories.length === 0 && (
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
