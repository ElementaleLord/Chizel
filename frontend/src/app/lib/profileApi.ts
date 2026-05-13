import apiClient from './apiClient';

export interface ProfileStats {
  repositories: number;
  contributions: number;
  stars: number;
  totalContributions: number;
  longestStreak: number;
  currentStreak: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayname: string | null;
  bio: string | null;
  avatarUrl: string | null;
  joined: string | null;
  followers: number;
  following: number;
  stats: ProfileStats;
}

export interface UserProfileRepository {
  id: string;
  name: string;
  description: string | null;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string | null;
  owner: string;
  visibility: 'Public' | 'Private';
}

export async function fetchMyProfile(): Promise<{ profile: UserProfile; repositories: UserProfileRepository[] }> {
  const { data } = await apiClient.get('/auth/profile');
  return {
    profile: data.profile as UserProfile,
    repositories: Array.isArray(data.repositories) ? data.repositories as UserProfileRepository[] : [],
  };
}

export async function updateMyProfile(payload: {
  displayname?: string | null;
  bio?: string | null;
  avatarDataUrl?: string | null;
}) {
  const { data } = await apiClient.patch('/auth/profile', payload);
  return {
    user: data.user as {
      id: string;
      email: string;
      username: string;
      displayname?: string | null;
      avatarUrl?: string | null;
    },
    token: typeof data.token === 'string' ? data.token : null,
    profile: data.profile as UserProfile,
    repositories: Array.isArray(data.repositories) ? data.repositories as UserProfileRepository[] : [],
  };
}
