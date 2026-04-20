import { useParams, Link } from 'react-router';
import { ChevronRight, GitCommit, Users, Star, GitFork, TrendingUp } from 'lucide-react';
import { RepositoryLayout } from '../components/repository/RepositoryLayout';

export function RepositoryInsights() {
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
            <span className="text-foreground">Insights</span>
          </div>
          <h1 className="text-foreground">Repository Insights</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitCommit className="h-4 w-4 text-[#3fb950]" />
              <span className="text-sm text-muted-foreground">Total Commits</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">1,247</div>
            <div className="text-xs text-[#3fb950] mt-1">+42 this week</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-ring" />
              <span className="text-sm text-muted-foreground">Contributors</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">8</div>
            <div className="text-xs text-muted-foreground mt-1">Active this month</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-orange" />
              <span className="text-sm text-muted-foreground">Stars</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">248</div>
            <div className="text-xs text-[#3fb950] mt-1">+12 this week</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitFork className="h-4 w-4 text-[#8957e5]" />
              <span className="text-sm text-muted-foreground">Forks</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">45</div>
            <div className="text-xs text-muted-foreground mt-1">Total forks</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#3fb950]" />
            <h2 className="text-lg font-semibold text-foreground">Commit Activity</h2>
          </div>
          <div className="space-y-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">{day}</span>
                <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-[#3fb950] h-full rounded-full"
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-foreground w-12 text-right">
                  {Math.floor(Math.random() * 50)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Contributors</h2>
            <div className="space-y-3">
              {[
                { name: 'Sarah Developer', commits: 842, avatar: 'S' },
                { name: 'Mike Chen', commits: 234, avatar: 'M' },
                { name: 'Alex Kim', commits: 171, avatar: 'A' },
              ].map((contributor) => (
                <div key={contributor.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white text-sm">
                    {contributor.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">{contributor.name}</div>
                    <div className="text-xs text-muted-foreground">{contributor.commits} commits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Language Distribution</h2>
            <div className="space-y-3">
              {[
                { lang: 'TypeScript', percent: 68, color: 'bg-blue-500' },
                { lang: 'JavaScript', percent: 22, color: 'bg-yellow-500' },
                { lang: 'CSS', percent: 10, color: 'bg-purple-500' },
              ].map((lang) => (
                <div key={lang.lang}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground">{lang.lang}</span>
                    <span className="text-muted-foreground">{lang.percent}%</span>
                  </div>
                  <div className="bg-secondary rounded-full h-2 overflow-hidden">
                    <div className={`${lang.color} h-full rounded-full`} style={{ width: `${lang.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RepositoryLayout>
  );
}
