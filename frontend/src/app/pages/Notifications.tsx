import { Link } from 'react-router';
import { Bell, CircleDot, GitCommitHorizontal, GitPullRequest, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { notificationSeed, type NotificationItem } from '../data/userActivity';

function getNotificationMeta(notification: NotificationItem): { label: string; icon: LucideIcon } {
  switch (notification.type) {
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

export function Notifications() {
  const notifications = [...notificationSeed];
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-5xl px-4 py-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#fda410]">Inbox</p>
              <h1 className="text-foreground">Notifications</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review pull request updates, comments, commits, and other recent activity in one place.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              {unreadCount} unread / {notifications.length} total
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-foreground">Recent notifications</h2>
            </div>
            <div>
              {notifications.map((notification) => {
                const { icon: Icon, label } = getNotificationMeta(notification);

                return (
                  <Link
                    key={notification.id}
                    to={notification.href}
                    className={`flex flex-col gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/40 sm:flex-row sm:items-start ${
                      notification.unread ? 'bg-secondary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fda410]/10 text-[#fda410]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            notification.unread
                              ? 'bg-[#fda410]/15 text-[#fda410]'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {notification.unread ? 'Unread' : 'Read'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
