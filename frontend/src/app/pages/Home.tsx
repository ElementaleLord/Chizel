import { GitPullRequest, FileCode, GitBranch, Code, MoreVertical } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';
import { Link } from 'react-router';
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepoSideBar } from '../components/chz-comp/RepoSideBar';
import { TopRepos } from '../data/topRepos.ts';
import { feedItems } from '../data/feedItems.ts';
import './Home.css';

export function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="home-container">
      {/* Top Navigation */}
      <ChzHeader pageTitle="Dashboard"/>
      
      <div className="home-layout">
        {/* Left Sidebar */}
        <RepoSideBar topRepos={TopRepos} />

        {/* Main Content */}
        <main className="home-main">
          <h1 className="home-title">Home</h1>

          {/* Composer Card */}
          <div className="composer-card">
            <div className="composer-header">
              <div className="composer-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <input
                type="text"
                placeholder="Ask anything or type @ to add context"
                className="composer-input"
              />
            </div>
            <div className="composer-actions">
              <button className="composer-btn composer-btn-secondary">
                All repositories
              </button>
              <button className="composer-btn composer-btn-secondary">
                <FileCode />
                Create issue
              </button>
              <button className="composer-btn composer-btn-secondary">
                <Code />
                Write code
              </button>
              <button className="composer-btn composer-btn-secondary">
                <GitBranch />
                Git
              </button>
              <button className="composer-btn composer-btn-secondary">
                <GitPullRequest />
                Pull requests
              </button>
            </div>
          </div>

          {/* Feed Section */}
          <div className="feed-section">
            <h2 className="feed-title">Feed</h2>
            <div className="feed-list">
              {feedItems.map((item, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-item-inner">
                    <div className="feed-avatar">
                      {item.avatar}
                    </div>
                    <div className="feed-content">
                      <div className="feed-meta">
                        <span className="feed-user">{item.user}</span>
                        <span className="feed-action">{item.action}</span>
                        <Link to="#" className="feed-repo-link">
                          {item.repo}
                        </Link>
                        <span className="feed-separator">·</span>
                        <span className="feed-time">{item.time}</span>
                      </div>
                      <h3 className="feed-title-item">{item.title}</h3>
                      {item.status && (
                        <span className={`feed-status ${item.statusColor}`}>
                          {item.status}
                        </span>
                      )}
                      <p className="feed-preview">{item.preview}</p>
                    </div>
                    <button className="feed-menu-btn">
                      <MoreVertical />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
