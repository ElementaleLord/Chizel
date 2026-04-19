import { Menu, Search, Plus, Bell, GitPullRequest, Inbox, ChevronDown, Sparkles, FileCode, GitBranch, Code, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { Link } from 'react-router';

const topRepos = [
  { name: 'web-app', avatar: 'W', color: 'from-blue-500 to-blue-600' },
  { name: 'design-system', avatar: 'D', color: 'from-purple-500 to-purple-600' },
  { name: 'api-server', avatar: 'A', color: 'from-green-500 to-green-600' },
  { name: 'mobile-app', avatar: 'M', color: 'from-orange-500 to-orange-600' },
];

const feedItems = [
  {
    user: 'Sarah Developer',
    avatar: 'S',
    action: 'merged pull request in',
    repo: 'sarahdev/web-app',
    title: 'Add dark mode support',
    status: 'Merged',
    statusColor: 'bg-purple-500',
    time: '2 hours ago',
    preview: 'Implemented dark mode theming across all components with CSS variables and context provider.',
  },
  {
    user: 'Mike Chen',
    avatar: 'M',
    action: 'opened pull request in',
    repo: 'team/api-server',
    title: 'Add rate limiting middleware',
    status: 'Open',
    statusColor: 'bg-green-500',
    time: '4 hours ago',
    preview: 'Added rate limiting middleware to prevent API abuse and improve security.',
  },
  {
    user: 'Alex Kim',
    avatar: 'A',
    action: 'pushed commits to',
    repo: 'chizel/design-system',
    title: '3 commits to main',
    time: '6 hours ago',
    preview: 'Updated button component styles and fixed accessibility issues.',
  },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d1117] dark">
      {/* Top Navigation */}
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

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-[#30363d] bg-[#0d1117] min-h-[calc(100vh-3.5rem)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#f0f6fc]">Top repositories</h2>
            <button className="px-2 py-1 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors">
              New
            </button>
          </div>
          <input
            type="text"
            placeholder="Find a repository..."
            className="w-full px-3 py-1.5 mb-3 text-sm bg-[#161b22] text-[#f0f6fc] placeholder:text-[#7d8590] border border-[#30363d] rounded-md focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
          />
          <div className="space-y-1">
            {topRepos.map((repo) => (
              <Link
                key={repo.name}
                to={`/repository/sarahdev/${repo.name}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#21262d] transition-colors group"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${repo.color} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                  {repo.avatar}
                </div>
                <span className="text-sm text-[#c9d1d9] group-hover:text-[#f0f6fc] truncate">
                  {repo.name}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-semibold text-[#f0f6fc] mb-6">Home</h1>

          {/* Composer Card */}
          <div className="mb-6 bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white text-sm flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <input
                type="text"
                placeholder="Ask anything or type @ to add context"
                className="flex-1 px-3 py-2 bg-[#0d1117] text-[#f0f6fc] placeholder:text-[#7d8590] border border-[#30363d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="px-3 py-1.5 text-sm bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Ask
              </button>
              <button className="px-3 py-1.5 text-sm bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors">
                All repositories
              </button>
              <button className="px-3 py-1.5 text-sm bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Agent
              </button>
              <button className="px-3 py-1.5 text-sm bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors flex items-center gap-1">
                <FileCode className="h-3 w-3" />
                Create issue
              </button>
              <button className="px-3 py-1.5 text-sm bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors flex items-center gap-1">
                <Code className="h-3 w-3" />
                Write code
              </button>
              <button className="px-3 py-1.5 text-sm bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Git
              </button>
              <button className="px-3 py-1.5 text-sm bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors flex items-center gap-1">
                <GitPullRequest className="h-3 w-3" />
                Pull requests
              </button>
            </div>
          </div>

          {/* Feed Section */}
          <div>
            <h2 className="text-lg font-semibold text-[#f0f6fc] mb-4">Feed</h2>
            <div className="space-y-4">
              {feedItems.map((item, i) => (
                <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white flex-shrink-0">
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-[#f0f6fc]">{item.user}</span>
                        <span className="text-sm text-[#7d8590]">{item.action}</span>
                        <Link to="#" className="text-sm text-[#58a6ff] hover:underline">
                          {item.repo}
                        </Link>
                        <span className="text-sm text-[#7d8590]">·</span>
                        <span className="text-sm text-[#7d8590]">{item.time}</span>
                      </div>
                      <h3 className="text-[#f0f6fc] font-medium mb-2">{item.title}</h3>
                      {item.status && (
                        <span className={`inline-block px-2 py-0.5 text-xs ${item.statusColor} text-white rounded-full mb-2`}>
                          {item.status}
                        </span>
                      )}
                      <p className="text-sm text-[#c9d1d9]">{item.preview}</p>
                    </div>
                    <button className="p-1 hover:bg-[#21262d] rounded transition-colors">
                      <MoreVertical className="h-4 w-4 text-[#7d8590]" />
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
