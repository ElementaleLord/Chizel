import { spawn } from "child_process";
<<<<<<< HEAD
import { Router } from "express";
import path = require("path");
import fs from "fs";
import { exit } from "process";

const router = Router();
const cwd = path.resolve("/tmp/test_repo");
console.log("Does CWD exist?", fs.existsSync(cwd));
if(!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });

const init = path.resolve(__dirname, "../../build/init");
console.log("Binary path:", init);

router.get("/c_engine", (req, res) => {

    const absolutInit = path.resolve(__dirname, "../../build/init");

    console.log("--- DEBUG START ---");
    console.log("Binary exists at: ", absolutInit, fs.existsSync(absolutInit));
    console.log("Target cwd: ", cwd);
    console.log("target cwd exists: ", fs.existsSync(cwd));
    console.log("--- DEBUG END ---");

    const process = spawn(init,[],{cwd});
=======
import { Router } from "express"

const router = Router();

router.get("/chiz_engine", (req, res) => {

    const process = spawn("../../build/init",[], {cwd: "tmp/testrepo"});
>>>>>>> 00b3c8e377521d264bd90ab4944b88ef60fe4c04

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
