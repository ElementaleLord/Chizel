import apiClient from './apiClient';
import type { FileItem } from '../data/fileExplorerData';

export interface RepoNode extends FileItem {
  isBinary?: boolean;
}

export interface RepoStats {
  stars: number;
  watchers: number;
  forks: number;
  issues: number;
  pullRequests: number;
  viewerHasStarred: boolean;
  viewerIsWatching: boolean;
}

export interface RepoRef {
  id: string;
  name: string;
  path: string;
  type: 'branch' | 'tag';
  lastModified?: string;
  target?: string;
  isCurrent: boolean;
}

export interface RepoCommit {
  id: string;
  hash: string;
  shortHash: string;
  parentHash: string;
  author: string;
  avatar: string;
  timestamp: string;
  message: string;
  branch: string;
}

export interface RepoCommitHistory {
  repoId: string;
  branch: string | null;
  commits: RepoCommit[];
}

export interface RepoContributor {
  name: string;
  initials: string;
  commits: number;
}

export interface RepoLanguage {
  name: string;
  bytes: number;
  percentage: number;
}

export interface CreatedRepository {
  repoId: string;
  owner: string;
  name: string;
  url: string;
  description: string | null;
  visibility: 'Public' | 'Private';
  route: string;
}

export interface RepoMeta {
  repoId: string;
  name: string;
  url: string;
  visibility: string;
  description?: string | null;
  currentBranch: string | null;
  currentRef: {
    type: 'branch' | 'tag' | null;
    name: string | null;
  };
  branchCount: number;
  tagCount: number;
  branches: RepoRef[];
  tags: RepoRef[];
  readmePath: string | null;
  updatedAt: string | null;
  latestCommit: RepoCommit | null;
  contributors: RepoContributor[];
  languages: RepoLanguage[];
  stats: RepoStats;
  cached: boolean;
}

const DEFAULT_REPO_STATS: RepoStats = {
  stars: 0,
  watchers: 0,
  forks: 0,
  issues: 0,
  pullRequests: 0,
  viewerHasStarred: false,
  viewerIsWatching: false,
};

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.toLowerCase());
  }

  return false;
}

function normalizeRepoStats(raw: unknown): RepoStats {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_REPO_STATS;
  }

  const stats = raw as Record<string, unknown>;

  return {
    stars: toNumber(
      stats.stars ??
      stats.starCount ??
      stats.star_count ??
      stats.repo_stars ??
      stats.r_stars
    ),
    watchers: toNumber(
      stats.watchers ??
      stats.watcherCount ??
      stats.watchers_count ??
      stats.watcher_count ??
      stats.repo_watchers ??
      stats.r_watchers
    ),
    forks: toNumber(
      stats.forks ??
      stats.forkCount ??
      stats.forks_count ??
      stats.fork_count ??
      stats.repo_forks ??
      stats.r_forks
    ),
    issues: toNumber(
      stats.issues ??
      stats.r_issues ??
      stats.issueCount ??
      stats.issue_count
    ),
    pullRequests: toNumber(
      stats.pullRequests ??
      stats.r_pullRequests ??
      stats.pull_requests ??
      stats.pullRequestCount ??
      stats.pull_request_count ??
      stats.prs ??
      stats.pr_count
    ),
    viewerHasStarred: toBoolean(
      stats.viewerHasStarred ??
      stats.viewer_has_starred ??
      stats.hasStarred ??
      stats.starred
    ),
    viewerIsWatching: toBoolean(
      stats.viewerIsWatching ??
      stats.viewer_is_watching ??
      stats.isWatching ??
      stats.watching
    ),
  };
}

function normalizeRepoMeta(raw: unknown, repoId: string): RepoMeta {
  const data = (raw ?? {}) as Record<string, unknown>;

  return {
    repoId: String(data.repoId ?? repoId),
    name: typeof data.name === 'string' ? data.name : `repo-${repoId}`,
    url: typeof data.url === 'string' ? data.url : '',
    visibility: typeof data.visibility === 'string' && data.visibility.trim() ? data.visibility : 'Public',
    description: typeof data.description === 'string' ? data.description : null,
    currentBranch: typeof data.currentBranch === 'string' ? data.currentBranch : null,
    currentRef:
      data.currentRef && typeof data.currentRef === 'object'
        ? {
          type:
            (data.currentRef as Record<string, unknown>).type === 'branch' ||
              (data.currentRef as Record<string, unknown>).type === 'tag'
              ? ((data.currentRef as Record<string, unknown>).type as 'branch' | 'tag')
              : null,
          name:
            typeof (data.currentRef as Record<string, unknown>).name === 'string'
              ? ((data.currentRef as Record<string, unknown>).name as string)
              : null,
        }
        : { type: null, name: null },
    branchCount: toNumber(data.branchCount),
    tagCount: toNumber(data.tagCount),
    branches: Array.isArray(data.branches) ? (data.branches as RepoRef[]) : [],
    tags: Array.isArray(data.tags) ? (data.tags as RepoRef[]) : [],
    readmePath: typeof data.readmePath === 'string' ? data.readmePath : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    latestCommit: data.latestCommit && typeof data.latestCommit === 'object'
      ? (data.latestCommit as RepoCommit)
      : null,
    contributors: Array.isArray(data.contributors)
      ? data.contributors
        .filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object')
        .map((contributor) => ({
          name: typeof contributor.name === 'string' ? contributor.name : 'Unknown author',
          initials: typeof contributor.initials === 'string' ? contributor.initials : '?',
          commits: toNumber(contributor.commits),
        }))
      : [],
    languages: Array.isArray(data.languages)
      ? data.languages
        .filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object')
        .map((language) => ({
          name: typeof language.name === 'string' ? language.name : 'Other',
          bytes: toNumber(language.bytes),
          percentage: toNumber(language.percentage),
        }))
      : [],
    stats: normalizeRepoStats(data.stats),
    cached: Boolean(data.cached),
  };
}

