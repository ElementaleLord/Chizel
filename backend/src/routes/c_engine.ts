import { spawn } from "child_process";
import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { authGuard, AuthenticatedRequest } from "../middleware/authGuard";
import {
  createRepoIssue,
  createRepoPullRequest,
  deleteRepoIssue,
  deleteRepoPullRequest,
  getRepoByOwnerAndName,
  getRepoData,
  getRepoIssueById,
  getRepoIssues,
  getRepoMetrics,
  getRepoOwnerId,
  getRepoPullRequestById,
  getRepoPullRequests,
  isStarredRepo,
  isWatchedRepo,
  starRepo,
  type PullRequestStatus,
  updateRepoIssue,
  updateRepoPullRequest,
  watchRepo,
} from "./database";

const router = Router();

const CHZ_BINARY_CANDIDATES = [
  path.resolve(__dirname, "../../../build/chz"),
  path.resolve(__dirname, "../../binaries/chz"),
];
const REPO_CACHE_BASE = path.resolve(__dirname, "../../tmp/repos");
const WORKSPACE_BASE = path.resolve(__dirname, "../../tmp/workspaces");
const hydrationTasks = new Map<string, Promise<{ repo: Record<string, unknown>; repoRoot: string; cached: boolean }>>();

type RepoTreeNode = {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  size?: number;
  content?: string;
  lastModified?: string;
  isBinary?: boolean;
  children?: RepoTreeNode[];
};

type RepoRefType = "branch" | "tag";

type RepoRefNode = {
  id: string;
  name: string;
  path: string;
  type: RepoRefType;
  lastModified?: string;
  target?: string;
  isCurrent: boolean;
};

type RepoCommit = {
  id: string;
  hash: string;
  shortHash: string;
  parentHash: string;
  author: string;
  avatar: string;
  timestamp: string;
  message: string;
  branch: string;
};

function toNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizePullRequestStatus(value: unknown, isOpen: boolean): PullRequestStatus {
  if (isOpen) {
    return "Null";
  }

  return (value === "Accepted" || value === "Rejected" || value === "Merged") ? value : "Null";
}

async function canManageRepoWorkItem(repoId: number, userId: number, authorId: number) {
  if (userId === authorId) {
    return true;
  }

  const repoOwnerId = await getRepoOwnerId(repoId);
  return repoOwnerId === userId;
}

