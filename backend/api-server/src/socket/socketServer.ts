import { Server as SocketIoServer, type Socket } from "socket.io";
import { redisClient } from "../config/redisClient";
import { ChatMessage, ReceivedMessage } from "../types/socket";

export function initializeChatSocketServer(io: SocketIoServer) {
  const chatNamespace = io.of("/chat");

  chatNamespace.on("connection", (socket: Socket) => {
    console.log("Chat: new client connected: ", socket.id);

    socket.on("subscribe", async (roomId: string) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`Chat: client joined room: ${roomId}`);
      try {
        const messages = await redisClient.lrange(`chat:${roomId}`, 0, -1);
        const parsedMessages: ChatMessage[] = messages.map((msg) =>
          JSON.parse(msg)
        );
        socket.emit("previous_messages", parsedMessages);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
    });

    socket.on("send_message", async (data: ReceivedMessage) => {
      const { roomId, message, sender, type } = data;
      if (!roomId || !message) {
        console.warn("Room ID or message missing.");
        return;
      }

      const newMessage: ChatMessage = {
        sender,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      try {
        // Save & trim Redis list to last 50 messages
        await redisClient.rpush(`chat:${roomId}`, JSON.stringify(newMessage));
        await redisClient.ltrim(`chat:${roomId}`, -50, -1);

        console.log(`Message saved to ${roomId}:`, newMessage);
        io.to(roomId).emit("chat_message", newMessage);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Chat: client disconnected:", socket.id);
    });
  });

  return io;
}

export function initializeMapSocketServer(io: SocketIoServer) {
  const mapNamespace = io.of("/map");

  mapNamespace.on("connection", (socket: Socket) => {
    console.log("Map: new client connected");
    socket.on("subscribe", async (roomId: string) => {
      if (!roomId) return;
      socket.join(`coordinate:${roomId}`);
      console.log(`Map: client joined room: ${roomId}`);
      try {
        const roomCoordinateKeys = await redisClient.keys(
          `coordinates:${roomId}:*`
        );
        if (roomCoordinateKeys.length == 0) return;
        
        const allUserData = (
          await Promise.all(
            roomCoordinateKeys.map(async (key) => {
              const userId = key.split(":")[2];
              const rawData = await redisClient.get(key);
              if (!rawData) return null;

              const parsed = JSON.parse(rawData);
              return {
                roomId,
                userId,
                routeCoordinates: parsed.routeCoordinates || [],
              };
            })
          )
        ).filter(Boolean);
        console.log("Emmitted: ", allUserData);
        socket.emit("shortest-path-coordinates-history", allUserData);
      } catch (error) {
        console.error("Error fetching user history: ", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Map: client disconnected:", socket.id);
    });
  });

  return io;
}
