import { type Server as SocketIoServer  } from "socket.io";
import { 
  initializeChatSocketServer, 
  initializeMapSocketServer
} from "./socketServer";


export function initializeSocketHandlers(io: SocketIoServer) {
  initializeChatSocketServer(io);
  initializeMapSocketServer(io);
}