function getHttpStatusFromErrorMessage(message: string) {
  if (message === "Repository not found") {
    return 404;
  }

  if (
    message === "Repository URL is missing" ||
    message === "Invalid path" ||
    message === "Access to .chz is forbidden" ||
    message === "Reference name is required" ||
    message === "Branch or tag name is invalid" ||
    message === "Repository logs are not available locally" ||
    message === "README not found" ||
    message === "Path is not a directory" ||
    message === "Path is not a file" ||
    message === "Path does not exist"
  ) {
    return 400;
  }

  if (message.includes("does not support 'clone' yet")) {
    return 501;
  }

  return 500;
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getRepoRoot(repoId: string) {
  return path.join(REPO_CACHE_BASE, repoId);
}

function getVisibleRepoEntries(repoRoot: string) {
  if (!fs.existsSync(repoRoot)) {
    return [];
  }

  return fs.readdirSync(repoRoot).filter((entry) => entry !== ".chz");
}

function isRepoCached(repoRoot: string) {
  return getVisibleRepoEntries(repoRoot).length > 0;
}

function hasRepoLogCache(repoRoot: string) {
  const headPath = path.join(repoRoot, ".chz", "HEAD");
  const logsPath = path.join(repoRoot, ".chz", "logs");
  const headsPath = path.join(repoRoot, ".chz", "refs", "heads");

  return fs.existsSync(headPath) && (fs.existsSync(logsPath) || fs.existsSync(headsPath));
}

function getChzBinaryPath() {
  return CHZ_BINARY_CANDIDATES.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function isInsideRepoRoot(repoRoot: string, requestedPath: string) {
  const resolved = path.resolve(repoRoot, requestedPath);
  return resolved === repoRoot || resolved.startsWith(`${repoRoot}${path.sep}`);
}

function safeResolveRepoPath(repoRoot: string, requestedPath = ".") {
  const normalized = requestedPath.trim() === "" ? "." : requestedPath;
  const resolved = path.resolve(repoRoot, normalized);

  if (!isInsideRepoRoot(repoRoot, normalized)) {
    throw new Error("Invalid path");
  }

  if (!fs.existsSync(resolved)) {
    throw new Error("Path does not exist");
  }

  const relativePath = path.relative(repoRoot, resolved);
  const parts = relativePath.split(path.sep).filter(Boolean);

  if (parts.includes(".chz")) {
    throw new Error("Access to .chz is forbidden");
  }

  return resolved;
}

function shouldIgnoreEntry(relativePath: string) {
  const parts = relativePath.split(path.sep).filter(Boolean);
  return parts.includes(".chz");
}

function isLikelyTextFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const textExtensions = new Set([
    ".txt", ".md", ".json", ".js", ".jsx", ".ts", ".tsx",
    ".css", ".html", ".xml", ".yml", ".yaml", ".c", ".h",
    ".cpp", ".hpp", ".py", ".java", ".go", ".rs", ".env",
    ".ini", ".toml", ".sh", ".bat"
  ]);

  return textExtensions.has(ext);
}

function toRepoNode(repoRoot: string, absolutePath: string): RepoTreeNode {
  const stat = fs.statSync(absolutePath);
  const relativePath = path.relative(repoRoot, absolutePath);
  const name = path.basename(absolutePath);

  return {
    id: relativePath || "root",
    name: relativePath ? name : path.basename(repoRoot),
    path: relativePath ? `/${relativePath}` : "/",
    type: stat.isDirectory() ? "folder" : "file",
    size: stat.isFile() ? stat.size : undefined,
    lastModified: stat.mtime.toISOString(),
  };
}

function buildDirectoryNode(repoRoot: string, absolutePath: string): RepoTreeNode {
  const stat = fs.statSync(absolutePath);
  const baseNode = toRepoNode(repoRoot, absolutePath);

  if (!stat.isDirectory()) {
    throw new Error("Path is not a directory");
  }

  const children = fs
    .readdirSync(absolutePath, { withFileTypes: true })
    .filter((entry) => entry.name !== ".chz")
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    })
    .map((entry) => toRepoNode(repoRoot, path.join(absolutePath, entry.name)));

  return {
    ...baseNode,
    type: "folder",
    children,
  };
}

function getRepoUpdatedAt(repoRoot: string) {
  if (!fs.existsSync(repoRoot)) {
    return null;
  }

  const timestamps = [fs.statSync(repoRoot).mtime.getTime()];

  for (const entry of getVisibleRepoEntries(repoRoot)) {
    const entryPath = path.join(repoRoot, entry);
    timestamps.push(fs.statSync(entryPath).mtime.getTime());
  }

  const latest = Math.max(...timestamps);
  return Number.isFinite(latest) ? new Date(latest).toISOString() : null;
}

function findReadmePath(repoRoot: string) {
  if (!fs.existsSync(repoRoot)) {
    return null;
  }

  const matches = fs
    .readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^readme(?:\..+)?$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return matches[0] ?? null;
}

