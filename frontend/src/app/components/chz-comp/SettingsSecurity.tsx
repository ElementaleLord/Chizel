import type { FormEvent } from 'react';

import './pages/SettingsBase.css';
import './SettingsSecurity.css';

interface SettingsSecurityProps {
  showPasswordForm: boolean;
  onShowPasswordForm: (show: boolean) => void;
  currentPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  passwordError: string | null;
  passwordSuccess: string | null;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SettingsSecurity({
  showPasswordForm,
  onShowPasswordForm,
  currentPassword,
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  passwordError,
  passwordSuccess,
  onPasswordSubmit,
}: SettingsSecurityProps) {
  return (
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
                onShowPasswordForm(!showPasswordForm);
              }}
              className="settings-security-btn"
            >
              Change Password
            </button>
          </div>
          {showPasswordForm && (
            <form className="settings-password-form" onSubmit={onPasswordSubmit}>
              <div className="settings-form-group">
                <label htmlFor="current-password" className="settings-label">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => onCurrentPasswordChange(event.target.value)}
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
                  onChange={(event) => onNewPasswordChange(event.target.value)}
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
                  onChange={(event) => onConfirmPasswordChange(event.target.value)}
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
  );
}
