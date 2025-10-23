import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import { connectDatabase } from "./database";
import { 
  initializeSocketHandlers
} from "./socket";
import { initSubscriber } from "./redis/subscriber";
import { Server as SocketIoServer } from "socket.io";

const PORT = process.env.PORT!;

const startServer = async() => {
  try {

    const server = http.createServer(app);
    
    // Initialize socketIo
    const io = new SocketIoServer(server, {
      cors: {
        origin: "*"
      }
    });

    initializeSocketHandlers(io);

    await initSubscriber(io);
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

