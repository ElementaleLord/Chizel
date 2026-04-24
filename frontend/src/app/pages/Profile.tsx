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
                  <h2 className="profile-repos-title">Popular repositories</h2>
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

              {/* Activity */}
              <div>
                <div className="profile-activity-header">
                  <h2 className="profile-activity-title">Contribution activity</h2>
                  <div className="profile-activity-stats">
                    <span className="profile-activity-stats-number">{profileStats.totalContributions}</span> contributions in the last year
                  </div>
                </div>
                <div className="profile-activity-card">
                  <div className="profile-heatmap-container">
                    <div className="profile-heatmap-grid">
                      <div className="profile-heatmap-days">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                      </div>
                      <div className="profile-heatmap-cells">
                        <div className="profile-heatmap-grid-cells">
                          {Array.from({ length: 371 }).map((_, i) => {
                            const intensity = Math.random();
                            let cellClass = 'profile-heatmap-cell-empty';
                            if (intensity > 0.75) {
                              cellClass = 'profile-heatmap-cell-highest';
                            } else if (intensity > 0.5) {
                              cellClass = 'profile-heatmap-cell-high';
                            } else if (intensity > 0.25) {
                              cellClass = 'profile-heatmap-cell-medium';
                            } else if (intensity > 0.1) {
                              cellClass = 'profile-heatmap-cell-low';
                            }
                            return (
                              <div
                                key={i}
                                className={`profile-heatmap-cell ${cellClass}`}
                                title={`${Math.floor(intensity * 15)} contributions`}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-heatmap-legend">
                    <span>Less</span>
                    <div className="profile-heatmap-legend-scale">
                      <div className="profile-heatmap-legend-item profile-heatmap-cell-empty"></div>
                      <div className="profile-heatmap-legend-item profile-heatmap-cell-low"></div>
                      <div className="profile-heatmap-legend-item profile-heatmap-cell-medium"></div>
                      <div className="profile-heatmap-legend-item profile-heatmap-cell-high"></div>
                      <div className="profile-heatmap-legend-item profile-heatmap-cell-highest"></div>
                    </div>
                    <span>More</span>
                  </div>
                  <div className="profile-activity-stats-grid">
                    <div className="profile-activity-stat">
                      <div className="profile-activity-stat-number">{profileStats.totalContributions}</div>
                      <div className="profile-activity-stat-label">Total contributions</div>
                    </div>
                    <div className="profile-activity-stat">
                      <div className="profile-activity-stat-number">{profileStats.longestStreak}</div>
                      <div className="profile-activity-stat-label">Longest streak</div>
                    </div>
                    <div className="profile-activity-stat">
                      <div className="profile-activity-stat-number">{profileStats.currentStreak}</div>
                      <div className="profile-activity-stat-label">Current streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}