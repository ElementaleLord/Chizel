import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Menu, Search, Plus, Bell, GitPullRequest, CircleDot, X , Star, House, BookMarked, DoorOpen } from 'lucide-react';
// COMPONENTS
import { useAuth } from '../auth/AuthContext';
import { BrandLogo } from '../layout/BrandLogo';

import './ChzHeader.css';

export function ChzHeader({ pageTitle }: { pageTitle: string }){
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, signOut } = useAuth();

    useEffect(() => {
        if (!isSidebarOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isSidebarOpen]);
    return (
        <>
          <header className="chz-header">
            <div className="chz-header-inner">
              <div className="chz-header-left">
                { user && 
                  <div className="chz-side-menu-container">
                    <button
                      className="chz-menu-btn"
                      onClick={() => setIsSidebarOpen((prev) => !prev)}
                      aria-expanded={isSidebarOpen}
                      aria-controls="chz-sidebar-drawer"
                      aria-label={isSidebarOpen ? 'Close side menu' : 'Open side menu'}
                    >
                      <Menu />
                    </button>
                  </div> 
                }
                <Link to="/home" className="chz-logo-link">
                  <div className="chz-logo">
                    <BrandLogo className="mx-auto w-fit" imageClassName="h-12 w-12" showLabel={false} />
                  </div>
                  <span className="chz-dashboard-text">{pageTitle}</span>
                </Link>
              </div>
              { user &&
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
              }
              <div className="chz-header-right">
                { user && <>
                <Link to="./repositories" className="chz-icon-btn">
                  <Plus />
                </Link>
                <Link to="/issues" className="chz-icon-btn">
                  <CircleDot />
                </Link>
                <Link to="/pull-requests" className="chz-icon-btn">
                  <GitPullRequest />
                </Link>
                <Link to="/notifications" className="chz-icon-btn chz-notification-btn">
                  <Bell />
                  <span className="chz-notification-dot"></span>
                </Link>
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
                </>}
                { !user &&
                <div className="chz-header-land">
                  <Link to="/signin" className="chz-sign-in">
                    Sign In
                  </Link>
                  <Link to="/signup" className="chz-sign-up">
                    Sign Up
                  </Link>
                </div>}
              </div>
            </div>
          </header>
          {/* SIDE MENU */}
          <div
            className={`chz-sidebar-overlay ${isSidebarOpen ? 'is-open' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden={!isSidebarOpen}
          />
          <aside
            id="chz-sidebar-drawer"
            className={`chz-sidebar-drawer ${isSidebarOpen ? 'is-open' : ''}`}
            aria-hidden={!isSidebarOpen} >
            <div className="chz-sidebar-header">
              <div>
                <h2 className="chz-sidebar-title">Navigation</h2>
              </div>
              <button
                className="chz-sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close side menu">
                <X />
              </button>
            </div>
            <nav className="chz-sidebar-nav" aria-label="Sidebar">
              <Link
                to="/"
                className="chz-side-link"
                onClick={() => setIsSidebarOpen(false)}>
                <House />‎ Home
              </Link>
              <Link
                to="/notifications"
                className="chz-side-link"
                onClick={() => setIsSidebarOpen(false)}>
                <Bell />‎ Notifications
              </Link>
              <Link
                to="/pull-requests"
                className="chz-side-link"
                onClick={() => setIsSidebarOpen(false)}>
                <GitPullRequest />‎ Pull Requests
              </Link>
              <Link
                to="/repositories"
                className="chz-side-link"
                onClick={() => setIsSidebarOpen(false)}>
                <BookMarked />‎ Repositories
              </Link>
              <Link
                to="/issues"
                className="chz-side-link"
                onClick={() => setIsSidebarOpen(false)}>
                <CircleDot />‎ Issues
              </Link>
              <Link
                to="/stars"
                className="chz-side-link"
                onClick={() => setIsSidebarOpen(false)}>
                <Star />‎ Stars
              </Link>
              <button
                onClick={() => {
                    signOut();
                    setIsSidebarOpen(false);
                }}
                className="chz-side-action">
                <DoorOpen />‎ Sign out
              </button>
            </nav>
          </aside>
        </>
      )
}