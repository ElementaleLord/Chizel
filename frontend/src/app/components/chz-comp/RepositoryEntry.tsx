import { GitFork, Star } from 'lucide-react';

interface RepoEntryProp{
    name: string,
    description: string,
    language: string,
    stars: number,
    forks: number,
    updated: string,
}

const getLanguageColor = (language: string) => {
  switch (language) {
    case 'TypeScript':
      return 'profile-language-dot-typescript';
    case 'JavaScript':
      return 'profile-language-dot-javascript';
    default:
      return 'profile-language-dot-default';
  }
};

export function RepositoryEntry( {repo} : { repo : RepoEntryProp}){
    return (<div key={repo.name} className="profile-repo-card">
        <div className="profile-repo-header">
            <div>
                <h3 className="profile-repo-name">
                {repo.name}
                </h3>
                <p className="profile-repo-description">{repo.description}</p>
            </div>
            </div>
            <div className="profile-repo-meta">
            <div className="profile-repo-meta-item">
                <div className={`profile-language-dot ${getLanguageColor(repo.language)}`}></div>
                <span>{repo.language}</span>
            </div>
            <div className="profile-repo-meta-item">
                <Star className="profile-repo-meta-icon" />
                <span>{repo.stars}</span>
            </div>
            <div className="profile-repo-meta-item">
                <GitFork className="profile-repo-meta-icon" />
                <span>{repo.forks}</span>
            </div>
            <span>Updated {repo.updated}</span>
            </div>
        </div>
    )
}