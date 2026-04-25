import { Check, GitPullRequest, X } from 'lucide-react';
import type { PullRequestStatus } from '../data/userActivity';

export interface PullRequestStatusStyle {
  icon: typeof GitPullRequest;
  badge: string;
  iconClassName: string;
  badgeClassName: string;
  label: string;
}

export function getPullRequestStatusStyles(status: PullRequestStatus): PullRequestStatusStyle {
  switch (status) {
    case 'open':
      return {
        icon: GitPullRequest,
        badge: 'prsection-status-open',
        badgeClassName: 'prsection-status-open',
        iconClassName: 'prsection-status-icon-open',
        label: 'Open',
      };
    case 'merged':
      return {
        icon: Check,
        badge: 'prsection-status-merged',
        badgeClassName: 'prsection-status-merged',
        iconClassName: 'prsection-status-icon-merged',
        label: 'Merged',
      };
    case 'closed':
      return {
        icon: X,
        badge: 'prsection-status-closed',
        badgeClassName: 'prsection-status-closed',
        iconClassName: 'prsection-status-icon-closed',
        label: 'Closed',
      };
    default:
      return {
        icon: GitPullRequest,
        badge: 'prsection-status-open',
        badgeClassName: 'prsection-status-open',
        iconClassName: 'prsection-status-icon-open',
        label: 'Open',
      };
  }
}
