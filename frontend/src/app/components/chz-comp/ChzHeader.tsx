import { Menu, Search, Plus, Bell, GitPullRequest, Inbox } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router';
import { useState } from 'react';

export function ChzHeader(){
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#21262d] rounded-md transition-colors">
              <Menu className="h-5 w-5 text-[#f0f6fc]" />
            </button>
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-semibold text-[#f0f6fc]">Dashboard</span>
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
              <input
                type="text"
                placeholder="Search or jump to..."
                className="w-full pl-9 pr-20 py-1.5 text-sm bg-[#0d1117] text-[#f0f6fc] placeholder:text-[#7d8590] border border-[#30363d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-[#21262d] text-[#7d8590] border border-[#30363d] rounded">
                /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#21262d] rounded-md transition-colors">
              <svg className="h-5 w-5 text-[#f0f6fc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-[#21262d] rounded-md transition-colors">
              <Plus className="h-5 w-5 text-[#f0f6fc]" />
            </button>
            <button className="relative p-2 hover:bg-[#21262d] rounded-md transition-colors">
              <Bell className="h-5 w-5 text-[#f0f6fc]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#fda410] rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-[#21262d] rounded-md transition-colors">
              <GitPullRequest className="h-5 w-5 text-[#f0f6fc]" />
            </button>
            <button className="p-2 hover:bg-[#21262d] rounded-md transition-colors">
              <Inbox className="h-5 w-5 text-[#f0f6fc]" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white text-sm hover:ring-2 hover:ring-[#fda410] transition-all"
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg py-1">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-[#f0f6fc] hover:bg-[#21262d]">
                    Your profile
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-[#f0f6fc] hover:bg-[#21262d]">
                    Settings
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-4 py-2 text-sm text-[#f0f6fc] hover:bg-[#21262d] border-t border-[#30363d]"
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