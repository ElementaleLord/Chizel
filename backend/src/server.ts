import express from "express";
import cors from "cors";
import cEngine from "./routes/c_engine";
import authRoutes from "./routes/auth";
import { getRepoData, getRepoId, getRepoPullRequests, getUserPasswordEmail, getUserPasswordName, getUserRepos} from "./routes/database";


const app = express();

app.use(cors({origin: process.env.VITE_API_URL, credentials: true}));
app.use(express.json());
app.use("/api", cEngine);
app.use("/auth", authRoutes);

console.log("C engine router mounted correctly");

//git command sanitzation, WIP
//app.post('/git-command', authGuard, (req, res) => {
//    res.json({ message: `Executing command for ${req.user?.username}` });
//});

app.get("/api/password/username/:username", async (req, res) =>{
    try{
        const pass = await getUserPasswordName(req.params.username);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});

app.get("/api/repo/id/:url", async (req, res) =>{
    try{
        const pass = await getRepoId(req.params.url);
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
        const pass = await getRepoData(repoId);
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
        const pass = await getRepoPullRequests(repoId);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});

app.get("/api/user/repos/:username", async (req, res) =>{
    try{
        const pass = await getUserRepos(req.params.username);
        res.json(pass);
        console.log(pass);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Database query failure"});
    }
});


app.listen(3000, () => console.log("server running on port 3000"));
