import apiClient from './apiClient';
import { fetchRepoMeta, updateCachedRepoStats, type RepoStats } from './repoApi';

export type PullRequestStatus = 'Accepted' | 'Rejected' | 'Merged' | 'Null';

export interface RepoPullRequestItem {
  pr_id: string;
  acc_id: string;
  repo_id: string;
  pr_name: string;
  pr_msg: string | null;
  pr_submit_date: string | null;
  pr_resolve_date: string | null;
  pr_creation_date: string | null;
  pr_isopen: boolean;
  pr_status: PullRequestStatus;
  author_username: string;
}

export interface RepoIssueItem {
  i_id: string;
  acc_id: string;
  repo_id: string;
  i_name: string;
  i_msg: string | null;
  i_creationdate: string | null;
  i_resolvedate: string | null;
  i_open: boolean;
  author_username: string;
}

async function patchRepoCounts(
  repoId: string,
  updater: (current: RepoStats) => RepoStats,
) {
  const meta = await fetchRepoMeta(repoId);
  updateCachedRepoStats(repoId, updater(meta.stats));
}

function getRepoWorkRoute(repoId: string) {
  return `/rep/repos/${repoId}`;
}

export async function fetchRepoPullRequests(repoId: string): Promise<RepoPullRequestItem[]> {
  const { data } = await apiClient.get(`${getRepoWorkRoute(repoId)}/pulls`);
  return Array.isArray(data.items) ? data.items : [];
}

export async function createRepoPullRequest(repoId: string, payload: { title: string; message?: string }) {
  const { data } = await apiClient.post(`${getRepoWorkRoute(repoId)}/pulls`, payload);
  await patchRepoCounts(repoId, (stats) => ({
    ...stats,
    pullRequests: stats.pullRequests + 1,
  }));
  return data.item as RepoPullRequestItem;
}

export async function updateRepoPullRequest(
  repoId: string,
  pullRequestId: string,
  payload: { title?: string; message?: string; isOpen?: boolean; status?: PullRequestStatus },
) {
  const { data } = await apiClient.patch(`${getRepoWorkRoute(repoId)}/pulls/${pullRequestId}`, payload);
  return data.item as RepoPullRequestItem;
}

export async function deleteRepoPullRequest(repoId: string, pullRequestId: string) {
  await apiClient.delete(`${getRepoWorkRoute(repoId)}/pulls/${pullRequestId}`);
  await patchRepoCounts(repoId, (stats) => ({
    ...stats,
    pullRequests: Math.max(0, stats.pullRequests - 1),
  }));
}

export async function fetchRepoIssues(repoId: string): Promise<RepoIssueItem[]> {
  const { data } = await apiClient.get(`${getRepoWorkRoute(repoId)}/issues`);
  return Array.isArray(data.items) ? data.items : [];
}

export async function createRepoIssue(repoId: string, payload: { title: string; message?: string }) {
  const { data } = await apiClient.post(`${getRepoWorkRoute(repoId)}/issues`, payload);
  await patchRepoCounts(repoId, (stats) => ({
    ...stats,
    issues: stats.issues + 1,
  }));
  return data.item as RepoIssueItem;
}

export async function updateRepoIssue(
  repoId: string,
  issueId: string,
  payload: { title?: string; message?: string; isOpen?: boolean },
) {
  const { data } = await apiClient.patch(`${getRepoWorkRoute(repoId)}/issues/${issueId}`, payload);
  return data.item as RepoIssueItem;
}

export async function deleteRepoIssue(repoId: string, issueId: string) {
  await apiClient.delete(`${getRepoWorkRoute(repoId)}/issues/${issueId}`);
  await patchRepoCounts(repoId, (stats) => ({
    ...stats,
    issues: Math.max(0, stats.issues - 1),
  }));
}