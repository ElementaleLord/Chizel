import { Search, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { NavbarClock } from './NavbarClock';

interface HeaderProps {
  isLoggedIn?: boolean;
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const appNavItems = [
    { label: 'Home', to: '/' },
    { label: 'Activity', to: '/activity' },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Contributions', to: '/contributions' },
    { label: 'Pull Requests', to: '/pull-requests' },
    { label: 'Repositories', to: '/repositories' },
    { label: 'Stars', to: '/stars' },
    { label: 'Settings', to: '/settings' },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center gap-6 flex-1">
          <Link to="/" className="shrink-0">
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
              <NavbarClock />
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
