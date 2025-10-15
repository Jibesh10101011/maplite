import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import { connectDatabase } from "./database";
import initializeSocket from "./socket";

const PORT = process.env.PORT!;

const startServer = async() => {
  try {

    const server = http.createServer(app);
    initializeSocket(server);

    await connectDatabase();
    server.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch(error) {
    console.log("MONGO db connection failed !!! ", error);
    process.exit(1);
  }
};

startServer();

