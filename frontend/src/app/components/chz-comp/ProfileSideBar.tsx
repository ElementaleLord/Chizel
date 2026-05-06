import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { Link } from 'react-router';

import './ProfileSideBar.css';

interface ProfileProp{
    name: string,
    username: string,
    avatar: string,
    avatarUrl?: string | null,
    bio: string,
    location?: string | null,
    website?: string | null,
    joined: string,
    followers: number,
    following: number,
}

export function ProfileSideBar( {profileUser} : { profileUser : ProfileProp}){
    return (
        <aside className="profile-sidebar">
            <div className="profile-header">
            <div className="profile-avatar">
                {profileUser.avatarUrl ? (
                  <img src={profileUser.avatarUrl} alt={`${profileUser.username} avatar`} className="profile-avatar-image" />
                ) : (
                  profileUser.avatar
                )}
            </div>
            <h1 className="profile-name">{profileUser.name}</h1>
            <p className="profile-username">{profileUser.username}</p>
            <Link to="/settings" className="profile-edit-btn">
                Edit profile
            </Link>
            <button className="profile-edit-btn">
                Edit Profile
            </button>
            </div>

            <div className="profile-bio-section">
            <p className="profile-bio">
                {profileUser.bio}
            </p>
            {profileUser.location && (
              <div className="profile-meta-item">
                  <MapPin className="profile-meta-icon" />
                  <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="profile-meta-item">
                  <LinkIcon className="profile-meta-icon" />
                  <a href={profileUser.website} className="profile-meta-link">
                  {profileUser.website}
                  </a>
              </div>
            )}
            <div className="profile-meta-item">
                <Calendar className="profile-meta-icon" />
                <span>Joined {profileUser.joined}</span>
            </div>
            </div>

            <div className="profile-stats">
            <div className="profile-stat">
                <span className="profile-stat-number">{profileUser.followers}</span>
                <span className="profile-stat-label">followers</span>
            </div>
            <div className="profile-stat">
                <span className="profile-stat-number">{profileUser.following}</span>
                <span className="profile-stat-label">following</span>
            </div>
            </div>
        </aside>
    )
}