const resolvedRepoIdCache = new Map<string, string>();
const syncedRepoIds = new Set<string>();
const treeCache = new Map<string, RepoNode>();
const fileCache = new Map<string, RepoNode>();
const metaCache = new Map<string, RepoMeta>();
const commitsCache = new Map<string, RepoCommitHistory>();

const pendingRepoLookups = new Map<string, Promise<string>>();
const pendingSyncs = new Map<string, Promise<unknown>>();
const pendingTrees = new Map<string, Promise<RepoNode>>();
const pendingFiles = new Map<string, Promise<RepoNode>>();
const pendingMeta = new Map<string, Promise<RepoMeta>>();
const pendingCommits = new Map<string, Promise<RepoCommitHistory>>();

function getRepoLookupKey(owner: string, repo: string) {
  return `${owner}/${repo}`;
}

function getNodeCacheKey(repoId: string, repoPath: string) {
  return `${repoId}:${repoPath}`;
}

export function updateCachedRepoStats(repoId: string, stats: RepoStats) {
  const cachedMeta = metaCache.get(repoId);
  if (!cachedMeta) {
    return;
  }

  metaCache.set(repoId, {
    ...cachedMeta,
    stats,
  });
}

export function clearRepoCaches(repoId: string) {
  syncedRepoIds.delete(repoId);
  metaCache.delete(repoId);
  pendingSyncs.delete(repoId);
  pendingMeta.delete(repoId);

  for (const key of [...treeCache.keys()]) {
    if (key.startsWith(`${repoId}:`)) {
      treeCache.delete(key);
    }
  }

  for (const key of [...fileCache.keys()]) {
    if (key.startsWith(`${repoId}:`)) {
      fileCache.delete(key);
    }
  }

  for (const key of [...pendingTrees.keys()]) {
    if (key.startsWith(`${repoId}:`)) {
      pendingTrees.delete(key);
    }
  }

  for (const key of [...pendingFiles.keys()]) {
    if (key.startsWith(`${repoId}:`)) {
      pendingFiles.delete(key);
    }
  }

  for (const key of [...commitsCache.keys()]) {
    if (key.startsWith(`${repoId}:`)) {
      commitsCache.delete(key);
    }
  }

  for (const key of [...pendingCommits.keys()]) {
    if (key.startsWith(`${repoId}:`)) {
      pendingCommits.delete(key);
    }
  }
}

export async function resolveRepoId(owner: string, repo: string): Promise<string> {
  const cacheKey = getRepoLookupKey(owner, repo);
  const cachedRepoId = resolvedRepoIdCache.get(cacheKey);

  if (cachedRepoId) {
    return cachedRepoId;
  }

  const pendingLookup = pendingRepoLookups.get(cacheKey);
  if (pendingLookup) {
    return pendingLookup;
  }

  const lookupPromise = apiClient
    .get(`/api/reposresolve/${owner}/${repo}`)
    .then(({ data }) => {
      const repoId = String(data.repoId);
      resolvedRepoIdCache.set(cacheKey, repoId);
      return repoId;
    })
    .finally(() => {
      pendingRepoLookups.delete(cacheKey);
    });

  pendingRepoLookups.set(cacheKey, lookupPromise);
  return lookupPromise;
}

export async function syncRepo(repoId: string) {
  if (syncedRepoIds.has(repoId)) {
    return { ok: true, repoId, cached: true, skipped: true };
  }

  const pendingSync = pendingSyncs.get(repoId);
  if (pendingSync) {
    return pendingSync;
  }

  const syncPromise = apiClient
    .post(`/rep/repos${repoId}/sync`)
    .then(({ data }) => {
      syncedRepoIds.add(repoId);
      return data;
    })
    .finally(() => {
      pendingSyncs.delete(repoId);
    });

  pendingSyncs.set(repoId, syncPromise);
  return syncPromise;
}

