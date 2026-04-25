import { Link } from 'react-router';
import './RepoSideBar.css';

export function RepoSideBar({ topRepos }: { topRepos: Array<{name: string, avatar: string, color: string}> }){

    return (
        <aside className="repo-sidebar">
          <div className="repo-sidebar-header">
            <h2 className="repo-sidebar-title">Top Repositories</h2>
            <button className="repo-sidebar-new-btn">
              New
            </button>
          </div>
          <input
            type="text"
            placeholder="Find a repository..."
            className="repo-sidebar-search"
          />
          <div className="repo-sidebar-list">
            {topRepos.map((repo : {name : string, avatar : string, color : string}) => (
              <Link
                key={repo.avatar}
                to={`/repository/sarahdev/${repo.name}`}
                className="repo-sidebar-item"
                style={{ '--avatar-color-1': repo.color.split(' ')[1], '--avatar-color-2': repo.color.split(' ')[2] } as React.CSSProperties}
              >
                <div className="repo-sidebar-avatar">
                  {repo.avatar}
                </div>
                <span className="repo-sidebar-name">
                  {repo.name}
                </span>
              </Link>
            ))}
          </div>
        </aside>
    )
}