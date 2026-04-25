import type { FormEvent } from 'react';
import { useState } from 'react';
import { User, Bell, Shield, Palette, Key, Trash2, Sun, Moon } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { useTheme } from '../components/layout/ThemeProvider';
import { useAppState } from '../components/state/AppStateContext';
// DATA
import { 
  type SettingsTab,
  notificationPreferences,
  connectedAccounts,
  profileData,
  accountData,
} from '../data/settingsData';
// STYLES
import './Settings.css';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { use24HourTime, setUse24HourTime } = useAppState();

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'account' as const, label: 'Account', icon: Key },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSuccess('Your password has been updated for this session.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  }

  return (
    <div className="settings-page-container">
      <ChzHeader pageTitle="Settings" />

      <main className="settings-page-main">
        <div className="settings-page-wrapper">
          <h1 className="settings-page-title">Settings</h1>

          <div className="settings-layout">
            {/* Sidebar Navigation */}
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-nav-btn ${
                    activeTab === tab.id
                      ? 'settings-nav-btn-active'
                      : 'settings-nav-btn-inactive'
                  }`}
                >
                  <tab.icon className="settings-nav-icon" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Content Panel */}
            <div className="settings-content-panel">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="settings-section-heading">Public profile</h2>
                    <div className="space-y-4">
                      <div className="settings-form-group">
                        <label className="settings-label">Profile picture</label>
                        <div className="settings-profile-pic-group">
                          <div className="settings-profile-pic">
                            {profileData.avatar}
                          </div>
                          <button className="settings-upload-btn">
                            Upload new picture
                          </button>
                        </div>
                      </div>
                      <div className="settings-form-group">
                        <label htmlFor="name" className="settings-label">Name</label>
                        <input
                          id="name"
                          type="text"
                          defaultValue={profileData.name}
                          className="settings-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label htmlFor="username" className="settings-label">Username</label>
                        <input
                          id="username"
                          type="text"
                          defaultValue={profileData.username}
                          className="settings-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label htmlFor="bio" className="settings-label">Bio</label>
                        <textarea
                          id="bio"
                          rows={3}
                          defaultValue={profileData.bio}
                          className="settings-textarea"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label htmlFor="website" className="settings-label">Website</label>
                        <input
                          id="website"
                          type="url"
                          defaultValue={profileData.website}
                          className="settings-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label htmlFor="location" className="settings-label">Location</label>
                        <input
                          id="location"
                          type="text"
                          defaultValue={profileData.location}
                          className="settings-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="settings-divider">
                    <button className="settings-save-btn">
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="settings-section-heading">Account settings</h2>
                    <div className="space-y-4">
                      <div className="settings-form-group">
                        <label htmlFor="email" className="settings-label">Email</label>
                        <input
                          id="email"
                          type="email"
                          defaultValue={accountData.email}
                          className="settings-input"
                        />
                      </div>
                      <div className="settings-form-group">
                        <label className="settings-label">Connected accounts</label>
                        <div className="space-y-2">
                          {connectedAccounts.map((account) => (
                            <div key={account.id} className="settings-connected-item">
                              <div className="settings-connected-info">
                                <div className="settings-connected-icon">
                                  {account.id === 'github' && (
                                    <svg className="h-4 w-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                  )}
                                  {account.id === 'google' && (
                                    <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                  )}
                                </div>
                                <span className="settings-connected-label">{account.name}</span>
                              </div>
                              {account.connected ? (
                                <span className="settings-connected-status">Connected</span>
                              ) : (
                                <button className="settings-connect-btn">Connect</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="settings-divider">
                    <button className="settings-save-btn">
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="settings-section-heading">Security settings</h2>
                    <div className="settings-security-box">
                      <div className="settings-security-header">
                        <div>
                          <h3 className="settings-security-title">Password</h3>
                          <p className="settings-security-desc">
                            Open the password form when you want to update your account credentials.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm((current) => !current);
                            setPasswordError(null);
                            setPasswordSuccess(null);
                          }}
                          className="settings-security-btn"
                        >
                          Change Password
                        </button>
                      </div>
                      {showPasswordForm && (
                        <form className="settings-password-form" onSubmit={handlePasswordSubmit}>
                          <div className="settings-form-group">
                            <label htmlFor="current-password" className="settings-label">Current password</label>
                            <input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(event) => setCurrentPassword(event.target.value)}
                              placeholder="Enter current password"
                              className="settings-input"
                            />
                          </div>
                          <div className="settings-form-group">
                            <label htmlFor="new-password" className="settings-label">New password</label>
                            <input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(event) => setNewPassword(event.target.value)}
                              placeholder="Choose a new password"
                              className="settings-input"
                            />
                          </div>
                          <div className="settings-form-group">
                            <label htmlFor="confirm-password" className="settings-label">Confirm new password</label>
                            <input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              placeholder="Confirm your new password"
                              className="settings-input"
                            />
                          </div>
                          {passwordError && (
                            <div className="settings-error-alert">
                              {passwordError}
                            </div>
                          )}
                          <div className="pt-1">
                            <button className="settings-save-btn">
                              Update password
                            </button>
                          </div>
                        </form>
                      )}
                      {passwordSuccess && (
                        <div className="settings-success-alert">
                          {passwordSuccess}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="settings-2fa-section">
                    <h3 className="settings-2fa-title">Two-factor authentication</h3>
                    <p className="settings-2fa-desc">
                      Add an extra layer of security to your account
                    </p>
                    <button className="settings-upload-btn">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
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
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="settings-section-heading">Appearance</h2>
                    <div className="space-y-4">
                      <div className="settings-form-group">
                        <label className="settings-label">Theme</label>
                        <div className="settings-theme-grid">
                          <button
                            onClick={() => setTheme('light')}
                            className={`settings-theme-btn ${
                              theme === 'light' ? 'settings-theme-btn-active' : ''
                            }`}
                          >
                            <div className="settings-theme-preview bg-white border-gray-200">
                              <Sun className="h-6 w-6 text-gray-600" />
                            </div>
                            <span className="settings-theme-label">Light</span>
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`settings-theme-btn ${
                              theme === 'dark' ? 'settings-theme-btn-active' : ''
                            }`}
                          >
                            <div className="settings-theme-preview bg-[#0d1117]">
                              <Moon className="h-6 w-6 text-gray-300" />
                            </div>
                            <span className="settings-theme-label">Dark</span>
                          </button>
                        </div>
                      </div>
                      <div className="settings-security-box">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-foreground">Use military time</div>
                            <div className="text-xs text-muted-foreground">
                              Toggle the navbar clock between 24-hour and 12-hour formats.
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              className="settings-toggle-input"
                              checked={use24HourTime}
                              onChange={(event) => setUse24HourTime(event.target.checked)}
                            />
                            <div className="settings-toggle-slider"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="settings-danger-zone">
                <h3 className="settings-danger-title">Danger Zone</h3>
                <p className="settings-danger-desc">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="settings-delete-btn">
                  <Trash2 className="settings-delete-icon" />
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}