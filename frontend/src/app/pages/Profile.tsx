import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { MapPin, Link as LinkIcon, Calendar, GitFork, Star } from 'lucide-react';
import { repositories } from '../data/userRepositories';
import { profileUser, profileStats } from '../data/profileData';
import './Profile.css';

const getLanguageColor = (language: string) => {
  switch (language) {
    case 'TypeScript':
      return 'profile-language-dot-typescript';
    case 'JavaScript':
      return 'profile-language-dot-javascript';
    default:
      return 'profile-language-dot-default';
  }
};

export function Profile() {
  return (
    <div className="profile-container">
      <ChzHeader pageTitle="Profile" /*isLoggedIn={true}*/ />

      <main className="profile-main">
        <div className="profile-wrapper">
          <div className="profile-layout">
            {/* Sidebar */}
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
                    <div key={repo.name} className="profile-repo-card">
                      <div className="profile-repo-header">
                        <div>
                          <h3 className="profile-repo-name">
                            {repo.name}
                          </h3>
                          <p className="profile-repo-description">{repo.description}</p>
                        </div>
                      </div>
                      <div className="profile-repo-meta">
                        <div className="profile-repo-meta-item">
                          <div className={`profile-language-dot ${getLanguageColor(repo.language)}`}></div>
                          <span>{repo.language}</span>
                        </div>
                        <div className="profile-repo-meta-item">
                          <Star className="profile-repo-meta-icon" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="profile-repo-meta-item">
                          <GitFork className="profile-repo-meta-icon" />
                          <span>{repo.forks}</span>
                        </div>
                        <span>Updated {repo.updated}</span>
                      </div>
                    </div>
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