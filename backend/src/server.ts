import express, { Request, Response } from 'express';
import chzRouter from "./c-engine";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Backend!');
});

app.use("/api", chzRouter);

app.listen(PORT, () => {
    console.log (`server running on http://localhost:${PORT}`);
});
