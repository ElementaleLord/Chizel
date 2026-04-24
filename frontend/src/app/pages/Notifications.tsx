// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { NotificationEntry } from '../components/chz-comp/NotificationEntry';
// DATA
import { notificationSeed } from '../data/userActivity';

export function Notifications() {
  const notifications = [...notificationSeed];
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <div className="min-h-screen bg-background dark">
       <ChzHeader pageTitle="Notifications" /* isLoggedIn={true} */ />

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
              {notifications.map((notification) => (
                  <NotificationEntry notification={notification} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
