import { type Server as SocketIoServer  } from "socket.io";
import { 
  initializeMapSocketServer
} from "./socket-server";


export function initializeSocketHandlers(io: SocketIoServer) {
  initializeMapSocketServer(io);
}