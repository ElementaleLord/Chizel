import { spawn } from "child_process";
import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { authGuard, AuthenticatedRequest } from "../middleware/authGuard";

const router = Router();

const CHZ_BINARY_PATH = path.resolve(__dirname, "../../binaries/chz"); 
const WORKSPACE_BASE = path.resolve(__dirname, "../../tmp/workspaces");

router.post("/execute", authGuard, (req: AuthenticatedRequest, res: Response): void => {
    
    const { command, args = [] } : { command: string, args: string[] } = req.body;
    const userId = req.user?.id;

    if (!command) {
        res.status(400).json({ error: "No command provided" });
        return;
    }

    if (!fs.existsSync(CHZ_BINARY_PATH)) {
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

    const child = spawn(CHZ_BINARY_PATH, spawnArgs, { cwd: userWorkspace });   

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
