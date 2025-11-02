import { connectProducer } from "./kafka/producer";
import http from "http";
import { Server as SocketIoServer } from "socket.io";
import { initializeSocketHandlers } from "./socket";
import app from "./app";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectProducer();
    const server = http.createServer(app);
    const io = new SocketIoServer(server, {
      cors: {
        origin: "*"
      }
    });

    initializeSocketHandlers(io);
    server.listen(PORT, () => {
      console.log(`stream-worker running on PORT: ${PORT}`);
      console.log(`API ENDPOINT: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
