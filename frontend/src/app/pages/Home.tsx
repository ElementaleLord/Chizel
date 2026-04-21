import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GitCommit, Star, GitFork, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router';
import { RepositoryStarButton } from '../components/repository/RepositoryStarButton';
import { useAppState } from '../components/state/AppStateContext';
import { formatStarCount, getLanguageColor, getRepositoriesByIds, homeSuggestedRepositoryIds } from '../data/repositories';

const recentActivity = [
  { type: 'commit', repo: 'sarahdev/web-app', message: 'Fix authentication bug', time: '2h ago' },
  { type: 'star', repo: 'chizel/design-system', time: '4h ago' },
  { type: 'fork', repo: 'opensource/react-tools', time: '5h ago' },
];

const trending = [
  { name: 'ai/nanoid', desc: 'A tiny ID generator', stars: '22k', growth: '+2.3k' },
  { name: 'chakra-ui/chakra-ui', desc: 'Simple UI components', stars: '35k', growth: '+1.8k' },
];

export function Home() {
  const { isRepositoryStarred, toggleStarredRepository } = useAppState();
  const suggestedRepos = getRepositoriesByIds(homeSuggestedRepositoryIds);

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-7xl px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-foreground mb-4">Recent Activity</h1>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="p-4 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white text-sm">
                          {item.type === 'commit' && <GitCommit className="h-5 w-5" />}
                          {item.type === 'star' && <Star className="h-5 w-5" />}
                          {item.type === 'fork' && <GitFork className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <Link to={`/repository/${item.repo.split('/')[0]}/${item.repo.split('/')[1]}`} className="text-[#fda410] hover:underline">
                            {item.repo}
                          </Link>
                          {item.message && <p className="text-sm text-[#c9d1d9]">{item.message}</p>}
                        </div>
                        <span className="text-sm text-[#c9d1d9]">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/activity" className="inline-block mt-4 text-sm text-[#fda410] hover:underline">
                  View all activity →
                </Link>
              </div>

              <div>
                <h2 className="text-foreground mb-4">Suggested for you</h2>
                <div className="grid gap-4">
                  {suggestedRepos.map((repo) => (
                    <div key={repo.id} className="p-4 bg-card border border-border rounded-lg">
                      <Link to={`/repository/${repo.owner}/${repo.name}`} className="text-[#fda410] hover:underline font-medium">
                        {repo.id}
                      </Link>
                      <p className="text-sm text-[#c9d1d9] mt-1">{repo.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#c9d1d9]">
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                          <span>{repo.language}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{formatStarCount(repo.stars)}</span>
                        </div>
                        <div className="ml-auto">
                          <RepositoryStarButton
                            isStarred={isRepositoryStarred(repo.id)}
                            onToggle={() => toggleStarredRepository(repo.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-[#fda410]" />
                  <h3 className="text-foreground">Trending today</h3>
                </div>
                <div className="space-y-3">
                  {trending.map((repo, i) => (
                    <div key={i}>
                      <Link to="#" className="text-[#fda410] hover:underline text-sm font-medium">
                        {repo.name}
                      </Link>
                      <p className="text-xs text-[#c9d1d9] mt-0.5">{repo.desc}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#c9d1d9]">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                        <span className="text-[#3fb950]">{repo.growth} this week</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-[#fda410]" />
                  <h3 className="text-foreground">Your stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9d1d9]">Repositories</span>
                    <span className="text-foreground font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9d1d9]">Contributions</span>
                    <span className="text-foreground font-medium">1,847</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9d1d9]">Stars received</span>
                    <span className="text-foreground font-medium">342</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c9d1d9]">Followers</span>
                    <span className="text-foreground font-medium">128</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
