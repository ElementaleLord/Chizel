import { contributionFeed, type ContributionItem, type ContributionType } from './userActivity';

export interface ContributionsResponse {
  items: ContributionItem[];
  source: 'api' | 'mock';
}

const contributionTypes: ContributionType[] = ['commit', 'pull_request', 'issue', 'comment', 'review'];

function getMockContributions(): ContributionItem[] {
  return contributionFeed
    .filter((item) => contributionTypes.includes(item.type))
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());
}

export async function getContributions(): Promise<ContributionsResponse> {
  return {
    items: getMockContributions(),
    source: 'mock',
  };
}