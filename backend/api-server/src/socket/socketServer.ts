import { type Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { redisClient } from "../config/redisClient";
import { ChatMessage, ReceivedMessage } from "../types/socket";

export default function initializeSocket(server: HttpServer) {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket: Socket) => {
        console.log("New client connected: ", socket.id);

        socket.on("subscribe", async (roomId: string) => {
            if (!roomId) return;
            socket.join(roomId);
            console.log(`Client joined room: ${roomId}`);
            try {
                const messages = await redisClient.lrange(`chat:${roomId}`, 0, -1);
                const parsedMessages: ChatMessage[] = messages.map((msg) => JSON.parse(msg));
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
           console.log("Client disconnected:", socket.id); 
        });

    });

    return io;
}