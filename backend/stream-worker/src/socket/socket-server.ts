import { Server as SocketIoServer, type Socket } from "socket.io";
import {
  RecivedCoordinateData,
} from "../types/socket";
import { connectProducer } from "../kafka/producer";

export function initializeMapSocketServer(io: SocketIoServer) {

  const mapNamespace = io.of("/map");
  mapNamespace.on("connection", (socket: Socket) => {
    console.log("Map: new client connected");   
    socket.on("receive_location", async (data: RecivedCoordinateData) => {
        try {
            const producer = await connectProducer();      
            await producer.send({
                topic: "location-topic",
                messages: [{ value: JSON.stringify(data) }],
            });  
        } catch (error) {
            console.log("Kafka Producer connection error");
        }

    })
    socket.on("disconnect", () => {
      console.log("Map: client disconnected:", socket.id);
    });
  });

  return io;
}
