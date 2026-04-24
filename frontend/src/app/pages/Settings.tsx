import type { FormEvent } from 'react';
import { useState } from 'react';
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { User, Bell, Shield, Palette, Key, Trash2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../components/layout/ThemeProvider';
import { useAppState } from '../components/state/AppStateContext';

type SettingsTab = 'profile' | 'account' | 'security' | 'notifications' | 'appearance';

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
    <div className="min-h-screen bg-background dark">
      <ChzHeader pageTitle="Settings" /*isLoggedIn={false}*/ />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-5xl px-4 py-8">
          <h1 className="text-foreground mb-6">Settings</h1>

          <div className="grid gap-6 md:grid-cols-[200px,1fr]">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-secondary text-foreground'
                      : 'text-[#c9d1d9] hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="rounded-lg border border-border bg-card p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-foreground mb-4">Public profile</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-foreground">Profile picture</label>
                        <div className="flex items-center gap-4">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] text-2xl text-white">
                            S
                          </div>
                          <button className="rounded-md bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary/80">
                            Upload new picture
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm text-foreground">Name</label>
                        <input
                          id="name"
                          type="text"
                          defaultValue="Sarah Developer"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm text-foreground">Username</label>
                        <input
                          id="username"
                          type="text"
                          defaultValue="sarahdev"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm text-foreground">Bio</label>
                        <textarea
                          id="bio"
                          rows={3}
                          defaultValue="Full-stack developer passionate about building great user experiences"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="website" className="text-sm text-foreground">Website</label>
                        <input
                          id="website"
                          type="url"
                          defaultValue="https://sarahdev.com"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm text-foreground">Location</label>
                        <input
                          id="location"
                          type="text"
                          defaultValue="San Francisco, CA"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <button className="rounded-md bg-[#fda410] px-4 py-2 font-medium text-white transition-colors hover:bg-[#e38c05]">
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-foreground mb-4">Account settings</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm text-foreground">Email</label>
                        <input
                          id="email"
                          type="email"
                          defaultValue="sarah@example.com"
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-foreground">Connected accounts</label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-md bg-secondary p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card">
                                <svg className="h-4 w-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                              </div>
                              <span className="text-sm text-foreground">GitHub</span>
                            </div>
                            <span className="text-xs text-[#fda410]">Connected</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md bg-secondary p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card">
                                <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                              </div>
                              <span className="text-sm text-foreground">Google</span>
                            </div>
                            <button className="text-xs text-[#c9d1d9] hover:text-foreground">Connect</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <button className="rounded-md bg-[#fda410] px-4 py-2 font-medium text-white transition-colors hover:bg-[#e38c05]">
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-foreground mb-4">Security settings</h2>
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">Password</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
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
                          className="rounded-md bg-[#fda410] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e38c05]"
                        >
                          Change Password
                        </button>
                      </div>
                      {showPasswordForm && (
                        <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
                          <div className="space-y-2">
                            <label htmlFor="current-password" className="text-sm text-foreground">Current password</label>
                            <input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(event) => setCurrentPassword(event.target.value)}
                              placeholder="Enter current password"
                              className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-[#7d8590] focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm text-foreground">New password</label>
                            <input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(event) => setNewPassword(event.target.value)}
                              placeholder="Choose a new password"
                              className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-[#7d8590] focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm text-foreground">Confirm new password</label>
                            <input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              placeholder="Confirm your new password"
                              className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-[#7d8590] focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          {passwordError && (
                            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                              {passwordError}
                            </div>
                          )}
                          <div className="pt-1">
                            <button className="rounded-md bg-[#fda410] px-4 py-2 font-medium text-white transition-colors hover:bg-[#e38c05]">
                              Update password
                            </button>
                          </div>
                        </form>
                      )}
                      {passwordSuccess && (
                        <div className="mt-4 rounded-md border border-[#3fb950]/30 bg-[#3fb950]/10 px-3 py-2 text-sm text-[#3fb950]">
                          {passwordSuccess}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-foreground mb-3">Two-factor authentication</h3>
                    <p className="mb-4 text-sm text-[#c9d1d9]">
                      Add an extra layer of security to your account
                    </p>
                    <button className="rounded-md bg-secondary px-4 py-2 text-foreground transition-colors hover:bg-secondary/80">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-foreground mb-4">Notification preferences</h2>
                    <div className="space-y-4">
                      {[
                        { label: 'Email notifications', desc: 'Receive email updates about your activity' },
                        { label: 'Push notifications', desc: 'Receive push notifications on your devices' },
                        { label: 'Activity notifications', desc: 'Get notified when someone interacts with your repos' },
                        { label: 'Security alerts', desc: 'Get alerted about security vulnerabilities' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-3">
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.label}</div>
                            <div className="text-xs text-[#c9d1d9]">{item.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fda410]"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <button className="rounded-md bg-[#fda410] px-4 py-2 font-medium text-white transition-colors hover:bg-[#e38c05]">
                      Save preferences
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-foreground mb-4">Appearance</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-foreground">Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setTheme('light')}
                            className={`rounded-lg border-2 p-4 transition-colors ${
                              theme === 'light' ? 'border-[#fda410]' : 'border-border hover:border-border/60'
                            }`}
                          >
                            <div className="mb-2 flex h-12 w-full items-center justify-center rounded border border-gray-200 bg-white">
                              <Sun className="h-6 w-6 text-gray-600" />
                            </div>
                            <span className="text-xs text-foreground">Light</span>
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`rounded-lg border-2 p-4 transition-colors ${
                              theme === 'dark' ? 'border-[#fda410]' : 'border-border hover:border-border/60'
                            }`}
                          >
                            <div className="mb-2 flex h-12 w-full items-center justify-center rounded bg-[#0d1117]">
                              <Moon className="h-6 w-6 text-gray-300" />
                            </div>
                            <span className="text-xs text-foreground">Dark</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">Use military time</div>
                          <div className="text-xs text-muted-foreground">
                            Toggle the navbar clock between 24-hour and 12-hour formats.
                          </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={use24HourTime}
                            onChange={(event) => setUse24HourTime(event.target.checked)}
                          />
                          <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fda410]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 border-t border-destructive pt-6">
                <h3 className="text-destructive mb-2">Danger Zone</h3>
                <p className="mb-4 text-sm text-[#c9d1d9]">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2 text-destructive transition-colors hover:bg-destructive/20">
                  <Trash2 className="h-4 w-4" />
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
