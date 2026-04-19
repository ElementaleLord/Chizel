import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Link, useParams } from 'react-router';
import { GitPullRequest, ChevronRight, MessageSquare, Check, X } from 'lucide-react';

const pullRequests = [
  {
    number: 42,
    title: 'Add dark mode support',
    author: 'Sarah Developer',
    status: 'open',
    comments: 5,
    time: '2 hours ago',
  },
  {
    number: 41,
    title: 'Fix authentication bug in login flow',
    author: 'Sarah Developer',
    status: 'merged',
    comments: 3,
    time: '1 day ago',
  },
  {
    number: 40,
    title: 'Update dependencies to latest versions',
    author: 'Sarah Developer',
    status: 'open',
    comments: 2,
    time: '3 days ago',
  },
  {
    number: 39,
    title: 'Refactor authentication service',
    author: 'Sarah Developer',
    status: 'closed',
    comments: 8,
    time: '5 days ago',
  },
];

export function RepositoryPullRequests() {
  const { owner, repo } = useParams();

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#c9d1d9] mb-4">
              <Link to={`/repository/${owner}/${repo}`} className="text-[#ff8c42] hover:underline">
                {owner}/{repo}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Pull Requests</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-foreground">Pull Requests</h1>
              <button className="px-4 py-2 bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors">
                New pull request
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button className="px-3 py-1.5 text-sm bg-[#ff8c42] text-white rounded-md font-medium">
              Open (2)
            </button>
            <button className="px-3 py-1.5 text-sm bg-secondary text-foreground rounded-md hover:bg-secondary/80">
              Closed (1)
            </button>
            <button className="px-3 py-1.5 text-sm bg-secondary text-foreground rounded-md hover:bg-secondary/80">
              Merged (1)
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {pullRequests.map((pr, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
              >
                <div className="mt-1">
                  {pr.status === 'open' && (
                    <div className="w-8 h-8 rounded-full bg-[#3fb950]/10 flex items-center justify-center">
                      <GitPullRequest className="h-4 w-4 text-[#3fb950]" />
                    </div>
                  )}
                  {pr.status === 'merged' && (
                    <div className="w-8 h-8 rounded-full bg-[#8957e5]/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-[#8957e5]" />
                    </div>
                  )}
                  {pr.status === 'closed' && (
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <X className="h-4 w-4 text-destructive" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-medium hover:text-[#ff8c42] cursor-pointer">
                    {pr.title} <span className="text-[#c9d1d9]">#{pr.number}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[#c9d1d9]">
                    <span>opened {pr.time} by {pr.author}</span>
                    {pr.comments > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{pr.comments}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
