import apiClient from './apiClient';
import type { FileItem } from '../data/fileExplorerData';

export interface RepoNode extends FileItem {
  isBinary?: boolean;
}

export interface RepoStats {
  stars: number;
  watchers: number;
  forks: number;
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

export interface RepoMeta {
  repoId: string;
  name: string;
  url: string;
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
  stats: RepoStats;
  cached: boolean;
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
    .get(`/api/repos/resolve/${owner}/${repo}`)
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
    .post(`/api/repos/${repoId}/sync`)
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
    .get(`/api/repos/${repoId}/meta`)
    .then(({ data }) => {
      metaCache.set(repoId, data);
      return data;
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
    .get(`/api/repos/${repoId}/tree`, {
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
    .get(`/api/repos/${repoId}/file`, {
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
    .get(`/api/repos/${repoId}/commits`, {
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
  await apiClient.post(`/api/repos/${repoId}/checkout`, { refName });
  clearRepoCaches(repoId);
}

export async function toggleRepoStar(repoId: string): Promise<RepoStats> {
  const { data } = await apiClient.post(`/api/repos/${repoId}/star`);
  const cachedMeta = metaCache.get(repoId);

  if (cachedMeta) {
    metaCache.set(repoId, {
      ...cachedMeta,
      stats: data.stats,
    });
  }

  return data.stats;
}

export async function toggleRepoWatch(repoId: string): Promise<RepoStats> {
  const { data } = await apiClient.post(`/api/repos/${repoId}/watch`);
  const cachedMeta = metaCache.get(repoId);

  if (cachedMeta) {
    metaCache.set(repoId, {
      ...cachedMeta,
      stats: data.stats,
    });
  }

  return data.stats;
}

export async function ensureRepoReady(owner: string, repo: string) {
  return resolveRepoId(owner, repo);
}
