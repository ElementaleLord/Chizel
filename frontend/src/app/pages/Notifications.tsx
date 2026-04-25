// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { NotificationEntry } from '../components/chz-comp/NotificationEntry';
// DATA
import { notificationSeed } from '../data/userActivity';

import './Notifications.css';

export function Notifications() {
  const notifications = [...notificationSeed];
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <div className="notifications-container">
      <ChzHeader pageTitle="Notifications" />
      <main className="notifications-main">
        <div className="notifications-wrapper">
          {/* Header Section */}
          <div className="notifications-header">
            <div className="notifications-header-left">
              <p className="notifications-header-label">Inbox</p>
              <h1 className="notifications-header-title">Notifications</h1>
              <p className="notifications-header-description">
                Review pull request updates, comments, commits, and other recent activity in one place.
              </p>
            </div>
            <div className="notifications-header-stats">
              {unreadCount} unread / {notifications.length} total
            </div>
          </div>

          {/* Notifications Section */}
          <section className="notifications-section">
            <div className="notifications-section-header">
              <h2 className="notifications-section-title">Recent notifications</h2>
            </div>
            <div className="notifications-section-list">
              {notifications.map((notification) => (
                <NotificationEntry key={notification.id} notification={notification} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}