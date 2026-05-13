import { useMemo, useState } from 'react';
import { CheckCircle2, CircleDot, ExternalLink, Search, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { ChzHeader } from '../components/chz-comp/ChzHeader';

import './Issues.css';

type IssueStatus = 'open' | 'closed' | 'assigned';
type IssueFilter = 'all' | IssueStatus;

interface IssueInboxItem {
  id: number;
  repository: string;
  title: string;
  preview: string;
  author: string;
  time: string;
  status: IssueStatus;
  unread: boolean;
  href: string;
}

const issueSeed: IssueInboxItem[] = [
  {
    id: 1,
    repository: 'company/api-server',
    title: 'Fix retry loop when token refresh fails',
    preview: 'New reports show the API can keep retrying after a 401 response instead of clearing the session cleanly.',
    author: 'Nora Patel',
    time: '12m ago',
    status: 'assigned',
    unread: true,
    href: '/repository/company/api-server/issues',
  },
  {
    id: 2,
    repository: 'team/mobile-app',
    title: 'Camera upload crashes on iOS 17.4',
    preview: 'Crash logs point to the permission callback firing after the view controller has already been dismissed.',
    author: 'Alex Kim',
    time: '1h ago',
    status: 'open',
    unread: true,
    href: '/repository/team/mobile-app/issues',
  },
  {
    id: 3,
    repository: 'design/system-kit',
    title: 'Audit inconsistent button spacing in modal footer',
    preview: 'A few modal layouts still use legacy spacing tokens, so the action row feels off compared to the rest of the app.',
    author: 'Sarah Developer',
    time: 'Today',
    status: 'open',
    unread: false,
    href: '/repository/design/system-kit/issues',
  },
  {
    id: 4,
    repository: 'ops/deployment-dashboard',
    title: 'Close stale alert after rollout completes',
    preview: 'Follow-up note confirms the production deploy succeeded, but the issue was never closed from the incident checklist.',
    author: 'Mike Chen',
    time: 'Yesterday',
    status: 'closed',
    unread: false,
    href: '/repository/ops/deployment-dashboard/issues',
  },
];

const filterOptions: Array<{ value: IssueFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'assigned', label: 'Assigned' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function IssueFilterBar({
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
}: {
  activeFilter: IssueFilter;
  onFilterChange: (filter: IssueFilter) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="issues-inbox-toolbar">
      <div className="issues-inbox-filters" role="tablist" aria-label="Issue filters">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`issues-inbox-filter-btn ${
              activeFilter === option.value ? 'issues-inbox-filter-btn-active' : ''
            }`}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="issues-inbox-search" aria-label="Search issues">
        <Search className="issues-inbox-search-icon" />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title or repository"
          className="issues-inbox-search-input"
        />
      </label>
    </div>
  );
}

function IssueCard({
  issue,
  expanded,
  onToggleExpand,
  onToggleRead,
  onToggleStatus,
}: {
  issue: IssueInboxItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: () => void;
  onToggleStatus: () => void;
}) {
  const isClosed = issue.status === 'closed';
  const statusLabel = issue.status.charAt(0).toUpperCase() + issue.status.slice(1);

  return (
    <article
      className={`issues-inbox-card ${issue.unread ? 'issues-inbox-card-unread' : ''}`}
      onClick={onToggleExpand}
    >
      <div className="issues-inbox-card-main">
        <div className="issues-inbox-card-status">
          <div
            className={`issues-inbox-status-icon ${
              isClosed ? 'issues-inbox-status-closed' : 'issues-inbox-status-open'
            }`}
          >
            {isClosed ? <CheckCircle2 /> : <CircleDot />}
          </div>
        </div>

        <div className="issues-inbox-card-content">
          <div className="issues-inbox-card-top">
            <div className="issues-inbox-card-heading">
              <p className="issues-inbox-card-repository">{issue.repository}</p>
              <div className="issues-inbox-card-title-row">
                <h3 className="issues-inbox-card-title">{issue.title}</h3>
                <span className={`issues-inbox-badge issues-inbox-badge-${issue.status}`}>
                  {statusLabel}
                </span>
                <span
                  className={`issues-inbox-read-badge ${
                    issue.unread ? 'issues-inbox-read-badge-unread' : ''
                  }`}
                >
                  {issue.unread ? 'Unread' : 'Read'}
                </span>
              </div>
            </div>

            <p className="issues-inbox-card-time">{issue.time}</p>
          </div>

          <p className="issues-inbox-card-preview">{issue.preview}</p>

          <div className="issues-inbox-card-meta">
            <div className="issues-inbox-author">
              <span className="issues-inbox-author-avatar">{getInitials(issue.author)}</span>
              <span className="issues-inbox-author-name">{issue.author}</span>
            </div>
            <span className="issues-inbox-meta-separator" />
            <span className="issues-inbox-meta-label">
              <UserRound className="issues-inbox-meta-icon" />
              Issue activity
            </span>
          </div>

          {expanded ? (
            <div className="issues-inbox-card-actions" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="issues-inbox-action-btn" onClick={onToggleRead}>
                Mark as {issue.unread ? 'read' : 'unread'}
              </button>
              <Link to={issue.href} className="issues-inbox-action-btn issues-inbox-action-link">
                <ExternalLink className="issues-inbox-action-icon" />
                Open issue
              </Link>
              <button type="button" className="issues-inbox-action-btn" onClick={onToggleStatus}>
                {isClosed ? 'Reopen issue' : 'Close issue'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function IssueList({
  items,
  expandedId,
  onToggleExpand,
  onToggleRead,
  onToggleStatus,
}: {
  items: IssueInboxItem[];
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onToggleRead: (id: number) => void;
  onToggleStatus: (id: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="issues-inbox-empty">
        <div className="issues-inbox-empty-icon">
          <Search />
        </div>
        <h2 className="issues-inbox-empty-title">No issues found</h2>
        <p className="issues-inbox-empty-text">
          Try a different search or switch filters to see more issue activity.
        </p>
      </div>
    );
  }

  return (
    <div className="issues-inbox-list">
      {items.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          expanded={expandedId === issue.id}
          onToggleExpand={() => onToggleExpand(issue.id)}
          onToggleRead={() => onToggleRead(issue.id)}
          onToggleStatus={() => onToggleStatus(issue.id)}
        />
      ))}
    </div>
  );
}

export function Issues() {
  const [activeFilter, setActiveFilter] = useState<IssueFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(issueSeed[0]?.id ?? null);
  const [issues, setIssues] = useState<IssueInboxItem[]>(issueSeed);

  const filteredIssues = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesFilter = activeFilter === 'all' ? true : issue.status === activeFilter;
      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : issue.title.toLowerCase().includes(normalizedSearch) ||
            issue.repository.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, issues, searchValue]);

  const unreadCount = issues.filter((issue) => issue.unread).length;

  function toggleExpand(id: number) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function toggleRead(id: number) {
    setIssues((current) =>
      current.map((issue) => (issue.id === id ? { ...issue, unread: !issue.unread } : issue)),
    );
  }

  function toggleStatus(id: number) {
    setIssues((current) =>
      current.map((issue) => {
        if (issue.id !== id) {
          return issue;
        }

        if (issue.status === 'closed') {
          return { ...issue, status: 'open' };
        }

        return { ...issue, status: 'closed' };
      }),
    );
  }

  return (
    <div className="issuespage-container">
      <ChzHeader pageTitle="Issues" />

      <main className="issuespage-main">
        <div className="issuespage-wrapper">
          <div className="issuespage-header">
            <div className="issuespage-header-left">
              <p className="issuespage-header-label">Inbox</p>
              <h1 className="issuespage-header-title">Issues</h1>
              <p className="issuespage-header-description">Track and manage issue activity.</p>
            </div>
            <div className="issuespage-header-stats">
              {unreadCount} unread / {filteredIssues.length} in view
            </div>
          </div>

          <section className="issuespage-panel">
            <IssueFilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
            <IssueList
              items={filteredIssues}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              onToggleRead={toggleRead}
              onToggleStatus={toggleStatus}
            />
          </section>
        </div>
      </main>
    </div>
  );
}