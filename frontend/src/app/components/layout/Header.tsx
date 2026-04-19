import { Search, Plus, Bell, Menu, X, GitPullRequest, GitCommitHorizontal, MessageSquare, CheckCheck } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface HeaderProps {
  isLoggedIn?: boolean;
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New pull request review',
      description: 'Sarah requested your review on `frontend-header-refresh`.',
      time: '5m ago',
      href: '/activity',
      unread: true,
      icon: GitPullRequest,
    },
    {
      id: 2,
      title: 'Commit pushed to main',
      description: 'Three new commits landed in `sarahdev/web-app`.',
      time: '22m ago',
      href: '/repository/sarahdev/web-app',
      unread: true,
      icon: GitCommitHorizontal,
    },
    {
      id: 3,
      title: 'Comment on issue #18',
      description: 'A teammate replied to your deployment bug report.',
      time: '1h ago',
      href: '/activity',
      unread: false,
      icon: MessageSquare,
    },
  ]);
  const appNavItems = [
    { label: 'Home', to: '/home' },
    { label: 'Activity', to: '/activity' },
    { label: 'Repositories', to: '/repositories' },
    { label: 'Stars', to: '/stars' },
    { label: 'Settings', to: '/settings' },
  ];
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification,
      ),
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center gap-6 flex-1">
          <Link to={isLoggedIn ? '/home' : '/'} className="shrink-0">
            <BrandLogo />
          </Link>

          {isLoggedIn && <div className="hidden lg:block w-[22rem] shrink-0" aria-hidden="true" />}

          {isLoggedIn && (
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  className="w-full pl-9 pr-4 py-1.5 text-sm bg-secondary text-foreground placeholder:text-[#7d8590] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </div>

        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button className="hidden md:flex items-center gap-1 text-sm text-foreground hover:text-[#fda410] transition-colors">
                <Plus className="h-5 w-5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-foreground hover:text-[#fda410]"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fda410] px-1 text-[10px] font-semibold text-white">
                          {unreadCount}
                        </span>
                        <span className="sr-only">{unreadCount} unread notifications</span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[22rem] rounded-xl border-border bg-card p-0">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} unread updates` : 'You are all caught up'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#fda410] hover:text-[#e38c05]"
                      onClick={markAllNotificationsAsRead}
                      disabled={unreadCount === 0}
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all read
                    </Button>
                  </div>
                  <DropdownMenuSeparator className="mx-0 my-0" />
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.map((notification) => {
                      const Icon = notification.icon;

                      return (
                        <Link
                          key={notification.id}
                          to={notification.href}
                          onClick={() => markNotificationAsRead(notification.id)}
                          className={`mb-1 flex items-start gap-3 rounded-lg px-3 py-3 transition-colors last:mb-0 ${
                            notification.unread ? 'bg-secondary/70 hover:bg-secondary' : 'hover:bg-secondary/50'
                          }`}
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fda410]/10 text-[#fda410]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <span className="shrink-0 text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                          {notification.unread && (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#fda410]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white text-sm">
                  U
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
                className="md:hidden text-foreground"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm text-foreground hover:text-[#fda410] transition-colors">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm bg-[#fda410] text-white rounded-md hover:bg-[#e38c05] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      {isLoggedIn && isMobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {appNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
