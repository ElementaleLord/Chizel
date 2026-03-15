import { spawn } from "child_process";
import { Router } from "express"

const router = Router();

router.get("/chiz_engine", (req, res) => {

    const process = spawn("../../build/init",[], {cwd: "tmp/testrepo"});

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
