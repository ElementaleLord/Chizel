import express from "express";
import cors from "cors";
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api/hello", (req, res) => {
    res.json({ message: "Backend says hi " });
});

app.listen(3000, () => console.log("server running on port 3000"));
