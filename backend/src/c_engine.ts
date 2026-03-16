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


router.get("/c_engine", (req, res) => {

    const absolutInit = path.resolve(__dirname, "../../build/init");

    let output = "";

    process.stdout.on("data", (data) => {
        output += data.toString();
    });


    process.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    process.on("close", () => {
        res.json({
            result: output
        });
    }); 
});

export default router;
