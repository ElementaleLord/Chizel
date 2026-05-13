export type SettingsTab = 'profile' | 'account' | 'security' | 'notifications' | 'appearance';

export interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  icon: any; // Lucide icon component
}

export const notificationPreferences = [
  {
    label: 'Email notifications',
    desc: 'Receive email updates about your activity',
  },
  {
    label: 'Push notifications',
    desc: 'Receive push notifications on your devices',
  },
  {
    label: 'Activity notifications',
    desc: 'Get notified when someone interacts with your repos',
  },
  {
    label: 'Security alerts',
    desc: 'Get alerted about security vulnerabilities',
  },
];

export const connectedAccounts = [
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    connected: true,
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    connected: false,
  },
];

export const profileData = {
  name: 'Sarah Developer',
  username: 'sarahdev',
  bio: 'Full-stack developer passionate about building great user experiences',
  website: 'https://sarahdev.com',
  location: 'San Francisco, CA',
  avatar: 'S',
};

export const accountData = {
  email: 'sarah@example.com',
};
