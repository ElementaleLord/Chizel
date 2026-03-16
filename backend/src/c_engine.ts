import { spawn } from "child_process";
import { Router } from "express";
import path = require("path");
import fs from "fs";
//fs = file system

const router = Router();
const cwd = path.resolve("/tmp/test_repo");

const buildDir = path.resolve("../../build");

const getCommands = () => {

    const commands: Record<string, string> = {};
    if(fs.existsSync(buildDir))
    {
        const files = fs.readdirSync(buildDir);
        files.forEach( file => {
            const fullpath = path.join(buildDir, file);
            if(fs.lstatSync(fullpath).isFile())
            {
                commands[file] = fullpath;
            }
        });
    }
    return commands;
}

console.log("Does CWD exist?", fs.existsSync(cwd));
if(!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });

router.post("/c_engine", (req, res) => {

    const commandName = req.body.message;
    const commands = getCommands();
    const binaryPath = commands[commandName];

    if(!binaryPath){
        return res.status(404).json({ error: "Command not recognized" });
    }

    if(!fs.existsSync(binaryPath)){
        return res.status(500).json({ error: "Binary file missing from build folder" });
    }

    let output = "";
    const child = spawn(binaryPath);

    child.stdout.on("data", (data) => {
        output += data.toString();
    });

    child.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    child.on("close", () => {
        res.json({
            result: output
        });
    }); 
});

export default router;
