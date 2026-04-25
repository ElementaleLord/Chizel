import { Bell, CircleDot, GitCommitHorizontal, GitPullRequest, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import './NotificationEntry.css';

interface NotifEntryProp {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
  icon?: any;
}

function getNotificationMeta(type: string): { label: string; icon: LucideIcon } {
  switch (type) {
    case 'pull_request':
      return { label: 'Pull request', icon: GitPullRequest };
    case 'issue':
      return { label: 'Issue', icon: CircleDot };
    case 'comment':
      return { label: 'Comment', icon: MessageSquare };
    case 'commit':
      return { label: 'Commit', icon: GitCommitHorizontal };
    default:
      return { label: 'Notification', icon: Bell };
  }
}

export function NotificationEntry({ notification }: { notification: NotifEntryProp }) {
  const { icon: Icon, label } = getNotificationMeta(notification.type);

  return (
    <Link
      to={notification.href}
      className={`notification-entry ${notification.unread ? 'notification-entry-unread' : ''}`}
    >
      {/* Icon and Meta Section */}
      <div className="notification-entry-meta">
        <div className="notification-entry-icon-wrapper">
          <Icon className="notification-entry-icon" />
        </div>
        <div className="notification-entry-meta-text">
          <p className="notification-entry-label">{label}</p>
          <p className="notification-entry-time">{notification.time}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="notification-entry-content">
        <div className="notification-entry-title-row">
          <p className="notification-entry-title">{notification.title}</p>
          <span
            className={`notification-entry-badge ${
              notification.unread
                ? 'notification-entry-badge-unread'
                : 'notification-entry-badge-read'
            }`}
          >
            {notification.unread ? 'Unread' : 'Read'}
          </span>
        </div>
        <p className="notification-entry-description">{notification.description}</p>
      </div>
    </Link>
  );
}