import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { Link, useParams } from 'react-router';
import { GitCommit, ChevronRight } from 'lucide-react';

const commits = [
  {
    hash: 'a1b2c3d',
    message: 'Fix authentication bug in login flow',
    author: 'Sarah Developer',
    time: '2 hours ago',
    avatar: 'S',
  },
  {
    hash: 'e4f5g6h',
    message: 'Update dependencies to latest versions',
    author: 'Sarah Developer',
    time: '1 day ago',
    avatar: 'S',
  },
  {
    hash: 'i7j8k9l',
    message: 'Add dark mode support',
    author: 'Sarah Developer',
    time: '3 days ago',
    avatar: 'S',
  },
  {
    hash: 'm0n1o2p',
    message: 'Refactor authentication service',
    author: 'Sarah Developer',
    time: '5 days ago',
    avatar: 'S',
  },
  {
    hash: 'q3r4s5t',
    message: 'Initial commit',
    author: 'Sarah Developer',
    time: '2 weeks ago',
    avatar: 'S',
  },
];

export function RepositoryCommits() {
  const { owner, repo } = useParams();

  return (
    <div className="min-h-screen bg-background dark">
      <ChzHeader pageTitle= {`${owner} / ${repo}`} /*isLoggedIn={true}*/ />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#c9d1d9] mb-4">
              <Link to={`/repository/${owner}/${repo}`} className="text-[#fda410] hover:underline">
                {owner}/{repo}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Commits</span>
            </div>
            <h1 className="text-foreground">Commit History</h1>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {commits.map((commit, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white flex-shrink-0">
                  {commit.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{commit.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[#c9d1d9]">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span>{commit.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 text-xs bg-secondary text-foreground rounded font-mono">
                    {commit.hash}
                  </code>
                  <button className="text-[#fda410] hover:text-[#e38c05]">
                    <GitCommit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
