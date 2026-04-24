import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { Link, useParams } from 'react-router';
import { GitBranch, ChevronRight, Clock } from 'lucide-react';

const branches = [
  { name: 'main', isDefault: true, ahead: 0, behind: 0, updated: '2 hours ago' },
  { name: 'feature/dark-mode', isDefault: false, ahead: 12, behind: 3, updated: '1 day ago' },
  { name: 'feature/authentication', isDefault: false, ahead: 8, behind: 0, updated: '3 days ago' },
  { name: 'bugfix/login-error', isDefault: false, ahead: 2, behind: 5, updated: '5 days ago' },
];

export function RepositoryBranches() {
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
              <span className="text-foreground">Branches</span>
            </div>
            <h1 className="text-foreground">Branches</h1>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {branches.map((branch, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <GitBranch className="h-5 w-5 text-[#fda410]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{branch.name}</span>
                      {branch.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-secondary text-foreground rounded-full border border-border">
                          default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[#c9d1d9]">
                      <Clock className="h-3 w-3" />
                      <span>Updated {branch.updated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {!branch.isDefault && (
                    <div className="text-sm text-[#c9d1d9]">
                      {branch.ahead > 0 && <span className="text-[#3fb950]">{branch.ahead} ahead</span>}
                      {branch.ahead > 0 && branch.behind > 0 && <span className="mx-1">•</span>}
                      {branch.behind > 0 && <span className="text-[#d29922]">{branch.behind} behind</span>}
                    </div>
                  )}
                  <button className="px-3 py-1.5 text-sm bg-secondary text-foreground hover:bg-secondary/80 rounded-md">
                    View
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
