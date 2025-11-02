import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import locationRouter from "./routes/location.routes"
import * as bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: "*",
        // credentials: true
    })
);

app.use(bodyParser.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/v1/location", locationRouter);
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

export default app;