import { GitFork, Star } from 'lucide-react';
import './RepositoryEntry.css';

interface RepoEntryProp {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated: string;
}

const getLanguageColor = (language: string) => {
  switch (language) {
    case 'TypeScript':
      return 'repo-entry-language-dot-typescript';
    case 'JavaScript':
      return 'repo-entry-language-dot-javascript';
    default:
      return 'repo-entry-language-dot-default';
  }
};

export function RepositoryEntry({ repo }: { repo: RepoEntryProp }) {
  return (
    <div key={repo.name} className="repo-entry-card">
      <div className="repo-entry-header">
        <div>
          <h3 className="repo-entry-title">
            {repo.name}
          </h3>
          <p className="repo-entry-description">{repo.description}</p>
        </div>
      </div>
      <div className="repo-entry-meta">
        <div className="repo-entry-meta-item">
          <div className={`repo-entry-language-dot ${getLanguageColor(repo.language)}`}></div>
          <span>{repo.language}</span>
        </div>
        <div className="repo-entry-meta-item">
          <Star className="repo-entry-meta-icon" />
          <span>{repo.stars}</span>
        </div>
        <div className="repo-entry-meta-item">
          <GitFork className="repo-entry-meta-icon" />
          <span>{repo.forks}</span>
        </div>
        <span>Updated {repo.updated}</span>
      </div>
    </div>
  );
}