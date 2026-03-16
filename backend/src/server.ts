import express, { Request, Response } from 'express';
<<<<<<< HEAD
import cEngine from "./c-engine";

const app = express();
const PORT = 3000;
app.use("/api", cEngine);

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'"
    );
    next();
});
=======
import chzRouter from "./c-engine";

const app = express();
const PORT = 3000;

app.use(express.json());
>>>>>>> 00b3c8e377521d264bd90ab4944b88ef60fe4c04

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Backend!');
});

<<<<<<< HEAD
=======
app.use("/api", chzRouter);
>>>>>>> 00b3c8e377521d264bd90ab4944b88ef60fe4c04

app.listen(PORT, () => {
    console.log (`server running on http://localhost:${PORT}`);
});
