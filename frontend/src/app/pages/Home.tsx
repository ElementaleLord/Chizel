import { GitPullRequest, Sparkles, FileCode, GitBranch, Code, MoreVertical } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';
import { Link } from 'react-router';
import { ChzHeader }  from '../components/chz-comp/ChzHeader';
import { RepoSideBar }  from '../components/chz-comp/RepoSideBar';

const TopRepos = [
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

export function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1117] dark">
      {/* Top Navigation */}
      <ChzHeader/>
      
      <div className="flex">
        {/* Left Sidebar */}
        <RepoSideBar topRepos= {TopRepos}/>

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
