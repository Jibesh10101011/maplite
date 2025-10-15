import { type Server as HttpServer } from "http";
import initializeSocketServer from "./socketServer";

export default function initializeSocket(server: HttpServer) {
  return initializeSocketServer(server);
}
