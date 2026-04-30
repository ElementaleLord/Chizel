import { useEffect, useMemo, useState } from 'react';
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryEntry } from '../components/chz-comp/RepositoryEntry';
import { ProfileSideBar } from '../components/chz-comp/ProfileSideBar';
import { fetchMyProfile, type UserProfile, type UserProfileRepository } from '../lib/profileApi';

import './Profile.css';

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

function formatjoindate(value: string | null) {
  if (!value) {
    return 'recently';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function avatarFallback(profile: UserProfile | null) {
  const seed = profile?.displayname?.trim() || profile?.username || 'U';
  return seed.charAt(0).toUpperCase();
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repositories, setRepositories] = useState<UserProfileRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchMyProfile();

        if (cancelled) {
          return;
        }

        setProfile(response.profile);
        setRepositories(response.repositories);
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, 'Unable to load your profile.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRepositories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return repositories;
    }

    return repositories.filter((repo) =>
      [repo.name, repo.description ?? '', repo.language].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [repositories, search]);

  return (
    <div className="profile-container">
      <ChzHeader pageTitle="Profile" />

      <main className="profile-main">
        <div className="profile-wrapper">
          {isLoading ? (
            <div className="profile-state-card">Loading profile...</div>
          ) : error || !profile ? (
            <div className="profile-state-card">{error || 'Profile unavailable.'}</div>
          ) : (
            <div className="profile-layout">
              <ProfileSideBar
                profileUser={{
                  name: profile.displayname?.trim() || profile.username,
                  username: `@${profile.username}`,
                  avatar: avatarFallback(profile),
                  avatarUrl: profile.avatarUrl,
                  bio: profile.bio?.trim() || 'No bio added yet.',
                  joined: formatjoindate(profile.joined),
                  followers: profile.followers,
                  following: profile.following,
                }}
              />

              <div className="profile-content">
                <div className="profile-stats-grid">
                  <div className="profile-stat-card">
                    <div className="profile-stat-card-number">{profile.stats.repositories}</div>
                    <div className="profile-stat-card-label">Repositories</div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-card-number">{profile.stats.contributions}</div>
                    <div className="profile-stat-card-label">Contributions</div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-card-number">{profile.stats.stars}</div>
                    <div className="profile-stat-card-label">Stars</div>
                  </div>
                </div>

                <div>
                  <div className="profile-repos-header">
                    <h2 className="profile-repos-title">Repositories</h2>
                    <input
                      type="text"
                      placeholder="Find a repository..."
                      className="profile-search-input"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <div className="profile-repos-list">
                    {filteredRepositories.length === 0 ? (
                      <div className="profile-state-card">No repositories match your search.</div>
                    ) : (
                      filteredRepositories.map((repo) => (
                        <RepositoryEntry
                          key={repo.id}
                          repo={{
                            name: repo.name,
                            description: repo.description ?? 'No repository description provided.',
                            language: repo.language,
                            stars: repo.stars,
                            forks: repo.forks,
                            updated: repo.updatedAt ?? 'recently',
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="profile-activity-header">
                    <h2 className="profile-activity-title">Contribution activity</h2>
                    <div className="profile-activity-stats">
                      <span className="profile-activity-stats-number">{profile.stats.totalContributions}</span> total contributions
                    </div>
                  </div>
                  <div className="profile-activity-card">
                    <div className="profile-activity-stats-grid">
                      <div className="profile-activity-stat">
                        <div className="profile-activity-stat-number">{profile.stats.totalContributions}</div>
                        <div className="profile-activity-stat-label">Total contributions</div>
                      </div>
                      <div className="profile-activity-stat">
                        <div className="profile-activity-stat-number">{profile.stats.longestStreak}</div>
                        <div className="profile-activity-stat-label">Longest streak</div>
                      </div>
                      <div className="profile-activity-stat">
                        <div className="profile-activity-stat-number">{profile.stats.currentStreak}</div>
                        <div className="profile-activity-stat-label">Current streak</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
