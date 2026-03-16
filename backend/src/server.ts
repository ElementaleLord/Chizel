import express from "express";
import cors from "cors";
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express);

app.get("api/hello", (req, res) => {
    res.json({ message: "Backend says your ssn is 751 26 9855" });
});

app.listen(3000, () => console.log("server running on port 3000"));
