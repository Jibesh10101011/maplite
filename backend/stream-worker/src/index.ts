import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import locationRouter from "./routes/location.routes"
import * as bodyParser from "body-parser";
import { connectProducer } from "./kafka/producer";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/v1/location", locationRouter);
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});


async function startServer() {
  try {
    await connectProducer();
    app.listen(PORT, () => {
      console.log(`stream-worker running on PORT: ${PORT}`);
      console.log(`API ENDPOINT: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
