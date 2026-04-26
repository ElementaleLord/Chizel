import { GitPullRequest, CircleDot, BookMarked } from 'lucide-react';
import { Link } from 'react-router';
// COMPONENTS
import { useAuth } from '../components/auth/AuthContext';
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepoSideBar } from '../components/chz-comp/RepoSideBar';
import { FeedItem } from '../components/chz-comp/FeedItem';
// DATA
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
              <Link to='/repositories' className="composer-btn composer-btn-secondary">
                <BookMarked />All Repositories
              </Link>
              <Link to='/issues' className="composer-btn composer-btn-secondary">
                <CircleDot />
                Create Issue
              </Link>
              <Link to='/pull-requests' className="composer-btn composer-btn-secondary">
                <GitPullRequest />
                Pull Requests
              </Link>
            </div>
          </div>

          {/* Feed Section */}
          <div className="feed-section">
            <h2 className="feed-title">Feed</h2>
            <div className="feed-list">
              {feedItems.map((item, i) => (
                <FeedItem item= {item} index= {i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
