import { spawn } from "child_process";
import { Router } from "express";
import path = require("path");
import fs from "fs";

const router = Router();
const cwd = path.resolve("/tmp/test_repo");
console.log("Does CWD exist?", fs.existsSync(cwd));
if(!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });

const init = path.resolve(__dirname, "../../build/init");
console.log("Binary path:", init);

router.get("/c_engine", (req, res) => {

    const absolutInit = path.resolve(__dirname, "../../build/init");
    const process = spawn(init,[],{cwd});

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
