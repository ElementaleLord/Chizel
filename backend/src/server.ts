import express from "express";
const cors = require("cors");
import cEngine from "./routes/c_engine";

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

app.listen(3000, () => console.log("server running on port 3000"));
