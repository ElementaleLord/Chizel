import { Search, Plus, Bell, Menu } from 'lucide-react';
import { Link } from 'react-router';

interface HeaderProps {
  isLoggedIn?: boolean;
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center gap-6 flex-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-semibold text-foreground">Chizel</span>
          </Link>

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
              <button className="hidden md:flex items-center gap-1 text-sm text-foreground hover:text-[#ff8c42] transition-colors">
                <Plus className="h-5 w-5" />
              </button>
              <button className="relative text-foreground hover:text-[#ff8c42] transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff8c42] rounded-full"></span>
              </button>
              <Link to="/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center text-white text-sm">
                  U
                </div>
              </Link>
              <button className="md:hidden text-foreground">
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm text-foreground hover:text-[#ff8c42] transition-colors">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
