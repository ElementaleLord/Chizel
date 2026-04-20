import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Clock3 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { getContributions } from '../data/contributions';
import { getContributionIcon, type ContributionItem, type ContributionType } from '../data/userActivity';

function getContributionLabel(type: ContributionType) {
  switch (type) {
    case 'commit':
      return 'Commit';
    case 'pull_request':
      return 'Pull request';
    case 'issue':
      return 'Issue';
    case 'comment':
      return 'Comment';
    case 'review':
      return 'Review';
    default:
      return 'Contribution';
  }
}

function getContributionAccent(type: ContributionType) {
  switch (type) {
    case 'commit':
      return 'text-[#58a6ff] bg-[#58a6ff]/10';
    case 'pull_request':
      return 'text-[#3fb950] bg-[#3fb950]/10';
    case 'issue':
      return 'text-[#f85149] bg-[#f85149]/10';
    case 'comment':
      return 'text-[#fda410] bg-[#fda410]/10';
    case 'review':
      return 'text-[#8957e5] bg-[#8957e5]/10';
    default:
      return 'text-[#fda410] bg-[#fda410]/10';
  }
}

function ContributionCard({ item }: { item: ContributionItem }) {
  const Icon = getContributionIcon(item.type);
  const accentClasses = getContributionAccent(item.type);

  return (
    <li className="relative pl-14 sm:pl-16">
      <div
        className="absolute left-[1.05rem] top-14 h-[calc(100%-2rem)] w-px bg-border sm:left-[1.3rem]"
        aria-hidden="true"
      />
      <div
        className={`absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border border-border ${accentClasses}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <article className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border/70 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${accentClasses}`}>
                {getContributionLabel(item.type)}
              </span>
              <Link to={item.href} className="text-sm font-medium text-[#fda410] hover:underline">
                {item.repo}
              </Link>
              <span className="text-sm text-muted-foreground">{item.action}</span>
            </div>
            <div>
              <h2 className="text-base text-foreground sm:text-lg">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:justify-end">
            <Clock3 className="h-4 w-4" />
            <span>{item.time}</span>
          </div>
        </div>
      </article>
    </li>
  );
}

export function Contributions() {
  const [items, setItems] = useState<ContributionItem[]>([]);
  const [source, setSource] = useState<'api' | 'mock'>('mock');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContributions() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getContributions();
        if (!isMounted) {
          return;
        }

        setItems(response.items);
        setSource(response.source);
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Unable to load contributions right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContributions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="pt-14 lg:pl-64">
        <div className="container max-w-5xl px-4 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#fda410]">Activity feed</p>
              <h1 className="text-foreground">Contributions</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Recent commits, pull requests, issues, comments, and reviews in reverse chronological order.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              {items.length} items / {source === 'api' ? 'Live data' : 'Mock data'}
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card px-5 py-8 text-sm text-muted-foreground">
              Loading contributions...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card/50 px-4 py-6 sm:px-6">
              <ol className="space-y-6">
                {items.map((item) => (
                  <ContributionCard key={item.id} item={item} />
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
