import { useParams, Link } from 'react-router';
import { CircleDot, MessageSquare, Check, Plus, Search, ChevronRight } from 'lucide-react';
import { RepositoryLayout } from '../components/repository/RepositoryLayout';

const issues = [
  {
    number: 42,
    title: 'App crashes on iOS 17 devices',
    author: 'Sarah Developer',
    status: 'open',
    comments: 8,
    time: '2 hours ago',
    labels: ['bug', 'mobile'],
  },
  {
    number: 41,
    title: 'Add dark mode support to settings page',
    author: 'Mike Chen',
    status: 'open',
    comments: 3,
    time: '1 day ago',
    labels: ['enhancement'],
  },
  {
    number: 40,
    title: 'Update dependencies to latest versions',
    author: 'Alex Kim',
    status: 'closed',
    comments: 5,
    time: '3 days ago',
    labels: ['dependencies'],
  },
];

export function RepositoryIssues() {
  const { owner, repo } = useParams();

  return (
    <RepositoryLayout>
      <div className="container max-w-6xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to={`/repository/${owner}/${repo}`} className="text-ring hover:underline">
              {owner}/{repo}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Issues</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-foreground">Issues</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors">
              <Plus className="h-4 w-4" />
              New issue
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issues..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button className="px-3 py-1.5 text-sm bg-[#238636] text-white rounded-md font-medium">
            Open (2)
          </button>
          <button className="px-3 py-1.5 text-sm bg-secondary text-foreground rounded-md hover:bg-muted">
            Closed (1)
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {issues.map((issue, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
            >
              <div className="mt-1">
                {issue.status === 'open' ? (
                  <div className="w-8 h-8 rounded-full bg-[#238636]/10 flex items-center justify-center">
                    <CircleDot className="h-4 w-4 text-[#3fb950]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#8957e5]/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#8957e5]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-foreground font-medium hover:text-ring cursor-pointer mb-1">
                  {issue.title} <span className="text-muted-foreground">#{issue.number}</span>
                </h3>
                <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                  <span>opened {issue.time} by {issue.author}</span>
                  {issue.comments > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{issue.comments}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-0.5 text-xs bg-secondary text-foreground border border-border rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RepositoryLayout>
  );
}