function readCurrentRef(repoRoot: string): { type: RepoRefType | null; name: string | null } {
  const headPath = path.join(repoRoot, ".chz", "HEAD");

  if (!fs.existsSync(headPath)) {
    return { type: null, name: null };
  }

  const headValue = fs.readFileSync(headPath, "utf8").trim();

  if (headValue.startsWith("refs/heads/")) {
    return {
      type: "branch",
      name: headValue.replace(/^refs\/heads\//, ""),
    };
  }

  if (headValue.startsWith("refs/tags/")) {
    return {
      type: "tag",
      name: headValue.replace(/^refs\/tags\//, ""),
    };
  }

  return { type: null, name: null };
}

function collectRefNodes(
  refsRoot: string,
  type: RepoRefType,
  currentRef: { type: RepoRefType | null; name: string | null },
  prefix = ""
): RepoRefNode[] {
  if (!fs.existsSync(refsRoot)) {
    return [];
  }

  return fs
    .readdirSync(refsRoot, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const relativeName = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = path.join(refsRoot, entry.name);

      if (entry.isDirectory()) {
        return collectRefNodes(absolutePath, type, currentRef, relativeName);
      }

      const stat = fs.statSync(absolutePath);
      const target = fs.readFileSync(absolutePath, "utf8").trim();

      return [{
        id: `${type}:${relativeName}`,
        name: relativeName,
        path: type === "branch" ? `refs/heads/${relativeName}` : `refs/tags/${relativeName}`,
        type,
        lastModified: stat.mtime.toISOString(),
        target,
        isCurrent: currentRef.type === type && currentRef.name === relativeName,
      }];
    });
}

function getRepoRefs(repoRoot: string) {
  const currentRef = readCurrentRef(repoRoot);
  const branches = collectRefNodes(path.join(repoRoot, ".chz", "refs", "heads"), "branch", currentRef);
  const tags = collectRefNodes(path.join(repoRoot, ".chz", "refs", "tags"), "tag", currentRef);

  return {
    currentRef,
    branches,
    tags,
  };
}

function getCommitLogPath(repoRoot: string, branchName: string) {
  return path.join(repoRoot, ".chz", "logs", `${branchName}.log`);
}

function restoreLogMessage(message: string) {
  return message.replace(/\\n/g, "\n");
}

function parseCommitLogLine(line: string, branchName: string): RepoCommit | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\S+)\s{2}(\S+)\s{2}(.*?)\s{2}(\d+)\s{2}"([\s\S]*)"$/);
  if (!match) {
    return null;
  }

  const [, parentHash, commitHash, rawAuthor, rawTimestamp, rawMessage] = match;
  const timestampValue = Number(rawTimestamp);
  const author = rawAuthor.trim() || "Unknown author";
  const avatarSeed = author.replace(/<.*$/, "").trim() || author;
  const avatar = avatarSeed.charAt(0).toUpperCase() || "?";

  return {
    id: `${branchName}:${commitHash}`,
    hash: commitHash,
    shortHash: commitHash.slice(0, 7),
    parentHash,
    author,
    avatar,
    timestamp: Number.isFinite(timestampValue)
      ? new Date(timestampValue * 1000).toISOString()
      : new Date(0).toISOString(),
    message: restoreLogMessage(rawMessage),
    branch: branchName,
  };
}

function readBranchCommits(repoRoot: string, branchName: string): RepoCommit[] {
  const logPath = getCommitLogPath(repoRoot, branchName);

  if (!fs.existsSync(logPath)) {
    return [];
  }

  return fs
    .readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .map((line) => parseCommitLogLine(line, branchName))
    .filter((commit): commit is RepoCommit => Boolean(commit))
    .reverse();
}

function getCurrentBranchName(repoRoot: string) {
  const refs = getRepoRefs(repoRoot);

  return refs.currentRef.type === "branch"
    ? refs.currentRef.name
    : refs.branches[0]?.name ?? null;
}

function normalizeRefName(refName: unknown) {
  if (typeof refName !== "string" || refName.trim() === "") {
    throw new Error("Reference name is required");
  }

  const normalized = refName.trim();

  if (
    normalized.startsWith("/") ||
    normalized.includes("..") ||
    !/^[A-Za-z0-9._/-]+$/.test(normalized)
  ) {
    throw new Error("Branch or tag name is invalid");
  }

  return normalized;
}

function runChzCommand(repoRoot: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const chzBinaryPath = getChzBinaryPath();
    if (!chzBinaryPath) {
      reject(new Error("Core binary 'chz' is missing from the server."));
      return;
    }

    const child = spawn(chzBinaryPath, args, { cwd: repoRoot });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        const output = stderr || stdout || "Command failed";
        if (output.includes("Invalid Command") && args[0] === "clone") {
          reject(new Error("The installed chz binary does not support 'clone' yet. Build and wire the clone command before using repo sync."));
          return;
        }

        reject(new Error(output));
        return;
      }

      resolve();
    });
  });
}

function runChzRestore(repoRoot: string, repoUrl: string) {
  ensureDir(repoRoot);
  return runChzCommand(repoRoot, ["clone", repoUrl]);
}

async function ensureRepoHydrated(repoId: string) {
  const cachedTask = hydrationTasks.get(repoId);
  if (cachedTask) {
    return cachedTask;
  }

  const hydrationTask = (async () => {
    const repo = await getRepoData(BigInt(repoId));
    if (!repo) {
      throw new Error("Repository not found");
    }

    const repoRoot = getRepoRoot(repoId);
    if (isRepoCached(repoRoot)) {
      return { repo, repoRoot, cached: true };
    }

    ensureDir(repoRoot);

    if (!isRepoCached(repoRoot)) {
      const repoUrl = repo["r_url"];
      if (!repoUrl || typeof repoUrl !== "string") {
        throw new Error("Repository URL is missing");
      }

      await runChzRestore(repoRoot, repoUrl);
    }

    return { repo, repoRoot, cached: false };
  })();

  hydrationTasks.set(repoId, hydrationTask);

  try {
    return await hydrationTask;
  } finally {
    hydrationTasks.delete(repoId);
  }
}

