import {
  Check,
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  MessageSquare,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ContributionType = 'commit' | 'issue' | 'comment' | 'review' | 'pull_request' | 'branch' | 'star' | 'fork';
export type PullRequestStatus = 'open' | 'closed' | 'merged';

export interface NotificationItem {
  id: number;
  type: 'pull_request' | 'issue' | 'comment' | 'commit';
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
  icon: LucideIcon;
}

export interface ContributionItem {
  id: number;
  type: ContributionType;
  user: string;
  repo: string;
  action: string;
  title: string;
  description: string;
  time: string;
  occurredAt: string;
  href: string;
  branch?: string;
  status?: PullRequestStatus;
}

export interface UserPullRequestItem {
  id: number;
  number: number;
  title: string;
  repo: string;
  status: PullRequestStatus;
  time: string;
  occurredAt: string;
  comments: number;
  author: string;
  assignedTo?: string;
  href: string;
}

export const notificationSeed: NotificationItem[] = [
  {
    id: 1,
    type: 'pull_request',
    title: 'New pull request review',
    description: 'Sarah requested your review on `frontend-header-refresh`.',
    time: '5m ago',
    href: '/pull-requests',
    unread: true,
    icon: GitPullRequest,
  },
  {
    id: 2,
    type: 'commit',
    title: 'Commit pushed to main',
    description: 'Three new commits landed in `sarahdev/web-app`.',
    time: '22m ago',
    href: '/contributions',
    unread: true,
    icon: GitCommitHorizontal,
  },
  {
    id: 3,
    type: 'comment',
    title: 'Comment on issue #18',
    description: 'A teammate replied to your deployment bug report.',
    time: '1h ago',
    href: '/contributions',
    unread: false,
    icon: MessageSquare,
  },
  {
    id: 4,
    type: 'comment',
    title: 'Comment on issue #19',
    description: 'A teammate replied to your deployment bug report.',
    time: '9h ago',
    href: '/contributions',
    unread: true,
    icon: MessageSquare,
  },
];

export const contributionFeed: ContributionItem[] = [
  {
    id: 1,
    type: 'review',
    user: 'sarahdev',
    repo: 'company/api-server',
    action: 'requested changes on',
    title: 'Add rate limiting middleware',
    description: 'Left review notes about retry headers, burst limits, and tests for shared IP ranges.',
    time: '12 minutes ago',
    occurredAt: '2026-04-20T11:48:00Z',
    href: '/pull-requests',
    status: 'open',
  },
  {
    id: 2,
    type: 'comment',
    user: 'sarahdev',
    repo: 'team/mobile-app',
    action: 'commented on',
    title: 'Issue #18: App crashes on iOS 17',
    description: 'Added crash reproduction details and a note about the failing camera permission flow.',
    time: '45 minutes ago',
    occurredAt: '2026-04-20T11:15:00Z',
    href: '/contributions',
  },
  {
    id: 3,
    type: 'commit',
    user: 'sarahdev',
    repo: 'sarahdev/web-app',
    action: 'pushed to',
    title: 'Fix authentication bug in login flow',
    description: 'Tightened token refresh handling and resolved a redirect loop after session expiry.',
    time: '2 hours ago',
    occurredAt: '2026-04-20T09:00:00Z',
    href: '/repository/sarahdev/web-app/commits',
    branch: 'main',
  },
  {
    id: 4,
    type: 'pull_request',
    user: 'sarahdev',
    repo: 'company/api-server',
    action: 'opened pull request in',
    title: 'Add rate limiting middleware',
    description: 'Introduced request throttling, shared middleware utilities, and coverage for burst traffic.',
    time: '6 hours ago',
    occurredAt: '2026-04-20T05:30:00Z',
    href: '/pull-requests',
    status: 'open',
  },
  {
    id: 5,
    type: 'issue',
    user: 'sarahdev',
    repo: 'team/mobile-app',
    action: 'opened issue in',
    title: 'App crashes on iOS 17',
    description: 'Reported an iOS-specific crash after camera upload with steps to reproduce and logs.',
    time: '8 hours ago',
    occurredAt: '2026-04-20T03:10:00Z',
    href: '/contributions',
  },
  {
    id: 6,
    type: 'branch',
    user: 'sarahdev',
    repo: 'sarahdev/design-system',
    action: 'created branch in',
    title: 'feature/dark-mode-tokens',
    description: 'Started a branch for theme tokens and reusable semantic color aliases.',
    time: '1 day ago',
    occurredAt: '2026-04-19T14:20:00Z',
    href: '/repository/sarahdev/design-system/branches',
    branch: 'feature/dark-mode-tokens',
  },
  {
    id: 7,
    type: 'fork',
    user: 'sarahdev',
    repo: 'opensource/react-tools',
    action: 'forked',
    title: 'react-tools',
    description: 'Forked the repository to test a docs and DX cleanup pass locally.',
    time: '2 days ago',
    occurredAt: '2026-04-18T10:00:00Z',
    href: '/repositories',
  },
  {
    id: 8,
    type: 'star',
    user: 'sarahdev',
    repo: 'vercel/next.js',
    action: 'starred',
    title: 'next.js',
    description: 'Saved the repository for ongoing reference while reviewing routing and caching patterns.',
    time: '3 days ago',
    occurredAt: '2026-04-17T09:30:00Z',
    href: '/stars',
  },
];

export const submittedPullRequests: UserPullRequestItem[] = [
  {
    id: 1,
    number: 42,
    title: 'Add dark mode support',
    repo: 'sarahdev/web-app',
    status: 'open',
    time: '2 hours ago',
    occurredAt: '2026-04-20T09:00:00Z',
    comments: 5,
    author: 'Sarah Developer',
    href: '/repository/sarahdev/web-app/pulls',
  },
  {
    id: 2,
    number: 41,
    title: 'Fix authentication bug in login flow',
    repo: 'sarahdev/web-app',
    status: 'merged',
    time: '1 day ago',
    occurredAt: '2026-04-19T08:30:00Z',
    comments: 3,
    author: 'Sarah Developer',
    href: '/repository/sarahdev/web-app/pulls',
  },
  {
    id: 3,
    number: 39,
    title: 'Refactor authentication service',
    repo: 'sarahdev/web-app',
    status: 'closed',
    time: '5 days ago',
    occurredAt: '2026-04-15T15:00:00Z',
    comments: 8,
    author: 'Sarah Developer',
    href: '/repository/sarahdev/web-app/pulls',
  },
];

export const assignedPullRequests: UserPullRequestItem[] = [
  {
    id: 4,
    number: 108,
    title: 'Add rate limiting middleware',
    repo: 'company/api-server',
    status: 'open',
    time: '12 minutes ago',
    occurredAt: '2026-04-20T11:48:00Z',
    comments: 4,
    author: 'Mike Chen',
    assignedTo: 'Sarah Developer',
    href: '/repository/company/api-server/pulls',
  },
  {
    id: 5,
    number: 96,
    title: 'Stabilize payment webhook retries',
    repo: 'company/api-server',
    status: 'merged',
    time: '3 days ago',
    occurredAt: '2026-04-17T13:45:00Z',
    comments: 7,
    author: 'Nora Patel',
    assignedTo: 'Sarah Developer',
    href: '/repository/company/api-server/pulls',
  },
  {
    id: 6,
    number: 77,
    title: 'Fix iOS camera permission modal',
    repo: 'team/mobile-app',
    status: 'closed',
    time: '1 week ago',
    occurredAt: '2026-04-13T10:15:00Z',
    comments: 2,
    author: 'Alex Kim',
    assignedTo: 'Sarah Developer',
    href: '/repository/team/mobile-app/pulls',
  },
];

export function getContributionIcon(type: ContributionType): LucideIcon {
  switch (type) {
    case 'commit':
      return GitCommitHorizontal;
    case 'issue':
      return CircleDot;
    case 'comment':
      return MessageSquare;
    case 'review':
      return Check;
    case 'pull_request':
      return GitPullRequest;
    case 'branch':
      return GitBranch;
    case 'fork':
      return GitFork;
    case 'star':
      return Star;
    default:
      return GitCommitHorizontal;
  }
}
