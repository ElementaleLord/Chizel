import { Menu, Search, Plus, Bell, GitPullRequest, Inbox } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router';
import { useState } from 'react';
import './ChzHeader.css';

export function ChzHeader(){
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <header className="chz-header">
          <div className="chz-header-inner">
            <div className="chz-header-left">
              <button className="chz-menu-btn">
                <Menu />
              </button>
              <Link to="/home" className="chz-logo-link">
                <div className="chz-logo">
                  <span className="chz-logo-text">C</span>
                </div>
                <span className="chz-dashboard-text">Dashboard</span>
              </Link>
            </div>

            <div className="chz-search-container">
              <div className="chz-search-wrapper">
                <Search className="chz-search-icon" />
                <input
                  type="text"
                  placeholder="Search or jump to..."
                  className="chz-search-input"
                />
                <kbd className="chz-search-kbd">/</kbd>
              </div>
            </div>

            <div className="chz-header-right">
              <button className="chz-icon-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button className="chz-icon-btn">
                <Plus />
              </button>
              <button className="chz-icon-btn chz-notification-btn">
                <Bell />
                <span className="chz-notification-dot"></span>
              </button>
              <button className="chz-icon-btn">
                <GitPullRequest />
              </button>
              <button className="chz-icon-btn">
                <Inbox />
              </button>
              <div className="chz-user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="chz-user-avatar-btn"
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </button>
                {showUserMenu && (
                  <div className="chz-user-menu">
                    <Link to="/profile" className="chz-menu-link">
                      Your profile
                    </Link>
                    <Link to="/settings" className="chz-menu-link">
                      Settings
                    </Link>
                    <button
                      onClick={signOut}
                      className="chz-menu-signout"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
    )
}