import express, {type Request, type Response} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import roomRouter from "./routes/room.route";
import uploadRouter from "./routes/upload.route";
import locationRouter from "./routes/location.route";

const app = express();

app.use(
    cors({
        origin: "*",
        // credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: process.env.URL_ENCODED_LIMIT! }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v2/auth", authRouter);
app.use("/api/v2/room", roomRouter);
app.use("/api/v2/upload", uploadRouter);
app.use("/api/v2/location", locationRouter);

app.get("/api/v2/test", (request: Request, response: Response) => {
    return response.status(200).json({
        message: "Hello, I am server"
    });
});

export default app;

