import { contributionFeed, type ContributionItem, type ContributionType } from './userActivity';

export interface ContributionsResponse {
  items: ContributionItem[];
  source: 'api' | 'mock';
}

const API_URL = import.meta.env.VITE_API_URL?.trim();
const contributionTypes: ContributionType[] = ['commit', 'pull_request', 'issue', 'comment', 'review'];

function normalizeContribution(item: Partial<ContributionItem>, index: number): ContributionItem | null {
  if (!item.type || !contributionTypes.includes(item.type)) {
    return null;
  }

  if (!item.title || !item.occurredAt) {
    return null;
  }

  return {
    id: Number(item.id ?? index + 1),
    type: item.type,
    user: item.user ?? 'Unknown user',
    repo: item.repo ?? 'Unknown repository',
    action: item.action ?? 'updated',
    title: item.title,
    description: item.description ?? '',
    time: item.time ?? new Date(item.occurredAt).toLocaleString(),
    occurredAt: item.occurredAt,
    href: item.href ?? '/contributions',
    branch: item.branch,
    status: item.status,
  };
}

function getMockContributions(): ContributionItem[] {
  return contributionFeed
    .filter((item) => contributionTypes.includes(item.type))
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());
}

export async function getContributions(): Promise<ContributionsResponse> {
  if (!API_URL) {
    return {
      items: getMockContributions(),
      source: 'mock',
    };
  }

  try {
    const response = await fetch(`${API_URL}/contributions`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Unable to load contributions.');
    }

    const body = await response.json();
    const items = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
        ? body.items
        : [];

    const normalizedItems = items
      .map((item: Partial<ContributionItem>, index: number) => normalizeContribution(item, index))
      .filter((item: ContributionItem | null): item is ContributionItem => item !== null)
      .sort(
        (left: ContributionItem, right: ContributionItem) =>
          new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
      );

    return {
      items: normalizedItems.length > 0 ? normalizedItems : getMockContributions(),
      source: normalizedItems.length > 0 ? 'api' : 'mock',
    };
  } catch {
    return {
      items: getMockContributions(),
      source: 'mock',
    };
  }
}
