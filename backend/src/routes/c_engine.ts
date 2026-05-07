import { spawn } from "child_process";
import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { authGuard, AuthenticatedRequest } from "../middleware/authGuard";
import { ensureDir } from "./repo"

const router = Router();

const CHZ_BINARY_CANDIDATES = [
  path.resolve(__dirname, "../../../build/chz"),
  path.resolve(__dirname, "../../binaries/chz"),
];

const WORKSPACE_BASE = path.resolve(__dirname, "../../tmp/workspaces");

export function getHttpStatusFromErrorMessage(message: string) {
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

function getChzBinaryPath() {
  return CHZ_BINARY_CANDIDATES.find((candidate) => fs.existsSync(candidate)) ?? null;
}

export function runChzCommand(repoRoot: string, args: string[]): Promise<void> {
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
        reject(new Error(output));
        return;
      }

      resolve();
    });
  });
}

export function runBinaryCommand(binaryPath: string, cwd: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args, { cwd });

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
        reject(new Error(stderr || stdout || "Command failed"));
        return;
      }

      resolve();
    });
  });
}

export function runChzClone(repoRoot: string, repoUrl: string) {
  ensureDir(repoRoot);
  return runChzCommand(repoRoot, ["clone", repoUrl]);
}

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