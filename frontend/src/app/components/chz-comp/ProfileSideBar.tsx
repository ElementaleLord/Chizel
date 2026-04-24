import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';

interface ProfileProp{
    name: string,
    username: string,
    avatar: string,
    bio: string,
    location: string,
    website: string,
    joined: string,
    followers: number,
    following: number,
}

export function ProfileSideBar( {profileUser} : { profileUser : ProfileProp}){
    return (
        <aside className="profile-sidebar">
            <div className="profile-header">
            <div className="profile-avatar">
                {profileUser.avatar}
            </div>
            <h1 className="profile-name">{profileUser.name}</h1>
            <p className="profile-username">{profileUser.username}</p>
            <button className="profile-edit-btn">
                Edit profile
            </button>
            </div>

            <div className="profile-bio-section">
            <p className="profile-bio">
                {profileUser.bio}
            </p>
            <div className="profile-meta-item">
                <MapPin className="profile-meta-icon" />
                <span>{profileUser.location}</span>
            </div>
            <div className="profile-meta-item">
                <LinkIcon className="profile-meta-icon" />
                <a href="#" className="profile-meta-link">
                {profileUser.website}
                </a>
            </div>
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