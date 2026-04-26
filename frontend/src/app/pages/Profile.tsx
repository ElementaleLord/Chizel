// COMPONENETS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryEntry } from '../components/chz-comp/RepositoryEntry';
import { ProfileSideBar } from '../components/chz-comp/ProfileSideBar';
// DATA
import { repositories } from '../data/userRepositories';
import { profileUser, profileStats } from '../data/profileData';

import './Profile.css';

export function Profile() {
  return (
    <div className="profile-container">
      <ChzHeader pageTitle="Profile" /*isLoggedIn={true}*/ />

      <main className="profile-main">
        <div className="profile-wrapper">
          <div className="profile-layout">
            {/* Sidebar */}
            <ProfileSideBar profileUser={profileUser}/>
            

            {/* Main Content */}
            <div className="profile-content">
              {/* Stats Grid */}
              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <div className="profile-stat-card-number">{profileStats.repositories}</div>
                  <div className="profile-stat-card-label">Repositories</div>
                </div>
                <div className="profile-stat-card">
                  <div className="profile-stat-card-number">{(profileStats.contributions / 1000).toFixed(1)}k</div>
                  <div className="profile-stat-card-label">Contributions</div>
                </div>
                <div className="profile-stat-card">
                  <div className="profile-stat-card-number">{profileStats.stars}</div>
                  <div className="profile-stat-card-label">Stars</div>
                </div>
              </div>

              {/* Repositories */}
              <div>
                <div className="profile-repos-header">
                  <h2 className="profile-repos-title">Popular Repositories</h2>
                  <input
                    type="text"
                    placeholder="Find a repository..."
                    className="profile-search-input"
                  />
                </div>

                <div className="profile-repos-list">
                  {repositories.map((repo) => (
                    <RepositoryEntry repo= {repo}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}