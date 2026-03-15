import { Link, useLocation } from "react-router";
import { Search, Plus, Bell, Menu, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { mockUser } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const { theme, toggleTheme } = useTheme();

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="border-b sticky top-0 z-50" style={{ backgroundColor: 'var(--chizel-header-bg)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <div className="rounded-full p-1.5" style={{ backgroundColor: 'var(--foreground)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--chizel-header-bg)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>C</span>
                </div>
              </div>
              <span className="text-xl font-semibold">Chizel</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search or jump to..."
                className="w-64 pl-10"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'frappe' ? 'light' : 'dark'} mode`}
            >
              {theme === 'frappe' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Link to="/notifications">
              <Button
                variant="ghost"
                size="icon"
              >
                <Bell className="w-5 h-5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>New repository</DropdownMenuItem>
                <DropdownMenuItem>Import repository</DropdownMenuItem>
                <DropdownMenuItem>New gist</DropdownMenuItem>
                <DropdownMenuItem>New organization</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                    <AvatarFallback>
                      {mockUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Menu className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{mockUser.name}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.username}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/account/${mockUser.username}`}>Your profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Your repositories</DropdownMenuItem>
                <DropdownMenuItem>Your projects</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/starred">Your stars</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/account/${mockUser.username}`}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
