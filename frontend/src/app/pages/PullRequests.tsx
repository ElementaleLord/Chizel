import { useState } from 'react';
import { Link } from 'react-router';
import { Check, ChevronDown, GitPullRequest, MessageSquare, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { assignedPullRequests, submittedPullRequests, type PullRequestStatus, type UserPullRequestItem } from '../data/userActivity';

function getPullRequestStatusStyles(status: PullRequestStatus) {
  switch (status) {
    case 'open':
      return {
        icon: GitPullRequest,
        badge: 'bg-[#3fb950]/10 text-[#3fb950]',
        iconClassName: 'text-[#3fb950]',
        label: 'Open',
      };
    case 'merged':
      return {
        icon: Check,
        badge: 'bg-[#8957e5]/10 text-[#8957e5]',
        iconClassName: 'text-[#8957e5]',
        label: 'Merged',
      };
    case 'closed':
      return {
        icon: X,
        badge: 'bg-destructive/10 text-destructive',
        iconClassName: 'text-destructive',
        label: 'Closed',
      };
    default:
      return {
        icon: GitPullRequest,
        badge: 'bg-[#3fb950]/10 text-[#3fb950]',
        iconClassName: 'text-[#3fb950]',
        label: 'Open',
      };
  }
}

function PullRequestSection({
  title,
  description,
  items,
  isExpanded,
  onToggle,
}: {
  title: string;
  description: string;
  items: UserPullRequestItem[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary/80"
          aria-expanded={isExpanded}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isExpanded && <div>
        {items.map((pr) => {
          const { badge, icon: StatusIcon, iconClassName, label } = getPullRequestStatusStyles(pr.status);

          return (
            <Link
              key={pr.id}
              to={pr.href}
              className="flex flex-col gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/40 sm:flex-row sm:items-start"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${badge}`}>
                <StatusIcon className={`h-4 w-4 ${iconClassName}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{pr.title}</h3>
                  <span className="text-sm text-muted-foreground">#{pr.number}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>{label}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pr.repo} / opened by {pr.author}
                  {pr.assignedTo ? ` / assigned to ${pr.assignedTo}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{pr.time}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {pr.comments} comments
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>}
    </section>
  );
}

export function PullRequests() {
  const [isSubmittedExpanded, setIsSubmittedExpanded] = useState(true);
  const [isAssignedExpanded, setIsAssignedExpanded] = useState(true);
  const submitted = [...submittedPullRequests].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
  const assigned = [...assignedPullRequests].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#fda410]">Collaboration</p>
              <h1 className="text-foreground">Pull Requests</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Track pull requests you submitted alongside work waiting on your review or assigned attention.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              {submitted.length + assigned.length} pull requests in view
            </div>
          </div>

          <div className="space-y-6">
            <PullRequestSection
              title="Submitted by you"
              description="Your most recent pull requests, newest first."
              items={submitted}
              isExpanded={isSubmittedExpanded}
              onToggle={() => setIsSubmittedExpanded((current) => !current)}
            />
            <PullRequestSection
              title="Received or assigned to you"
              description="Pull requests where you are a reviewer, assignee, or direct recipient."
              items={assigned}
              isExpanded={isAssignedExpanded}
              onToggle={() => setIsAssignedExpanded((current) => !current)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
