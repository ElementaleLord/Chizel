import { useMemo, useState } from 'react';
import { Star, GitFork, Search } from 'lucide-react';
import { Link } from 'react-router';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryStarButton } from '../components/repository/RepositoryStarButton';
import { useAppState } from '../components/state/AppStateContext';
// DATA
import { formatStarCount, getLanguageColor, getRepositoriesByIds } from '../data/repositories';

import './Stars.css';

export function Stars() {
  const { starredRepositories } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleRepositoryIds, setVisibleRepositoryIds] = useState<string[]>(() => starredRepositories);
  
  const starredRepos = useMemo(
    () =>
      getRepositoriesByIds(visibleRepositoryIds).filter((repository) =>
        repository.id.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, visibleRepositoryIds],
  );

  return (
    <div className="stars-container">
      <ChzHeader pageTitle="Stars" />

      <main className="stars-main">
        <div className="stars-wrapper">
          {/* Header Section */}
          <div className="stars-header">
            <div className="stars-header-left">
              <Star className="stars-header-icon" />
              <h1 className="stars-header-title">Starred repositories</h1>
            </div>
          </div>

          {/* Search Section */}
          <div className="stars-search-wrapper">
            <div className="stars-search-container">
              <Search className="stars-search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search starred repositories..."
                className="stars-search-input"
              />
            </div>
          </div>

          {/* Repository List */}
          <div className="stars-list">
            {starredRepos.map((repo) => (
              <div key={repo.id} className="stars-repo-card">
                <div className="stars-repo-header">
                  <div className="stars-repo-header-left">
                    <Link
                      to={`/repository/${repo.owner}/${repo.name}`}
                      className="stars-repo-link"
                    >
                      {repo.owner}/{repo.name}
                    </Link>
                    <p className="stars-repo-description">{repo.description}</p>
                  </div>
                  <div className="stars-repo-star-button">
                    <RepositoryStarButton
                      isStarred={true}
                      compact
                      onToggle={() =>
                        setVisibleRepositoryIds((current) => 
                          current.filter((repositoryId) => repositoryId !== repo.id)
                        )
                      }
                    />
                  </div>
                </div>

                {/* Repository Meta */}
                <div className="stars-repo-meta">
                  <div className="stars-repo-meta-item">
                    <div 
                      className={`stars-repo-language-dot ${getLanguageColor(repo.language)}`}
                    ></div>
                    <span>{repo.language}</span>
                  </div>
                  <div className="stars-repo-meta-item">
                    <Star className="stars-repo-meta-icon" />
                    <span>{formatStarCount(repo.stars)}</span>
                  </div>
                  <div className="stars-repo-meta-item">
                    <GitFork className="stars-repo-meta-icon" />
                    <span>{formatStarCount(repo.forks)}</span>
                  </div>
                  <span className="stars-repo-updated">Updated {repo.updated}</span>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {starredRepos.length === 0 && (
              <div className="stars-empty-state">
                No starred repositories are visible with the current search or temporary un-star actions.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}