async function ensureRepoLogReady(repoId: string) {
  const repo = await getRepoData(BigInt(repoId));
  if (!repo) {
    throw new Error("Repository not found");
  }

  const repoRoot = getRepoRoot(repoId);

  if (!hasRepoLogCache(repoRoot)) {
    throw new Error("Repository logs are not available locally");
  }

  return { repo, repoRoot, cached: true };
}

router.get("/repos/resolve/:owner/:repo", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const owner = Array.isArray(req.params.owner) ? req.params.owner[0] : req.params.owner;
    const repo = Array.isArray(req.params.repo) ? req.params.repo[0] : req.params.repo;
    const repository = await getRepoByOwnerAndName(owner, repo);

    if (!repository?.r_id) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    res.json({
      repoId: String(repository.r_id),
      repository,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to resolve repository",
    });
  }
});

router.post("/repos/:repoId/sync", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
    const { repoRoot, cached } = await ensureRepoHydrated(repoId);

    res.json({
      ok: true,
      repoId,
      repoRoot,
      cached,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync repository";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.get("/repos/:repoId/meta", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
    const { repo, repoRoot, cached } = await ensureRepoHydrated(repoId);
    const refs = getRepoRefs(repoRoot);
    const currentBranch = refs.currentRef.type === "branch"
      ? refs.currentRef.name
      : refs.branches[0]?.name ?? null;
    const latestCommit = currentBranch
      ? readBranchCommits(repoRoot, currentBranch)[0] ?? null
      : null;
    const numericRepoId = Number(repoId);
    const metrics = await getRepoMetrics(numericRepoId);
    const viewerId = req.user?.id ?? null;
    const stats = {
      ...(metrics ?? {}),
      viewerHasStarred: viewerId ? await isStarredRepo(viewerId, numericRepoId) : false,
      viewerIsWatching: viewerId ? await isWatchedRepo(viewerId, numericRepoId) : false,
    };

    res.json({
      repoId,
      name: typeof repo["r_name"] === "string" && repo["r_name"].trim() ? repo["r_name"] : `repo-${repoId}`,
      url: typeof repo["r_url"] === "string" ? repo["r_url"] : "",
      visibility:
        typeof repo["r_visibility"] === "boolean"
          ? (repo["r_visibility"] ? "Public" : "Private")
          : "Public",
      description:
        typeof repo["r_description"] === "string"
          ? repo["r_description"]
          : typeof repo["r_desc"] === "string"
            ? repo["r_desc"]
            : null,
      currentBranch,
      currentRef: refs.currentRef,
      branchCount: refs.branches.length,
      tagCount: refs.tags.length,
      branches: refs.branches,
      tags: refs.tags,
      readmePath: findReadmePath(repoRoot),
      updatedAt: getRepoUpdatedAt(repoRoot),
      latestCommit,
      stats,
      cached,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load repository metadata";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.get("/repos/:repoId/commits", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
    const requestedBranch = typeof req.query.branch === "string" ? req.query.branch.trim() : "";
    const { repoRoot } = await ensureRepoLogReady(repoId);
    const branchName = requestedBranch || getCurrentBranchName(repoRoot);

    if (!branchName) {
      res.json({
        repoId,
        branch: null,
        commits: [],
      });
      return;
    }

    const commits = readBranchCommits(repoRoot, branchName);

    res.json({
      repoId,
      branch: branchName,
      commits,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load repository commits";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.get("/repos/:repoId/tree", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
    const requestedPath = typeof req.query.path === "string" ? req.query.path : ".";
    const { repoRoot } = await ensureRepoHydrated(repoId);

    const targetPath = safeResolveRepoPath(repoRoot, requestedPath);
    const stat = fs.statSync(targetPath);

    if (!stat.isDirectory()) {
      res.status(400).json({ error: "Path is not a directory" });
      return;
    }

    const tree = buildDirectoryNode(repoRoot, targetPath);
    res.json(tree);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read repository tree";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.get("/repos/:repoId/file", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
    const requestedPath = typeof req.query.path === "string" ? req.query.path : "";
    const { repoRoot } = await ensureRepoHydrated(repoId);

    const targetPath = safeResolveRepoPath(repoRoot, requestedPath);
    const stat = fs.statSync(targetPath);

    if (!stat.isFile()) {
      res.status(400).json({ error: "Path is not a file" });
      return;
    }

    const relativePath = path.relative(repoRoot, targetPath);
    if (shouldIgnoreEntry(relativePath)) {
      res.status(400).json({ error: "Access to .chz is forbidden" });
      return;
    }

    const text = isLikelyTextFile(targetPath)
      ? fs.readFileSync(targetPath, "utf8")
      : undefined;

    res.json({
      id: relativePath,
      name: path.basename(targetPath),
      path: `/${relativePath}`,
      type: "file",
      size: stat.size,
      lastModified: stat.mtime.toISOString(),
      content: text,
      isBinary: text === undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read file";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.post("/repos/:repoId/checkout", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
    const refName = normalizeRefName(req.body?.refName);
    const { repoRoot } = await ensureRepoHydrated(repoId);

    await runChzCommand(repoRoot, ["checkout", refName]);

    res.json({
      ok: true,
      repoId,
      refName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to checkout reference";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.post("/repos/:repoId/star", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const repo = await getRepoData(BigInt(repoId));
    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const stats = await starRepo(userId, repoId);

    if (!stats) {
      res.status(500).json({ error: "Failed to toggle star" });
      return;
    }

    res.json({
      ok: true,
      stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle star";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.post("/repos/:repoId/watch", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const repo = await getRepoData(BigInt(repoId));
    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const stats = await watchRepo(userId, repoId);

    if (!stats) {
      res.status(500).json({ error: "Failed to toggle watch" });
      return;
    }

    res.json({
      ok: true,
      stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle watch";
    const status = getHttpStatusFromErrorMessage(message);
    res.status(status).json({
      error: message,
    });
  }
});

router.get("/repos/:repoId/pulls", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const repo = await getRepoData(BigInt(repoId));

    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const items = await getRepoPullRequests(BigInt(repoId));
    res.json({
      repoId,
      items: items ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pull requests";
    res.status(500).json({ error: message });
  }
});

router.post("/repos/:repoId/pulls", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const userId = req.user?.id;
    const title = toNonEmptyString(req.body?.title);
    const message = normalizeOptionalText(req.body?.message);

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const repo = await getRepoData(BigInt(repoId));
    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const createdId = await createRepoPullRequest(repoId, userId, title, message);
    if (!createdId) {
      res.status(500).json({ error: "Failed to create pull request" });
      return;
    }

    const created = await getRepoPullRequestById(repoId, Number(createdId));
    res.status(201).json({
      ok: true,
      item: created,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create pull request";
    res.status(500).json({ error: message });
  }
});

router.patch("/repos/:repoId/pulls/:pullRequestId", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const pullRequestId = Number(Array.isArray(req.params.pullRequestId) ? req.params.pullRequestId[0] : req.params.pullRequestId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await getRepoPullRequestById(repoId, pullRequestId);
    if (!existing) {
      res.status(404).json({ error: "Pull request not found" });
      return;
    }

    const canManage = await canManageRepoWorkItem(repoId, userId, Number(existing.acc_id));
    if (!canManage) {
      res.status(403).json({ error: "You do not have permission to manage this pull request" });
      return;
    }

    const title = toNonEmptyString(req.body?.title) ?? existing.pr_name;
    const message = typeof req.body?.message === "string" ? normalizeOptionalText(req.body.message) : existing.pr_msg;
    const isOpen = typeof req.body?.isOpen === "boolean" ? req.body.isOpen : existing.pr_isopen;
    const status = normalizePullRequestStatus(req.body?.status ?? existing.pr_status, isOpen);

    const updated = await updateRepoPullRequest(repoId, pullRequestId, title, message, isOpen, status);
    if (!updated) {
      res.status(500).json({ error: "Failed to update pull request" });
      return;
    }

    const item = await getRepoPullRequestById(repoId, pullRequestId);
    res.json({
      ok: true,
      item,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update pull request";
    res.status(500).json({ error: message });
  }
});

router.delete("/repos/:repoId/pulls/:pullRequestId", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const pullRequestId = Number(Array.isArray(req.params.pullRequestId) ? req.params.pullRequestId[0] : req.params.pullRequestId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await getRepoPullRequestById(repoId, pullRequestId);
    if (!existing) {
      res.status(404).json({ error: "Pull request not found" });
      return;
    }

    const canManage = await canManageRepoWorkItem(repoId, userId, Number(existing.acc_id));
    if (!canManage) {
      res.status(403).json({ error: "You do not have permission to delete this pull request" });
      return;
    }

    const deleted = await deleteRepoPullRequest(repoId, pullRequestId);
    if (!deleted) {
      res.status(500).json({ error: "Failed to delete pull request" });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete pull request";
    res.status(500).json({ error: message });
  }
});

router.get("/repos/:repoId/issues", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const repo = await getRepoData(BigInt(repoId));

    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const items = await getRepoIssues(repoId);
    res.json({
      repoId,
      items: items ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load issues";
    res.status(500).json({ error: message });
  }
});

router.post("/repos/:repoId/issues", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const userId = req.user?.id;
    const title = toNonEmptyString(req.body?.title);
    const message = normalizeOptionalText(req.body?.message);

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const repo = await getRepoData(BigInt(repoId));
    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const createdId = await createRepoIssue(repoId, userId, title, message);
    if (!createdId) {
      res.status(500).json({ error: "Failed to create issue" });
      return;
    }

    const created = await getRepoIssueById(repoId, Number(createdId));
    res.status(201).json({
      ok: true,
      item: created,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create issue";
    res.status(500).json({ error: message });
  }
});

router.patch("/repos/:repoId/issues/:issueId", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const issueId = Number(Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await getRepoIssueById(repoId, issueId);
    if (!existing) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    const canManage = await canManageRepoWorkItem(repoId, userId, Number(existing.acc_id));
    if (!canManage) {
      res.status(403).json({ error: "You do not have permission to manage this issue" });
      return;
    }

    const title = toNonEmptyString(req.body?.title) ?? existing.i_name;
    const message = typeof req.body?.message === "string" ? normalizeOptionalText(req.body.message) : existing.i_msg;
    const isOpen = typeof req.body?.isOpen === "boolean" ? req.body.isOpen : existing.i_open;

    const updated = await updateRepoIssue(repoId, issueId, title, message, isOpen);
    if (!updated) {
      res.status(500).json({ error: "Failed to update issue" });
      return;
    }

    const item = await getRepoIssueById(repoId, issueId);
    res.json({
      ok: true,
      item,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update issue";
    res.status(500).json({ error: message });
  }
});

router.delete("/repos/:repoId/issues/:issueId", authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = Number(Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId);
    const issueId = Number(Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await getRepoIssueById(repoId, issueId);
    if (!existing) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    const canManage = await canManageRepoWorkItem(repoId, userId, Number(existing.acc_id));
    if (!canManage) {
      res.status(403).json({ error: "You do not have permission to delete this issue" });
      return;
    }

    const deleted = await deleteRepoIssue(repoId, issueId);
    if (!deleted) {
      res.status(500).json({ error: "Failed to delete issue" });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete issue";
    res.status(500).json({ error: message });
  }
});

router.post("/execute", authGuard, (req: AuthenticatedRequest, res: Response): void => {
  const { command, args = [] }: { command: string; args: string[] } = req.body;
  const userId = req.user?.id;

  if (!command) {
    res.status(400).json({ error: "No command provided" });
    return;
  }

  const chzBinaryPath = getChzBinaryPath();
  if (!chzBinaryPath) {
    res.status(500).json({ error: "Core binary 'chz' is missing from the server." });
    return;
  }

  const userWorkspace = path.join(WORKSPACE_BASE, `user_${userId}`);

  if (!fs.existsSync(userWorkspace)) {
    fs.mkdirSync(userWorkspace, { recursive: true });
  }

  const spawnArgs = [command, ...args];
  let output = "";
  let errorOutput = "";

  console.log(`[User ${userId}] Executing: chz ${spawnArgs.join(" ")} in ${userWorkspace}`);

  const child = spawn(chzBinaryPath, spawnArgs, { cwd: userWorkspace });

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`[User ${userId} Error]:`, data.toString());
  });

  child.on("close", (code) => {
    if (code !== 0) {
      res.status(500).json({
        error: "Command failed",
        details: errorOutput || output
      });
      return;
    }

    res.json({
      result: output,
      workspace: userWorkspace
    });
  });
});

export default router;
