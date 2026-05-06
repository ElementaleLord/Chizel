import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { User, Bell, Shield, Palette, Key, Trash2 } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { useAuth } from '../components/auth/AuthContext';
import { useTheme } from '../components/layout/ThemeProvider';
import { useAppState } from '../components/state/AppStateContext';
import { SettingsProfile } from '../components/chz-comp/SettingsProfile';
import { SettingsSecurity } from '../components/chz-comp/SettingsSecurity';
import { SettingsNotifications } from '../components/chz-comp/SettingsNotifications';
import { SettingsAppearance } from '../components/chz-comp/SettingsAppearance';
// DATA
import { type SettingsTab, notificationPreferences, connectedAccounts } from '../data/settingsData';
import { fetchMyProfile, updateMyProfile } from '../lib/profileApi';

import './Settings.css';

const MAX_PROFILE_IMAGE_BYTES = 1024 * 1024;

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profiledisplayname, setProfiledisplayname] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState<string | null | undefined>(undefined);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  const { use24HourTime, setUse24HourTime } = useAppState();
  const { updateUser } = useAuth();

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
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

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setIsProfileLoading(true);
        setProfileError(null);
        const response = await fetchMyProfile();

        if (cancelled) {
          return;
        }

        setProfileEmail(response.profile.email);
        setProfileUsername(response.profile.username);
        setProfiledisplayname(response.profile.displayname ?? '');
        setProfileBio(response.profile.bio ?? '');
        setProfileAvatarUrl(response.profile.avatarUrl);
        setPendingAvatarDataUrl(undefined);
      } catch (error) {
        if (!cancelled) {
          setProfileError(getErrorMessage(error, 'Unable to load your profile settings.'));
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Unable to read the selected file.'));
      };
      reader.onerror = () => reject(new Error('Unable to read the selected file.'));
      reader.readAsDataURL(file);
    });
  }

  async function handleAvatarSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setProfileError(null);

      if (file.size > MAX_PROFILE_IMAGE_BYTES) {
        throw new Error('Please choose an image smaller than 1 MB.');
      }

      const dataUrl = await readFileAsDataUrl(file);
      setProfileAvatarUrl(dataUrl);
      setPendingAvatarDataUrl(dataUrl);
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Unable to load the selected image.'));
    }
  }

  function handleAvatarRemove() {
    setProfileAvatarUrl(null);
    setPendingAvatarDataUrl(null);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(null);

      const response = await updateMyProfile({
        displayname: profiledisplayname.trim() || null,
        bio: profileBio.trim() || null,
        avatarDataUrl: pendingAvatarDataUrl,
      });

      setProfileEmail(response.profile.email);
      setProfileUsername(response.profile.username);
      setProfiledisplayname(response.profile.displayname ?? '');
      setProfileBio(response.profile.bio ?? '');
      setProfileAvatarUrl(response.profile.avatarUrl);
      setPendingAvatarDataUrl(undefined);
      updateUser({
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        displayname: response.user.displayname ?? null,
        avatarUrl: response.user.avatarUrl ?? null,
      }, response.token);
      setProfileSuccess('Profile updated successfully.');
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Unable to save your profile.'));
    } finally {
      setIsProfileSaving(false);
    }
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
                  className={`settings-nav-btn ${activeTab === tab.id
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
              {activeTab === 'profile' && (
                isProfileLoading ? (
                  <div className="settings-inline-message">Loading profile settings...</div>
                ) : (
                  <SettingsProfile
                    profileData={{
                      displayname: profiledisplayname,
                      username: profileUsername,
                      bio: profileBio,
                      avatarFallback: (profiledisplayname.trim() || profileUsername || 'U').charAt(0).toUpperCase(),
                      avatarUrl: profileAvatarUrl,
                    }}
                    isSaving={isProfileSaving}
                    error={profileError}
                    success={profileSuccess}
                    ondisplaynameChange={setProfiledisplayname}
                    onBioChange={setProfileBio}
                    onAvatarSelect={handleAvatarSelect}
                    onAvatarRemove={handleAvatarRemove}
                    onSubmit={handleProfileSubmit}
                  />
                )
              )}

              {activeTab === 'account' && (
                <SettingsAccount
                  accountData={{ email: profileEmail }}
                  connectedAccounts={connectedAccounts}
                />
              )}

              {activeTab === 'security' && (
                <SettingsSecurity
                  accountData={accountData}
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
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
