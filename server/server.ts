import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db";

const app = express();
//Dtabase connection
await connectDB();

// Middleware
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
//Global error handling middleware
app.use((err:any, req: Request, res: Response,next:NextFunction) => {
    console.error(err);
    res.status(500).send(err?.response?.data?.message||err?.message);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});