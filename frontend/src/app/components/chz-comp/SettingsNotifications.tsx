import '../../pages/SettingsBase.css';
import './SettingsNotifications.css';

interface NotificationPreference {
  label: string;
  desc: string;
}

interface SettingsNotificationsProps {
  notificationPreferences: NotificationPreference[];
}

export function SettingsNotifications({ notificationPreferences }: SettingsNotificationsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="settings-section-heading">Notification preferences</h2>
        <div className="space-y-4">
          {notificationPreferences.map((item) => (
            <div key={item.label} className="settings-notification-item">
              <div>
                <div className="settings-notification-label">{item.label}</div>
                <div className="settings-notification-desc">{item.desc}</div>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" className="settings-toggle-input" defaultChecked />
                <div className="settings-toggle-slider"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="settings-divider">
        <button className="settings-save-btn">
          Save preferences
        </button>
      </div>
    </div>
  );
}
