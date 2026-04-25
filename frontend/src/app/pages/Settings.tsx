import type { FormEvent } from 'react';
import { useState } from 'react';
import { User, Bell, Shield, Palette, Key, Trash2 } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { useTheme } from '../components/layout/ThemeProvider';
import { useAppState } from '../components/state/AppStateContext';
import { SettingsProfile } from '../components/chz-comp/SettingsProfile';
import { SettingsAccount } from '../components/chz-comp/SettingsAccount';
import { SettingsSecurity } from '../components/chz-comp/SettingsSecurity';
import { SettingsNotifications } from '../components/chz-comp/SettingsNotifications';
import { SettingsAppearance } from '../components/chz-comp/SettingsAppearance';
// DATA
import { type SettingsTab, notificationPreferences, connectedAccounts, profileData, accountData, } from '../data/settingsData';

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
              {activeTab === 'profile' && <SettingsProfile profileData={profileData} />}

              {activeTab === 'account' && (
                <SettingsAccount 
                  accountData={accountData} 
                  connectedAccounts={connectedAccounts} 
                />
              )}

              {activeTab === 'security' && (
                <SettingsSecurity
                  showPasswordForm={showPasswordForm}
                  onShowPasswordForm={setShowPasswordForm}
                  currentPassword={currentPassword}
                  onCurrentPasswordChange={setCurrentPassword}
                  newPassword={newPassword}
                  onNewPasswordChange={setNewPassword}
                  confirmPassword={confirmPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                  passwordError={passwordError}
                  passwordSuccess={passwordSuccess}
                  onPasswordSubmit={handlePasswordSubmit}
                />
              )}

              {activeTab === 'notifications' && (
                <SettingsNotifications 
                  notificationPreferences={notificationPreferences} 
                />
              )}

              {activeTab === 'appearance' && (
                <SettingsAppearance
                  theme={theme}
                  onThemeChange={setTheme}
                  use24HourTime={use24HourTime}
                  onUse24HourTimeChange={setUse24HourTime}
                />
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
