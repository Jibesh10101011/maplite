import express, {type Request, type Response} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN!,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: process.env.URL_ENCODED_LIMIT! }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (request: Request, response: Response) => {
    return response.status(200).json({
        message: "Hello, I am server"
    });
});

export default app;

