import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GitCommit, Star, GitFork, GitPullRequest, CircleDot, GitBranch } from 'lucide-react';

const activityItems = [
  {
    id: 1,
    type: 'commit',
    user: 'sarahdev',
    action: 'pushed to',
    repo: 'sarahdev/web-app',
    branch: 'main',
    message: 'Fix authentication bug in login flow',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'star',
    user: 'sarahdev',
    action: 'starred',
    repo: 'chizel/design-system',
    time: '4 hours ago',
  },
  {
    id: 3,
    type: 'fork',
    user: 'sarahdev',
    action: 'forked',
    repo: 'opensource/react-tools',
    time: '5 hours ago',
  },
  {
    id: 4,
    type: 'pr',
    user: 'sarahdev',
    action: 'opened pull request in',
    repo: 'company/api-server',
    prTitle: 'Add rate limiting middleware',
    time: '6 hours ago',
  },
  {
    id: 5,
    type: 'issue',
    user: 'sarahdev',
    action: 'opened issue in',
    repo: 'team/mobile-app',
    issueTitle: 'App crashes on iOS 17',
    time: '8 hours ago',
  },
  {
    id: 6,
    type: 'branch',
    user: 'sarahdev',
    action: 'created branch',
    repo: 'sarahdev/web-app',
    branch: 'feature/dark-mode',
    time: '1 day ago',
  },
  {
    id: 7,
    type: 'commit',
    user: 'sarahdev',
    action: 'pushed to',
    repo: 'sarahdev/design-system',
    branch: 'main',
    message: 'Update button component styles',
    time: '2 days ago',
  },
  {
    id: 8,
    type: 'star',
    user: 'sarahdev',
    action: 'starred',
    repo: 'vercel/next.js',
    time: '3 days ago',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'commit':
      return <GitCommit className="h-4 w-4" />;
    case 'star':
      return <Star className="h-4 w-4" />;
    case 'fork':
      return <GitFork className="h-4 w-4" />;
    case 'pr':
      return <GitPullRequest className="h-4 w-4" />;
    case 'issue':
      return <CircleDot className="h-4 w-4" />;
    case 'branch':
      return <GitBranch className="h-4 w-4" />;
    default:
      return null;
  }
};

export function Activity() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-foreground">Activity Timeline</h1>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-[#fda410] text-white rounded-md font-medium">
                All
              </button>
              <button className="px-3 py-1.5 text-sm bg-secondary text-foreground rounded-md hover:bg-secondary/80">
                Commits
              </button>
              <button className="px-3 py-1.5 text-sm bg-secondary text-foreground rounded-md hover:bg-secondary/80">
                Pull Requests
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-6">
              {activityItems.map((item) => (
                <div key={item.id} className="relative pl-12">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center text-[#fda410]">
                    {getIcon(item.type)}
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-foreground">{item.user}</span>
                          <span className="text-sm text-[#c9d1d9]">{item.action}</span>
                          <span className="text-sm text-[#fda410] hover:underline cursor-pointer">
                            {item.repo}
                          </span>
                          {item.branch && (
                            <span className="px-2 py-0.5 text-xs bg-secondary text-foreground rounded-full">
                              {item.branch}
                            </span>
                          )}
                        </div>
                        {item.message && (
                          <p className="text-sm text-[#c9d1d9] mt-1">{item.message}</p>
                        )}
                        {item.prTitle && (
                          <p className="text-sm text-foreground mt-1">{item.prTitle}</p>
                        )}
                        {item.issueTitle && (
                          <p className="text-sm text-foreground mt-1">{item.issueTitle}</p>
                        )}
                      </div>
                      <span className="text-xs text-[#c9d1d9] whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="px-4 py-2 text-sm text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              Load more activity
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
