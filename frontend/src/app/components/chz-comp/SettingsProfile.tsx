import './SettingsBase.css';
import './SettingsProfile.css';

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  website: string;
  location: string;
  avatar: string;
}

interface SettingsProfileProps {
  profileData: ProfileData;
}

export function SettingsProfile({ profileData }: SettingsProfileProps) {
  return (
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
  );
}
