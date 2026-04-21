import { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { contributionFeed, getContributionIcon, type ContributionType } from '../data/userActivity';

type ActivityFilter = 'all' | 'commit' | 'issue' | 'pull_request' | 'comment' | 'review';

const filterOptions: { label: string; value: ActivityFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Commits', value: 'commit' },
  { label: 'Issues', value: 'issue' },
  { label: 'Pull Requests', value: 'pull_request' },
  { label: 'Comments', value: 'comment' },
  { label: 'Reviews', value: 'review' },
];

export function Activity() {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const filteredActivity = useMemo(
    () =>
      contributionFeed.filter(
        (item) => activeFilter === 'all' || item.type === (activeFilter as ContributionType),
      ),
    [activeFilter],
  );

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-foreground">Activity Timeline</h1>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeFilter === option.value
                      ? 'bg-[#fda410] text-white font-medium'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-6">
              {filteredActivity.map((item) => {
                const Icon = getContributionIcon(item.type);

                return (
                <div key={item.id} className="relative pl-12">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center text-[#fda410]">
                    <Icon className="h-4 w-4" />
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
                        <p className="text-sm text-foreground mt-1">{item.title}</p>
                        <p className="text-sm text-[#c9d1d9] mt-1">{item.description}</p>
                      </div>
                      <span className="text-xs text-[#c9d1d9] whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>
                </div>
              )})}
              {filteredActivity.length === 0 && (
                <div className="relative pl-12">
                  <div className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                    No activity matches this filter yet.
                  </div>
                </div>
              )}
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
