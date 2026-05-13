export const insightsStats = {
  commits: {
    total: 1247,
    change: '+42 this week',
  },
  contributors: {
    count: 8,
    status: 'Active this month',
  },
  stars: {
    count: 248,
    change: '+12 this week',
  },
  forks: {
    count: 45,
    status: 'Total forks',
  },
};

export const commitActivity = [
  { day: 'Mon', commits: 32 },
  { day: 'Tue', commits: 45 },
  { day: 'Wed', commits: 28 },
  { day: 'Thu', commits: 51 },
  { day: 'Fri', commits: 38 },
  { day: 'Sat', commits: 12 },
  { day: 'Sun', commits: 18 },
];

export const topContributors = [
  { name: 'Sarah Developer', commits: 842, avatar: 'S' },
  { name: 'Mike Chen', commits: 234, avatar: 'M' },
  { name: 'Alex Kim', commits: 171, avatar: 'A' },
];

export const languageDistribution = [
  { lang: 'TypeScript', percent: 68, cssClass: 'insights-language-bar-typescript' },
  { lang: 'JavaScript', percent: 22, cssClass: 'insights-language-bar-javascript' },
  { lang: 'CSS', percent: 10, cssClass: 'insights-language-bar-css' },
];