export async function fetchRepoMeta(repoId: string): Promise<RepoMeta> {
  const cachedMeta = metaCache.get(repoId);
  if (cachedMeta) {
    return cachedMeta;
  }

  const pending = pendingMeta.get(repoId);
  if (pending) {
    return pending;
  }

  const metaPromise = apiClient
    .get(`/rep/repos${repoId}/meta`)
    .then(({ data }) => {
      const normalized = normalizeRepoMeta(data, repoId);
      metaCache.set(repoId, normalized);
      return normalized;
    })
    .finally(() => {
      pendingMeta.delete(repoId);
    });

  pendingMeta.set(repoId, metaPromise);
  return metaPromise;
}

export async function fetchRepoTree(repoId: string, repoPath = '.'): Promise<RepoNode> {
  const cacheKey = getNodeCacheKey(repoId, repoPath);
  const cachedTree = treeCache.get(cacheKey);

  if (cachedTree) {
    return cachedTree;
  }

  const pending = pendingTrees.get(cacheKey);
  if (pending) {
    return pending;
  }

  const treePromise = apiClient
    .get(`/rep/repos${repoId}/tree`, {
      params: { path: repoPath },
    })
    .then(({ data }) => {
      treeCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      pendingTrees.delete(cacheKey);
    });

  pendingTrees.set(cacheKey, treePromise);
  return treePromise;
}

export async function fetchRepoFile(repoId: string, repoPath: string): Promise<RepoNode> {
  const cacheKey = getNodeCacheKey(repoId, repoPath);
  const cachedFile = fileCache.get(cacheKey);

  if (cachedFile) {
    return cachedFile;
  }

  const pending = pendingFiles.get(cacheKey);
  if (pending) {
    return pending;
  }

  const filePromise = apiClient
    .get(`/rep/repos${repoId}/file`, {
      params: { path: repoPath },
    })
    .then(({ data }) => {
      fileCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      pendingFiles.delete(cacheKey);
    });

  pendingFiles.set(cacheKey, filePromise);
  return filePromise;
}

export async function fetchRepoCommits(repoId: string, branch?: string): Promise<RepoCommitHistory> {
  const normalizedBranch = branch?.trim() || '__current__';
  const cacheKey = getNodeCacheKey(repoId, `commits:${normalizedBranch}`);
  const cachedCommits = commitsCache.get(cacheKey);

  if (cachedCommits) {
    return cachedCommits;
  }

  const pending = pendingCommits.get(cacheKey);
  if (pending) {
    return pending;
  }

  const commitsPromise = apiClient
    .get(`/rep/repos${repoId}/commits`, {
      params: branch ? { branch } : undefined,
    })
    .then(({ data }) => {
      const history = {
        repoId: String(data.repoId ?? repoId),
        branch: typeof data.branch === 'string' ? data.branch : null,
        commits: Array.isArray(data.commits) ? data.commits : [],
      };
      commitsCache.set(cacheKey, history);
      return history;
    })
    .finally(() => {
      pendingCommits.delete(cacheKey);
    });

  pendingCommits.set(cacheKey, commitsPromise);
  return commitsPromise;
}

export async function checkoutRepoRef(repoId: string, refName: string) {
  await apiClient.post(`/rep/repos${repoId}/checkout`, { refName });
  clearRepoCaches(repoId);
}

export async function toggleRepoStar(repoId: string): Promise<RepoStats> {
  const { data } = await apiClient.post(`/rep/repos${repoId}/star`);
  const stats = normalizeRepoStats(data.stats);
  updateCachedRepoStats(repoId, stats);
  return stats;
}

export async function toggleRepoWatch(repoId: string): Promise<RepoStats> {
  const { data } = await apiClient.post(`/rep/repos${repoId}/watch`);
  const stats = normalizeRepoStats(data.stats);
  updateCachedRepoStats(repoId, stats);
  return stats;
}

export async function ensureRepoReady(owner: string, repo: string) {
  return resolveRepoId(owner, repo);
}

export async function createRepository(payload: {
  name: string;
  description?: string;
  visibility?: 'Public' | 'Private';
}): Promise<CreatedRepository> {
  const { data } = await apiClient.post('/api/repos', payload);
  const owner = typeof data.owner === 'string' ? data.owner : '';
  const name = typeof data.name === 'string' ? data.name : payload.name;
  const repoId = String(data.repoId ?? '');

  if (owner && name && repoId) {
    resolvedRepoIdCache.set(getRepoLookupKey(owner, name), repoId);
  }

  return {
    repoId,
    owner,
    name,
    url: typeof data.url === 'string' ? data.url : '',
    description: typeof data.description === 'string' ? data.description : null,
    visibility: data.visibility === 'Public' ? 'Public' : 'Private',
    route: typeof data.route === 'string' ? data.route : `/repository/${owner}/${name}`,
  };
}
