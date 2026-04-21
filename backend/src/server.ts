import express from "express";
const cors = require("cors");
import cEngine from "./routes/c_engine";
import { getRepoData, getRepoId, getRepoPullRequests, getUserPasswordEmail, getUserPasswordName, getUserRepos} from "./routes/database";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api", cEngine);

console.log("C engine router mounted correctly");

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api/hello", (req, res) => {
    res.json({ message: "Backend says hi " });
});

app.get("/api/password/username/:username", async (req, res) =>{
    try{
        const pass = await getUserPasswordName([req.params.username]);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});

app.get("/api/repo/id/:url", async (req, res) =>{
    try{
        const pass = await getRepoId([req.params.url]);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});

app.get("/api/repo/data/:id", async (req, res) =>{
    try{
        const repoId = BigInt(req.params.id);
        const pass = await getRepoData([repoId]);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});

app.get("/api/repo/pr/:id", async (req, res) =>{
    try{
        const repoId = BigInt(req.params.id);
        const pass = await getRepoPullRequests([repoId]);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});

app.get("/api/user/repos/:username", async (req, res) =>{
    try{
        const pass = await getUserRepos([req.params.username]);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});


app.listen(3000, () => console.log("server running on port 3000"));