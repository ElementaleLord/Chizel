export interface RepositorySummary {
  id: string;
  owner: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated: string;
  visibility: 'Public' | 'Private';
}

export const homeSuggestedRepositoryIds = [
  'vercel/next.js',
  'facebook/react',
  'microsoft/vscode',
] as const;

export const userRepositoryIds = [
  'sarahdev/web-app',
  'sarahdev/api-server',
  'sarahdev/design-system',
  'sarahdev/mobile-app',
] as const;

export const starredRepositoryIds = [
  'facebook/react',
  'vercel/next.js',
  'microsoft/vscode',
  'tailwindlabs/tailwindcss',
] as const;

export const repositoryCatalog: RepositorySummary[] = [
  {
    id: 'vercel/next.js',
    owner: 'vercel',
    name: 'next.js',
    description: 'The React Framework for Production',
    language: 'JavaScript',
    stars: 118000,
    forks: 25000,
    updated: '3 hours ago',
    visibility: 'Public',
  },
  {
    id: 'facebook/react',
    owner: 'facebook',
    name: 'react',
    description: 'A declarative, efficient, and flexible JavaScript library for building UIs',
    language: 'JavaScript',
    stars: 220000,
    forks: 45000,
    updated: '1 hour ago',
    visibility: 'Public',
  },
  {
    id: 'microsoft/vscode',
    owner: 'microsoft',
    name: 'vscode',
    description: 'Visual Studio Code',
    language: 'TypeScript',
    stars: 156000,
    forks: 28000,
    updated: '5 hours ago',
    visibility: 'Public',
  },
  {
    id: 'tailwindlabs/tailwindcss',
    owner: 'tailwindlabs',
    name: 'tailwindcss',
    description: 'A utility-first CSS framework',
    language: 'CSS',
    stars: 78000,
    forks: 3900,
    updated: '1 day ago',
    visibility: 'Public',
  },
  {
    id: 'sarahdev/web-app',
    owner: 'sarahdev',
    name: 'web-app',
    description: 'A modern web application built with React and TypeScript',
    language: 'TypeScript',
    stars: 248,
    forks: 45,
    updated: '2 hours ago',
    visibility: 'Public',
  },
  {
    id: 'sarahdev/api-server',
    owner: 'sarahdev',
    name: 'api-server',
    description: 'RESTful API server with Node.js and Express',
    language: 'JavaScript',
    stars: 156,
    forks: 32,
    updated: '1 day ago',
    visibility: 'Public',
  },
  {
    id: 'sarahdev/design-system',
    owner: 'sarahdev',
    name: 'design-system',
    description: 'Component library for building consistent UIs',
    language: 'TypeScript',
    stars: 892,
    forks: 124,
    updated: '3 days ago',
    visibility: 'Public',
  },
  {
    id: 'sarahdev/mobile-app',
    owner: 'sarahdev',
    name: 'mobile-app',
    description: 'Cross-platform mobile app with React Native',
    language: 'TypeScript',
    stars: 421,
    forks: 78,
    updated: '5 days ago',
    visibility: 'Private',
  },
];

export function getRepositoryById(repositoryId: string) {
  return repositoryCatalog.find((repository) => repository.id === repositoryId);
}

export function getRepositoriesByIds(repositoryIds: readonly string[]) {
  return repositoryIds
    .map((repositoryId) => getRepositoryById(repositoryId))
    .filter((repository): repository is RepositorySummary => repository !== undefined);
}

export function formatStarCount(value: number) {
  if (value >= 1000) {
    const shortened = value >= 100000 ? value / 1000 : value / 1000;
    const rounded = shortened >= 100 ? Math.round(shortened) : Math.round(shortened * 10) / 10;
    return `${rounded}k`;
  }

  return String(value);
}

export function getLanguageColor(language: string) {
  switch (language) {
    case 'TypeScript':
      return 'bg-blue-500';
    case 'JavaScript':
      return 'bg-yellow-500';
    case 'CSS':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}
