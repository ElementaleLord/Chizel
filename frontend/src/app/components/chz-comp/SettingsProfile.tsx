import type { ChangeEvent, FormEvent } from 'react';

import './SettingsBase.css';
import './SettingsProfile.css';

interface ProfileData {
  displayname: string;
  username: string;
  bio: string;
  avatarFallback: string;
  avatarUrl?: string | null;
}

interface SettingsProfileProps {
  profileData: ProfileData;
  isSaving: boolean;
  error?: string | null;
  success?: string | null;
  ondisplaynameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onAvatarSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onAvatarRemove: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SettingsProfile({
  profileData,
  isSaving,
  error,
  success,
  ondisplaynameChange,
  onBioChange,
  onAvatarSelect,
  onAvatarRemove,
  onSubmit,
}: SettingsProfileProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <h2 className="settings-section-heading">Public Profile</h2>
        <div className="space-y-4">
          <div className="settings-form-group">
            <label className="settings-label">Profile Picture</label>
            <div className="settings-profile-pic-group">
              <div className="settings-profile-pic">
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt={`${profileData.username} avatar`}
                    className="settings-profile-pic-image"
                  />
                ) : (
                  profileData.avatarFallback
                )}
              </div>
              <div className="settings-profile-pic-actions">
                <label className="settings-upload-btn">
                  Upload new picture
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="settings-hidden-file-input"
                    onChange={onAvatarSelect}
                  />
                </label>
                {profileData.avatarUrl && (
                  <button type="button" className="settings-upload-btn" onClick={onAvatarRemove}>
                    Remove picture
                  </button>
                )}
              </div>
              <button className="settings-upload-btn">
                Upload New Picture
              </button>
            </div>
          </div>
          <div className="settings-form-group">
            <label htmlFor="name" className="settings-label">Name</label>
            <input
              id="name"
              type="text"
              value={profileData.displayname}
              onChange={(event) => ondisplaynameChange(event.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-form-group">
            <label htmlFor="bio" className="settings-label">Bio</label>
            <textarea
              id="bio"
              rows={3}
              value={profileData.bio}
              onChange={(event) => onBioChange(event.target.value)}
              className="settings-textarea"
            />
          </div>
        </div>
      </div>
      {error && <div className="settings-profile-message settings-profile-message-error">{error}</div>}
      {success && <div className="settings-profile-message settings-profile-message-success">{success}</div>}
      <div className="settings-divider">
        <button type="submit" className="settings-save-btn" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        <button className="settings-save-btn">
          Save Changes
        </button>
      </div>
    </form>
  );
}
